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
export type ConsultantTier = 'smart' | 'medium' | 'max' | 'unlimited';

// Limite "illimitato": numero enorme. Così il conteggio server-side non si
// esaurisce mai in pratica e non serve cambiare la RPC del DB.
export const UNLIMITED_QUESTIONS = 999999;

export interface ConsultantTierSpec {
  tier: ConsultantTier;
  questions: number;      // domande incluse (UNLIMITED_QUESTIONS = illimitato)
  documents: boolean;     // può caricare documenti?
  label: string;          // etichetta admin
}

// Numeri di partenza — modificabili senza toccare la logica.
export const CONSULTANT_TIERS: Record<ConsultantTier, ConsultantTierSpec> = {
  smart: { tier: 'smart', questions: 3, documents: false, label: 'Smart · 3 domande' },
  medium: { tier: 'medium', questions: 8, documents: false, label: 'Medium · 8 domande' },
  max: { tier: 'max', questions: 20, documents: true, label: 'Max · 20 domande + documenti' },
  unlimited: {
    tier: 'unlimited',
    questions: UNLIMITED_QUESTIONS,
    documents: true,
    label: 'Illimitato · ∞ domande + documenti',
  },
};

// Ordine crescente (per l'upgrade: si può solo salire di piano).
export const TIER_ORDER: ConsultantTier[] = ['smart', 'medium', 'max', 'unlimited'];

// La colonna DB `tier` accetta solo smart/medium/max: l'illimitato si salva
// come 'max' + limite enorme. Qui mappiamo avanti/indietro.
export function dbTier(tier: ConsultantTier): 'smart' | 'medium' | 'max' {
  return tier === 'unlimited' ? 'max' : tier;
}

export function isUnlimited(questionsLimit?: number | null): boolean {
  return (questionsLimit ?? 0) >= UNLIMITED_QUESTIONS;
}

// Ricostruisce il piano logico da una riga DB (tier salvato + limite).
export function effectiveTier(
  storedTier?: string | null,
  questionsLimit?: number | null
): ConsultantTier {
  if (isUnlimited(questionsLimit)) return 'unlimited';
  return (storedTier as ConsultantTier) ?? 'smart';
}

export function generateConsultantCode(): string {
  return `CONS-${randomBody(6)}`;
}
