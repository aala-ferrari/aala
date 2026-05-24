import type { VerticalKey } from './products';

const PREFIX: Record<VerticalKey, string> = {
  medical: 'MED',
  auto: 'AUT',
  legal: 'LEG',
  dental: 'DEN',
};

// Alfabeto senza caratteri ambigui (no 0, O, 1, I, L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateDemoCode(vertical: VerticalKey): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `${PREFIX[vertical]}-${body}`;
}
