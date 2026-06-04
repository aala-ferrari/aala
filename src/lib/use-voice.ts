'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// locale del sito → codice lingua per voce (riconoscimento + sintesi)
const VOICE_LANG: Record<string, string> = {
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  sq: 'sq-AL', // albanese: supporto browser limitato → fallback gestito sotto
};

/**
 * Voce per la Bolla: l'utente parla (speech-to-text) e la Bolla risponde a voce
 * (text-to-speech), nella lingua del sito. Usa le Web Speech API native del
 * browser (gratis, niente chiavi). Degrada con grazia se non supportate.
 */
export function useVoice(locale: string) {
  const lang = VOICE_LANG[locale] ?? 'it-IT';
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recogRef = useRef<unknown>(null);

  const sttSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Pre-carica le voci appena il componente è montato: così al PRIMO click
  // sull'altoparlante la lettura parte subito (le voci si caricano in modo
  // asincrono; senza warm-up il primo speak veniva rimandato e perdeva il
  // gesto utente → serviva un secondo click).
  useEffect(() => {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    const warm = () => synth.getVoices();
    warm();
    synth.addEventListener?.('voiceschanged', warm);
    return () => synth.removeEventListener?.('voiceschanged', warm);
  }, [ttsSupported]);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!sttSupported) return;
      const SR: any =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const r = new SR();
      r.lang = lang;
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (e: any) => {
        const text = e?.results?.[0]?.[0]?.transcript ?? '';
        if (text) onResult(text);
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      recogRef.current = r;
      setListening(true);
      try {
        r.start();
      } catch {
        setListening(false);
      }
    },
    [lang, sttSupported]
  );

  const stopListening = useCallback(() => {
    try {
      (recogRef.current as any)?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!ttsSupported || !text) return;
      const synth = window.speechSynthesis;

      const run = () => {
        synth.resume(); // se in pausa per policy del browser
        const voices = synth.getVoices();
        const two = lang.slice(0, 2).toLowerCase();
        // tra le voci della lingua, preferisci quelle "premium/enhanced/natural"
        // (suonano meno robotiche delle "compact" di sistema)
        const ofLang = voices.filter(
          (vo) =>
            vo.lang?.toLowerCase().startsWith(locale) ||
            vo.lang === lang ||
            vo.lang?.toLowerCase().startsWith(two)
        );
        const nicer = /premium|enhanced|natural|neural|siri/i;
        const v = ofLang.find((vo) => nicer.test(vo.name)) || ofLang[0];

        // Chrome tronca la sintesi lunga (~15s): leggo frase per frase, e
        // concateno (la frase dopo parte SOLO quando finisce la precedente).
        // Questo è più robusto del mettere tutte le frasi in coda insieme.
        const chunks = (text.match(/[^.!?…\n]+[.!?…]*\s*/g) || [text])
          .map((c) => c.trim())
          .filter(Boolean);
        let i = 0;
        let guard: ReturnType<typeof setTimeout> | null = null;
        setSpeaking(true);
        const next = () => {
          if (guard) {
            clearTimeout(guard);
            guard = null;
          }
          if (i >= chunks.length) {
            setSpeaking(false);
            return;
          }
          const chunk = chunks[i];
          const idx = i;
          i += 1;
          const u = new SpeechSynthesisUtterance(chunk);
          u.lang = lang;
          if (v) u.voice = v;
          // domanda → tono più alto; micro-variazioni = meno monotono
          const isQuestion = /\?\s*$/.test(chunk);
          u.pitch = (isQuestion ? 1.12 : 1.04) + (idx % 2 === 0 ? 0.02 : -0.02);
          u.rate = 1.0;
          let advanced = false;
          const advance = () => {
            if (advanced) return; // onend o watchdog: passa una volta sola
            advanced = true;
            next();
          };
          u.onend = advance; // la frase dopo parte qui
          u.onerror = advance;
          synth.speak(u);
          // rete di sicurezza: se onend non scatta (alcune voci non lo emettono),
          // avanza comunque dopo una stima generosa della durata della frase.
          guard = setTimeout(advance, 1500 + chunk.length * 90);
        };
        next();
      };

      // Sempre: pulisci la coda, POI parti dopo un attimo.
      // Chrome ha un bug: speak() subito dopo cancel() viene "ingoiato" e non
      // parte — era la causa del "serve premere due volte". Il piccolo ritardo
      // (la pagina ha già il gesto utente dal click) lo risolve.
      synth.cancel();
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        run();
      };
      if (synth.getVoices().length === 0) {
        synth.addEventListener('voiceschanged', () => setTimeout(go, 60), {
          once: true,
        });
        setTimeout(go, 350); // fallback se l'evento non scatta
      } else {
        setTimeout(go, 130); // attimo dopo il cancel
      }
    },
    [lang, locale, ttsSupported]
  );

  const cancelSpeak = useCallback(() => {
    if (ttsSupported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [ttsSupported]);

  return {
    sttSupported,
    ttsSupported,
    listening,
    speaking,
    startListening,
    stopListening,
    speak,
    cancelSpeak,
  };
}
