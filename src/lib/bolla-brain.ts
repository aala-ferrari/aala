/**
 * Il cervello della Bolla di Zhiva — Fase 1: sistema a regole.
 *
 * Capisce di cosa parla il cliente (per keyword), risponde con info utili,
 * lo guida verso il servizio giusto e raccoglie il contatto.
 * Nessun costo API. In Fase 2 si potrà sostituire con Claude vero.
 */

import type { VerticalKey } from './products';

export type BollaMood = 'idle' | 'thinking' | 'speaking';

// Colori per stato/argomento — la bolla cambia tinta dal vivo
export const BOLLA_COLORS: Record<string, string> = {
  default: '#d4a857', // oro brand
  medical: '#0e7c8a',
  auto: '#a85a1a',
  legal: '#8a6717',
  dental: '#2a7a5c',
  taxi: '#f5b800',
  webpages: '#5b4ec9',
};

export type ConversationStage =
  | 'open' // conversazione libera
  | 'ask_name' // sto raccogliendo il nome
  | 'ask_email' // sto raccogliendo l'email
  | 'done'; // contatto raccolto

export interface BollaState {
  stage: ConversationStage;
  service: VerticalKey | 'webpages' | null;
  leadName: string | null;
  leadEmail: string | null;
}

export interface BollaChip {
  label: string;
  /** azione: 'service:<key>' | 'demo' | 'pricing' | 'lead' | 'reset' */
  action: string;
}

export interface BollaReply {
  text: string[]; // una o più "bolle" di testo
  colorKey: string; // tinta della bolla
  chips: BollaChip[]; // suggerimenti cliccabili
  state: BollaState; // nuovo stato
  /** se valorizzato, il client invia il lead a /api/leads */
  submitLead?: { name: string; email: string; service: string; message: string };
}

export const INITIAL_STATE: BollaState = {
  stage: 'open',
  service: null,
  leadName: null,
  leadEmail: null,
};

// ---- vocabolario degli intent ----
const KW: Record<VerticalKey | 'webpages', string[]> = {
  medical: ['medic', 'clinic', 'studio medic', 'paziic', 'pazient', 'agenda', 'crm', 'cartell', 'ambulator', 'dottor', 'sanitar'],
  dental: ['dental', 'dentist', 'denti', 'turismo dent', 'odonto', 'clinica dent', 'impiant'],
  auto: ['noleggi', 'rent', 'auto', 'macchin', 'flotta', 'veicol', 'autonoleggi', 'car'],
  taxi: ['taxi', 'ncc', 'driver', 'autist', 'corsa', 'bolt', 'uber', 'passegger'],
  legal: ['legal', 'avvocat', 'studio leg', 'pratich', 'udienz', 'causa', 'cause', 'tribunal', 'avokati'],
  webpages: ['sito', 'siti', 'web', 'pagina', 'landing', 'e-commerce', 'ecommerce', 'website'],
};

const KW_PRICING = ['prezzo', 'prezzi', 'costo', 'costa', 'quanto', 'tariff', 'abbonament', 'budget', 'euro'];
const KW_DEMO = ['demo', 'prova', 'provare', 'vedere', 'testare', 'come funziona', 'mostra'];
const KW_CONTACT = ['contatt', 'parlare', 'chiamata', 'consulenza', 'preventiv', 'parlami', 'sentirci', 'appuntament'];
const KW_GREETING = ['ciao', 'salve', 'buongiorno', 'buonasera', 'ehi', 'hey', 'hola'];
const KW_THANKS = ['grazie', 'perfetto', 'ottimo', 'gentil'];
const KW_YES = ['si', 'sì', 'certo', 'volentieri', 'ok', 'va bene', 'yes'];

const SERVICE_LABEL: Record<string, string> = {
  medical: 'CRM Medical',
  dental: 'Dental Tourism',
  auto: 'Gestionale Auto',
  taxi: 'Taxi App',
  legal: 'Super Avokati',
  webpages: 'siti web su misura',
};

const SERVICE_PITCH: Record<string, string[]> = {
  medical: [
    'Il CRM Medical gestisce agenda multi-medico, pazienti, fatturazione elettronica e comunicazioni automatiche — tutto a norma GDPR.',
    'È pensato con i medici, per i medici. Una clinica completa parte da €3.550 una tantum.',
  ],
  dental: [
    'Con il Dental Tourism portiamo alla tua clinica pazienti internazionali già qualificati — Europa, UK, USA — tramite campagne mirate.',
    'Paghi solo a risultato: 20-25% sul preventivo del paziente. Nessun costo fisso.',
  ],
  auto: [
    'Il Gestionale Auto controlla flotta, prenotazioni, contratti e manutenzione, con app mobile inclusa. Da €750/mese.',
    'Se vuoi tutto tuo — software + sito + dominio + hosting — c\'è il pacchetto Fleet L a €4.800 una tantum.',
  ],
  taxi: [
    'La Taxi App è una piattaforma stile Bolt col TUO brand: app passeggero e driver, dispatching automatico, pagamenti, mappa live.',
    'Parte da €350/mese; tutta tua da €7.500 una tantum (web/PWA), o €15.000 completo con app native pubblicate su App Store e Play Store.',
  ],
  legal: [
    'Super Avokati è la suite per studi legali: pratiche, scadenze, calendario udienze e ricerca documentale con intelligenza artificiale.',
    'Affianca l\'avvocato nella risoluzione di cause civili, penali e amministrative. Da €100/mese. Oggi disponibile per il diritto albanese — Italia in arrivo.',
  ],
  webpages: [
    'Realizziamo siti web 100% su misura — niente template pronti. Disegnati per la tua impresa, dal codice al design.',
    'Raccontami che tipo di sito ti serve e ti preparo un percorso dedicato.',
  ],
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function matchAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function detectService(text: string): (keyof typeof KW) | null {
  for (const key of Object.keys(KW) as (keyof typeof KW)[]) {
    if (matchAny(text, KW[key])) return key;
  }
  return null;
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

const serviceChips = (service: string): BollaChip[] => [
  { label: 'Voglio una demo', action: 'demo' },
  { label: 'Quanto costa?', action: 'pricing' },
  { label: 'Lasciami ricontattare', action: 'lead' },
];

/**
 * Il cuore: prende messaggio + stato → produce risposta.
 */
export function think(rawMessage: string, state: BollaState): BollaReply {
  const text = normalize(rawMessage);

  // --- raccolta lead in corso ---
  if (state.stage === 'ask_name') {
    const name = rawMessage.trim();
    if (name.length < 2) {
      return {
        text: ['Come ti chiami? Così so come chiamarti 🙂'],
        colorKey: state.service ?? 'default',
        chips: [],
        state,
      };
    }
    return {
      text: [`Piacere, ${name.split(' ')[0]}! Qual è la tua email? Ti farò ricontattare entro 24 ore.`],
      colorKey: state.service ?? 'default',
      chips: [],
      state: { ...state, stage: 'ask_email', leadName: name },
    };
  }

  if (state.stage === 'ask_email') {
    if (!isEmail(rawMessage)) {
      return {
        text: ['Mmm, quella email non sembra valida. Riprova — es. nome@azienda.it'],
        colorKey: state.service ?? 'default',
        chips: [],
        state,
      };
    }
    const email = rawMessage.trim();
    const serviceKey = state.service ?? 'other';
    return {
      text: [
        `Perfetto! Ho preso nota. 🎉`,
        `Il team AALA ti scriverà a ${email} entro 24 ore${
          state.service ? ` per parlare di ${SERVICE_LABEL[state.service]}` : ''
        }. A presto!`,
      ],
      colorKey: state.service ?? 'default',
      chips: [{ label: 'Ricominciamo', action: 'reset' }],
      state: { ...state, stage: 'done', leadEmail: email },
      submitLead: {
        name: state.leadName ?? '',
        email,
        service: serviceKey,
        message: `Lead raccolto dalla Bolla AALA. Servizio di interesse: ${
          state.service ? SERVICE_LABEL[state.service] : 'non specificato'
        }.`,
      },
    };
  }

  // --- conversazione libera ---

  // saluto
  if (matchAny(text, KW_GREETING) && text.length < 25) {
    return {
      text: [
        'Ciao! Sono la Bolla di AALA 🫧',
        'Raccontami della tua impresa, oppure chiedimi di uno dei nostri servizi. Di cosa ti occupi?',
      ],
      colorKey: 'default',
      chips: [
        { label: '🩺 Studio medico', action: 'service:medical' },
        { label: '⚖️ Studio legale', action: 'service:legal' },
        { label: '🚗 Noleggio auto', action: 'service:auto' },
        { label: '🦷 Clinica dentale', action: 'service:dental' },
        { label: '🚕 Taxi / NCC', action: 'service:taxi' },
        { label: '🌐 Sito web', action: 'service:webpages' },
      ],
      state: { ...state, service: null },
    };
  }

  // ringraziamento
  if (matchAny(text, KW_THANKS) && text.length < 20) {
    return {
      text: ['Figurati! Vuoi che ti faccia ricontattare da una persona del team?'],
      colorKey: state.service ?? 'default',
      chips: [
        { label: 'Sì, ricontattatemi', action: 'lead' },
        { label: 'No grazie', action: 'reset' },
      ],
      state,
    };
  }

  // rilevo un servizio nel messaggio
  const detected = detectService(text);
  if (detected) {
    return {
      text: SERVICE_PITCH[detected],
      colorKey: detected,
      chips: serviceChips(detected),
      state: { ...state, service: detected },
    };
  }

  // prezzi (generico, senza servizio identificato)
  if (matchAny(text, KW_PRICING)) {
    if (state.service) {
      return {
        text: SERVICE_PITCH[state.service],
        colorKey: state.service,
        chips: serviceChips(state.service),
        state,
      };
    }
    return {
      text: [
        'Ogni servizio ha il suo listino — alcuni in abbonamento, altri una-tantum.',
        'Di quale ti dico i prezzi? Dimmi il settore della tua impresa.',
      ],
      colorKey: 'default',
      chips: [
        { label: 'CRM Medical', action: 'service:medical' },
        { label: 'Gestionale Auto', action: 'service:auto' },
        { label: 'Super Avokati', action: 'service:legal' },
        { label: 'Taxi App', action: 'service:taxi' },
      ],
      state,
    };
  }

  // demo
  if (matchAny(text, KW_DEMO)) {
    if (state.service) {
      return {
        text: [
          `Ottimo! Per la demo di ${SERVICE_LABEL[state.service]} ti faccio ricontattare con un accesso dedicato.`,
          'Come ti chiami?',
        ],
        colorKey: state.service,
        chips: [],
        state: { ...state, stage: 'ask_name' },
      };
    }
    return {
      text: ['Volentieri! Di quale servizio vuoi vedere la demo?'],
      colorKey: 'default',
      chips: [
        { label: 'CRM Medical', action: 'service:medical' },
        { label: 'Gestionale Auto', action: 'service:auto' },
        { label: 'Super Avokati', action: 'service:legal' },
        { label: 'Taxi App', action: 'service:taxi' },
        { label: 'Dental Tourism', action: 'service:dental' },
      ],
      state,
    };
  }

  // contatto / consulenza
  if (matchAny(text, KW_CONTACT)) {
    return {
      text: ['Con piacere! Ti faccio ricontattare entro 24 ore. Come ti chiami?'],
      colorKey: state.service ?? 'default',
      chips: [],
      state: { ...state, stage: 'ask_name' },
    };
  }

  // sì generico
  if (matchAny(text, KW_YES) && text.length < 15) {
    return {
      text: ['Perfetto! Lasciami il tuo nome e ti faccio ricontattare.'],
      colorKey: state.service ?? 'default',
      chips: [],
      state: { ...state, stage: 'ask_name' },
    };
  }

  // fallback intelligente
  return {
    text: [
      'Non sono sicura di aver capito 🤔 — ma posso aiutarti su tutto quello che fa AALA.',
      'Dimmi di cosa si occupa la tua impresa, o scegli qui sotto:',
    ],
    colorKey: 'default',
    chips: [
      { label: '🩺 Medico', action: 'service:medical' },
      { label: '⚖️ Legale', action: 'service:legal' },
      { label: '🚗 Auto', action: 'service:auto' },
      { label: '🦷 Dentale', action: 'service:dental' },
      { label: '🚕 Taxi', action: 'service:taxi' },
      { label: '🌐 Sito web', action: 'service:webpages' },
      { label: '☎️ Parla con noi', action: 'lead' },
    ],
    state,
  };
}

/**
 * Gestisce il click su un chip (azione strutturata).
 */
export function act(action: string, state: BollaState): BollaReply {
  if (action === 'reset') {
    return {
      text: ['Ricominciamo da capo! Di cosa si occupa la tua impresa?'],
      colorKey: 'default',
      chips: [
        { label: '🩺 Medico', action: 'service:medical' },
        { label: '⚖️ Legale', action: 'service:legal' },
        { label: '🚗 Auto', action: 'service:auto' },
        { label: '🦷 Dentale', action: 'service:dental' },
        { label: '🚕 Taxi', action: 'service:taxi' },
        { label: '🌐 Sito web', action: 'service:webpages' },
      ],
      state: INITIAL_STATE,
    };
  }

  if (action.startsWith('service:')) {
    const key = action.split(':')[1] as keyof typeof KW;
    return {
      text: SERVICE_PITCH[key],
      colorKey: key,
      chips: serviceChips(key),
      state: { ...state, service: key },
    };
  }

  if (action === 'pricing') return think('prezzo', state);
  if (action === 'demo') return think('demo', state);
  if (action === 'lead') {
    return {
      text: ['Perfetto! Come ti chiami?'],
      colorKey: state.service ?? 'default',
      chips: [],
      state: { ...state, stage: 'ask_name' },
    };
  }

  return think(action, state);
}
