'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '355699555777';
const WHATSAPP_MESSAGE = 'Ciao AALA! Vorrei informazioni sui vostri servizi.';

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-3 sm:bottom-7 sm:right-7">
      {/* Torna su — appare allo scroll, oro brand AALA */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Torna su"
        className={`group flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
          showTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-3 opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #ecdcb0 0%, #c9a849 55%, #a07a26 100%)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 20px -6px rgba(176,138,62,0.55)',
        }}
      >
        <ArrowUp className="h-5 w-5 text-ink transition-transform group-hover:-translate-y-0.5" />
      </button>

      {/* WhatsApp — verde con onde pulsanti */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contattaci su WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 sm:h-16 sm:w-16"
      >
        {/* onde pulsanti */}
        <span className="wa-ripple" />
        <span className="wa-ripple wa-ripple-delay" />

        {/* corpo bottone con gradient verde 3D */}
        <span
          className="relative flex h-full w-full items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #5fd07a 0%, #25b34a 55%, #1a8f3c 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.35) inset, 0 -2px 6px rgba(0,0,0,0.18) inset, 0 10px 24px -6px rgba(37,179,74,0.6)',
          }}
        >
          <WhatsAppIcon />
        </span>
      </a>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-8 w-8 sm:h-9 sm:w-9"
      fill="#ffffff"
      aria-hidden
    >
      <path d="M16.04 4C9.93 4 4.97 8.96 4.97 15.07c0 2.13.6 4.12 1.64 5.82L4.5 28l7.3-1.92a11 11 0 0 0 4.24.85h.01c6.11 0 11.07-4.96 11.07-11.07C27.12 8.96 22.15 4 16.04 4Zm0 20.27h-.01a9.2 9.2 0 0 1-4.68-1.28l-.34-.2-3.48.91.93-3.39-.22-.35a9.18 9.18 0 0 1-1.41-4.9c0-5.08 4.14-9.21 9.22-9.21 2.46 0 4.77.96 6.51 2.7a9.16 9.16 0 0 1 2.7 6.52c0 5.08-4.14 9.2-9.22 9.2Zm5.05-6.9c-.28-.14-1.64-.81-1.9-.9-.25-.1-.43-.14-.62.14-.18.27-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.22-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.27-.02-.42.12-.56.12-.12.28-.32.41-.48.14-.16.18-.27.28-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.35.98 2.66 1.12 2.85.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.2 1.25.18 1.72.11.53-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32Z" />
    </svg>
  );
}
