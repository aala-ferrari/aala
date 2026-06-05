# 🎙️ Voce della Bolla — architettura TTS

Come la Bolla di AALA parla in 6 lingue, **senza mischiare** le voci e rispettando
intonazione, pause, punteggiatura e numeri/prezzi in ogni lingua.

## Chi parla quale lingua

| Lingua | Motore TTS | Voce | Dove |
|---|---|---|---|
| 🇦🇱 Albanese (`sq`) | **Server locale Meta MMS-TTS** | maschile neurale | questo server (porta 5005) |
| 🇮🇹🇬🇧🇪🇸🇫🇷🇩🇪 | **Voce nativa del browser** | Alice · Karen · Mónica · Amélie · Anna | `src/lib/use-voice.ts` |

La scelta è in `src/lib/use-voice.ts` → `const CLOUD_LANGS = ['sq']`.
Solo le lingue in `CLOUD_LANGS` passano da `/api/tts`; tutte le altre usano la voce
nativa **della loro lingua** (mai mescolata). La selezione della voce nativa scarta
le voci-giocattolo di macOS (es. "Albert") e preferisce una voce **femminile** di qualità.

## Catena di `/api/tts` (`src/app/api/tts/route.ts`)

Per l'albanese (e qualsiasi lingua in `CLOUD_LANGS`), in ordine:

1. **Server locale** (`localTts` → `127.0.0.1:5005`) — gratis, offline, illimitato ← attivo
2. **Azure** (se `AZURE_SPEECH_KEY`) — qualità top, ma serve la carta
3. **HuggingFace** (se `HF_TOKEN`) — al momento non ospita il modello sq
4. **Google Translate** — ultimo fallback gratis (voce piatta)

Se nessuna risponde → 204 → il client usa la voce nativa.
⚠️ **In produzione (online)** il `localhost` non esiste → l'albanese ripiega su Google.
Per il vero albanese online serve Azure (già cablato: basta la chiave).

## Cosa rispetta, in OGNI lingua

**Voce nativa (5 lingue)** — in `use-voice.ts`:
- Pause / nuova frase → legge frase per frase (utterance concatenate via `onend`)
- Intonazione → `?` tono che sale, `!` enfasi, `.` neutro (+ micro-variazione)
- Numeri/prezzi → toglie il punto delle migliaia (`1.600`→`1600`); la voce nativa li
  pronuncia nella sua lingua. Non tocca decimali (`19,90`), versioni (`4.8`), domini.

**Server albanese** — in `server.py`:
- Pause → `split_sentences` + silenzio tra le frasi (più lungo dopo `?` e `!`)
- Intonazione → una frase alla volta (il modello applica la prosodia finale)
- Numeri/prezzi → `alb_number` in parole albanesi (`1.600` → *një mijë e gjashtëqind euro*)
- Velocità → `speaking_rate` 1.12 (scandisce meglio, regolabile)
- Timbro → maschile pulito di default (`1.0/1.0`); femminilizzazione WORLD disponibile

## Avvio del server voce

```bash
cd tts-server
./start.sh          # porta 5005, pre-carica il modello albanese
```

Tienilo acceso **accanto a `npm run dev`** quando vuoi il vero albanese.
Prima volta: scarica ~150MB (modello Meta) e impiega ~15s a caricarsi.

### Manopole (variabili d'ambiente, opzionali)

| Variabile | Default | Effetto |
|---|---|---|
| `TTS_SPEAK_RATE` | `1.12` | velocità del parlato (1.0 = normale) |
| `TTS_PITCH_RATIO` | `1.0` | tono: 1.0 maschile, ~1.55 femminile |
| `TTS_FORMANT` | `1.0` | timbro: 1.0 maschile, ~1.16 femminile |

Esempio voce femminile:
```bash
TTS_PITCH_RATIO=1.55 TTS_FORMANT=1.16 ./start.sh
```

## Stack del server
Python (venv) · `torch` + `transformers` (modello `facebook/mms-tts-sqi`) ·
`torchaudio` + `pyworld` (femminilizzazione) · `http.server` (niente framework).
`.venv/`, `__pycache__/`, `*.log` sono gitignorati.
