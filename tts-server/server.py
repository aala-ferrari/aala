#!/usr/bin/env python3
"""
Server voce locale per l'albanese (e altre lingue MMS) — Meta MMS-TTS.
Gira sul Mac, gratis, offline, illimitato. La Bolla (Next /api/tts) lo chiama.

Avvio:  ./.venv/bin/python server.py
Porta:  5005  (POST /tts  body {"text": "...", "locale": "sq"} → audio WAV)
"""
import io
import json
import os
import re
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
import pyworld as pw
import torch
from transformers import AutoTokenizer, VitsModel

PORT = 5005
# Femminilizzazione con vocoder WORLD: alza tono (F0) E formanti → voce
# femminile naturale, non metallica. La voce MMS albanese è maschile.
# Regolabili: 1.0 = originale maschile. Più alti = più femminile.
PITCH_RATIO = float(os.environ.get("TTS_PITCH_RATIO", "1.55"))  # tono (F0)
FORMANT = float(os.environ.get("TTS_FORMANT", "1.16"))  # timbro (vocal tract)


def feminize(audio: np.ndarray, sr: int) -> np.ndarray:
    """Alza tono e formanti con WORLD per un timbro femminile naturale."""
    if PITCH_RATIO == 1.0 and FORMANT == 1.0:
        return audio
    x = np.ascontiguousarray(audio, dtype=np.float64)
    f0, t = pw.harvest(x, sr)
    sp = pw.cheaptrick(x, f0, t, sr)  # inviluppo spettrale (formanti)
    ap = pw.d4c(x, f0, t, sr)  # aperiodicità
    # tono più alto
    f0_new = f0 * PITCH_RATIO
    # formanti più alte: deformo l'inviluppo lungo l'asse frequenza
    dim = sp.shape[1]
    idx = np.arange(dim)
    src = np.clip(idx / FORMANT, 0, dim - 1)
    lo = np.floor(src).astype(int)
    hi = np.minimum(lo + 1, dim - 1)
    frac = src - lo
    sp_new = sp[:, lo] * (1 - frac) + sp[:, hi] * frac
    y = pw.synthesize(f0_new, np.ascontiguousarray(sp_new), ap, sr)
    return y.astype(np.float32)

# modelli MMS-TTS di Meta per lingua (si scaricano da soli al primo uso)
MODELS = {
    "sq": "facebook/mms-tts-sqi",  # albanese (femminile, neurale)
}

_loaded = {}  # cache: locale -> (model, tokenizer)

# ── Numeri in parole albanesi (il modello MMS non legge bene le cifre) ──
_U = ["zero", "një", "dy", "tre", "katër", "pesë", "gjashtë", "shtatë", "tetë", "nëntë"]
_TEENS = ["dhjetë", "njëmbëdhjetë", "dymbëdhjetë", "trembëdhjetë", "katërmbëdhjetë",
          "pesëmbëdhjetë", "gjashtëmbëdhjetë", "shtatëmbëdhjetë", "tetëmbëdhjetë",
          "nëntëmbëdhjetë"]
_TENS = {2: "njëzet", 3: "tridhjetë", 4: "dyzet", 5: "pesëdhjetë", 6: "gjashtëdhjetë",
         7: "shtatëdhjetë", 8: "tetëdhjetë", 9: "nëntëdhjetë"}


def _two(n):  # 0..99
    if n < 10:
        return _U[n]
    if n < 20:
        return _TEENS[n - 10]
    t, u = divmod(n, 10)
    return _TENS[t] + (" e " + _U[u] if u else "")


def _three(n):  # 0..999
    if n < 100:
        return _two(n)
    h, rem = divmod(n, 100)
    head = "njëqind" if h == 1 else _U[h] + "qind"
    return head + (" e " + _two(rem) if rem else "")


def alb_number(n):  # 0..999_999_999
    if n < 1000:
        return _three(n)
    if n < 1_000_000:
        th, rem = divmod(n, 1000)
        head = "një mijë" if th == 1 else _three(th) + " mijë"
        return head + (" e " + _three(rem) if rem else "")
    mil, rem = divmod(n, 1_000_000)
    head = "një milion" if mil == 1 else alb_number(mil) + " milion"
    return head + (" e " + alb_number(rem) if rem else "")


def normalize_text(text):
    """Sistema cifre/prezzi per la lettura albanese."""
    # togli il punto delle migliaia (1.600 → 1600) per sicurezza
    text = re.sub(r"(\d)\.(?=\d{3}(\D|$))", r"\1", text)
    # € → euro (l'importo si dice prima, poi 'euro')
    text = re.sub(r"€\s*(\d+)", r"\1 euro", text)
    text = re.sub(r"(\d+)\s*€", r"\1 euro", text)
    # numeri interi → parole albanesi
    text = re.sub(r"\d+", lambda m: alb_number(int(m.group())), text)
    return text


def split_sentences(text):
    """Spezza in frasi tenendo la punteggiatura finale (per intonazione + pause)."""
    parts = re.findall(r"[^.!?…\n]+[.!?…]*", text)
    return [p.strip() for p in parts if p.strip()]


def get_model(locale: str):
    if locale not in MODELS:
        return None
    if locale not in _loaded:
        name = MODELS[locale]
        print(f"[tts] carico {name} … (la prima volta scarica ~150MB)")
        model = VitsModel.from_pretrained(name)
        tok = AutoTokenizer.from_pretrained(name)
        model.eval()
        _loaded[locale] = (model, tok)
        print(f"[tts] {name} pronto ✓")
    return _loaded[locale]


def _say(model, tok, sentence):
    inputs = tok(sentence, return_tensors="pt")
    with torch.no_grad():
        wav = model(**inputs).waveform  # (1, N) float32 in [-1,1]
    return wav.squeeze().cpu().numpy().astype(np.float32)


def synth_wav(text: str, locale: str) -> bytes | None:
    pair = get_model(locale)
    if pair is None:
        return None
    model, tok = pair
    sr = int(model.config.sampling_rate)

    text = normalize_text(text)  # cifre/prezzi → parole albanesi
    sentences = split_sentences(text) or [text]

    # pausa tra le frasi (un po' più lunga dopo ? e !)
    gap = np.zeros(int(sr * 0.30), dtype=np.float32)
    gap_strong = np.zeros(int(sr * 0.42), dtype=np.float32)
    pieces = []
    for i, s in enumerate(sentences):
        pieces.append(_say(model, tok, s))
        if i < len(sentences) - 1:
            pieces.append(gap_strong if s.endswith(("?", "!")) else gap)
    audio = np.concatenate(pieces) if pieces else np.zeros(1, dtype=np.float32)

    audio = feminize(audio, sr)  # tono + formanti (no-op se 1.0/1.0)
    # normalizza per evitare clipping dopo l'elaborazione
    peak = float(np.max(np.abs(audio))) if audio.size else 0.0
    if peak > 1.0:
        audio = audio / peak

    pcm = np.clip(audio, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype("<i2")
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    return buf.getvalue()


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body=b"", ctype="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if body:
            self.wfile.write(body)

    def log_message(self, *args):
        pass  # silenzio

    def do_GET(self):
        if self.path == "/health":
            self._send(200, json.dumps({"ok": True}).encode())
        else:
            self._send(404)

    def do_POST(self):
        if self.path != "/tts":
            return self._send(404)
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n) or b"{}")
            text = (data.get("text") or "").strip()[:4000]
            locale = (data.get("locale") or "sq")[:2]
            if not text:
                return self._send(400, b'{"error":"no text"}')
            audio = synth_wav(text, locale)
            if audio is None:
                return self._send(404, b'{"error":"locale not supported"}')
            self._send(200, audio, "audio/wav")
        except Exception as e:  # noqa
            self._send(500, json.dumps({"error": str(e)}).encode())


if __name__ == "__main__":
    print(f"[tts] server voce locale su http://127.0.0.1:{PORT}")
    print("[tts] pre-carico l'albanese…")
    get_model("sq")  # pre-carica così la prima richiesta è già veloce
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
