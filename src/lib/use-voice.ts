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
        synth.cancel();
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
        const v =
          ofLang.find((vo) => nicer.test(vo.name)) || ofLang[0];

        // Chrome tronca la sintesi lunga (~15s): leggo frase per frase.
        // Variando un filo pitch/velocità per frase la lettura risulta meno piatta.
        const chunks = text.match(/[^.!?…\n]+[.!?…]*\s*/g) || [text];
        chunks
          .map((c) => c.trim())
          .filter(Boolean)
          .forEach((chunk, i, arr) => {
            const u = new SpeechSynthesisUtterance(chunk);
            u.lang = lang;
            if (v) u.voice = v;
            // domanda → tono leggermente più alto; micro-variazioni = meno monotono
            const isQuestion = /\?\s*$/.test(chunk);
            u.pitch = (isQuestion ? 1.12 : 1.04) + (i % 2 === 0 ? 0.02 : -0.02);
            u.rate = 1.0;
            if (i === 0) u.onstart = () => setSpeaking(true);
            if (i === arr.length - 1) u.onend = () => setSpeaking(false);
            u.onerror = () => setSpeaking(false);
            synth.speak(u);
          });
      };

      // le voci si caricano in modo asincrono: se vuote, aspetta l'evento
      if (synth.getVoices().length === 0) {
        let done = false;
        const once = () => {
          if (done) return;
          done = true;
          run();
        };
        synth.addEventListener('voiceschanged', once, { once: true });
        setTimeout(once, 350); // fallback se l'evento non scatta
      } else {
        run();
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

  // Sblocca il motore TTS durante un gesto utente (alcuni browser bloccano la
  // sintesi se non è mai partita da un'interazione). Da chiamare al click del mic.
  const unlock = useCallback(() => {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    try {
      synth.resume();
      synth.getVoices(); // forza il caricamento delle voci
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
    } catch {
      /* ignore */
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
    unlock,
  };
}
