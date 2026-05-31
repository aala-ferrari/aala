import type { VerticalKey } from './products';

const PREFIX: Record<VerticalKey, string> = {
  medical: 'MED',
  auto: 'AUT',
  legal: 'LEG',
  dental: 'DEN',
  taxi: 'TAX',
};

// Alfabeto senza caratteri ambigui (no 0, O, 1, I, L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomBody(len = 6): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function generateDemoCode(vertical: VerticalKey): string {
  return `${PREFIX[vertical]}-${randomBody(6)}`;
}

// ──────────────────────────────────────────────────────────────
// Super Consulente : codici dedicati (prefisso CONS-) con tier
// ──────────────────────────────────────────────────────────────
export type ConsultantTier = 'smart' | 'medium' | 'max';

export interface ConsultantTierSpec {
  tier: ConsultantTier;
  questions: number;      // domande incluse
  documents: boolean;     // può caricare documenti?
  label: string;          // etichetta admin
}

// Numeri di partenza — modificabili senza toccare la logica.
export const CONSULTANT_TIERS: Record<ConsultantTier, ConsultantTierSpec> = {
  smart: { tier: 'smart', questions: 3, documents: false, label: 'Smart · 3 domande' },
  medium: { tier: 'medium', questions: 8, documents: false, label: 'Medium · 8 domande' },
  max: { tier: 'max', questions: 20, documents: true, label: 'Max · 20 domande + documenti' },
};

export function generateConsultantCode(): string {
  return `CONS-${randomBody(6)}`;
}
