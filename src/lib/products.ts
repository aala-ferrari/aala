export type VerticalKey = 'medical' | 'auto' | 'legal' | 'dental' | 'taxi' | 'nabuel';

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: 'EUR';
  billing: 'one-time' | 'monthly' | 'yearly' | 'contact';
  features: string[];
  popular?: boolean;
  premium?: boolean;
  stripePriceId?: string;
}

export interface Vertical {
  key: VerticalKey;
  slug: string;
  accent: string;
  accentRgb: string;
  hero: { iconKey: VerticalKey; eyebrow: string; title: string; subtitle: string };
  features: { title: string; desc: string }[];
  plans: Plan[];
}

export const VERTICALS: Record<VerticalKey, Vertical> = {
  medical: {
    key: 'medical',
    slug: 'crm',
    accent: '#22d3ee',
    accentRgb: '34, 211, 238',
    hero: {
      iconKey: 'medical',
      eyebrow: 'CRM Medical',
      title: 'Il gestionale che il tuo studio medico merita.',
      subtitle:
        'Agenda intelligente, anagrafica pazienti, fatturazione elettronica, comunicazioni automatiche. Pensato con i medici, per i medici.',
    },
    features: [
      { title: 'Agenda multi-medico', desc: 'Calendario con sale, ricorrenze, promemoria automatici via SMS e WhatsApp.' },
      { title: 'Pazienti & cartelle', desc: 'Anagrafica completa, allegati, storico visite, consensi GDPR firmati digitalmente.' },
      { title: 'Fatturazione', desc: 'Fatturazione elettronica, sistema TS, scadenzario, esportazione commercialista.' },
      { title: 'Sicurezza', desc: 'Cifratura at-rest, backup giornalieri, log di accesso, conformità GDPR.' },
    ],
    plans: [
      {
        id: 'crm-medical-starter',
        name: 'Starter (1 medico)',
        price: 2750,
        currency: 'EUR',
        billing: 'one-time',
        features: ['Installazione su misura', 'Agenda + pazienti + fatturazione', 'Formazione 4h', '12 mesi assistenza'],
      },
      {
        id: 'crm-medical-clinic',
        name: 'Clinica completa',
        price: 3550,
        currency: 'EUR',
        billing: 'one-time',
        features: [
          'Tutto Starter +',
          'Admin + backoffice lead',
          'Gestione appuntamenti avanzata',
          'Ruoli: manager, utenti, consulenti',
          'Multi-utente illimitato',
        ],
        popular: true,
      },
      {
        id: 'crm-medical-enterprise',
        name: 'Enterprise',
        price: 0,
        currency: 'EUR',
        billing: 'contact',
        features: ['Personalizzazioni profonde', 'Integrazioni con sistemi sanitari', 'SLA dedicato', 'Hosting on-premise opzionale'],
      },
    ],
  },
  auto: {
    key: 'auto',
    slug: 'auto',
    accent: '#f59e0b',
    accentRgb: '245, 158, 11',
    hero: {
      iconKey: 'auto',
      eyebrow: 'Gestionale Auto',
      title: 'Il tuo rent-a-car, finalmente sotto controllo.',
      subtitle:
        'Flotta, prenotazioni, contratti, manutenzione, fatturazione, app mobile per i clienti. Tutto in un solo posto.',
    },
    features: [
      { title: 'Flotta in tempo reale', desc: 'GPS, chilometraggio, scadenze, disponibilità, manutenzione programmata.' },
      { title: 'Prenotazioni online', desc: 'Booking sul tuo sito, pagamenti, contratto digitale firmato dal cellulare.' },
      { title: 'App mobile cliente', desc: 'L\'utente apre l\'auto, segnala danni, paga supplementi direttamente dall\'app.' },
      { title: 'Reportistica', desc: 'Margini per veicolo, occupazione flotta, top performer, esportazione contabile.' },
    ],
    plans: [
      {
        id: 'auto-fleet-small',
        name: 'Fleet S (fino 20 auto)',
        price: 750,
        currency: 'EUR',
        billing: 'monthly',
        features: ['Web + mobile', 'Booking online', 'Contratti digitali', 'Supporto email'],
      },
      {
        id: 'auto-fleet-medium',
        name: 'Fleet M (fino 80 auto)',
        price: 1600,
        currency: 'EUR',
        billing: 'monthly',
        features: ['Tutto S +', 'Multi-sede', 'GPS integrato', 'Supporto prioritario'],
        popular: true,
      },
      {
        id: 'auto-fleet-large',
        name: 'Fleet L — Tutto tuo',
        price: 4800,
        currency: 'EUR',
        billing: 'one-time',
        features: [
          'CRM auto personalizzato',
          'Sito web dedicato',
          'Dominio + VPS hosting inclusi',
          'Branding su misura',
          'Nessun abbonamento mensile',
        ],
      },
    ],
  },
  legal: {
    key: 'legal',
    slug: 'legal',
    accent: '#eab308',
    accentRgb: '234, 179, 8',
    hero: {
      iconKey: 'legal',
      eyebrow: 'Super Avokati',
      title: 'La suite SaaS che fa lavorare meno il tuo studio legale.',
      subtitle:
        'Pratiche, scadenze, calendario udienze, ricerca documentale con AI, fatturazione. Tutto integrato, tutto sicuro. Attualmente disponibile per il diritto albanese — versione italiana coming soon.',
    },
    features: [
      { title: 'Pratiche & scadenze', desc: 'Gestione fascicoli, scadenzario automatico, alert su udienze e termini.' },
      { title: 'AI documentale', desc: 'Ricerca semantica sui documenti dello studio. Trova quello che ti serve in secondi.' },
      { title: 'Fatturazione legale', desc: 'Parcelle, anticipazioni, tariffe forensi, conto cliente, fattura elettronica.' },
      { title: 'Sicurezza forense', desc: 'Cifratura, backup, controllo accessi, conservazione a norma.' },
    ],
    plans: [
      {
        id: 'legal-solo',
        name: 'Solo (1 utente)',
        price: 100,
        currency: 'EUR',
        billing: 'monthly',
        features: ['1 utente', 'Pratiche illimitate', 'Calendario udienze', '5 GB documenti'],
      },
      {
        id: 'legal-studio',
        name: 'Studio (fino 5 utenti)',
        price: 350,
        currency: 'EUR',
        billing: 'monthly',
        features: ['Fino 5 utenti', 'AI documentale', '100 GB documenti', 'Supporto prioritario'],
        popular: true,
      },
      {
        id: 'legal-firm',
        name: 'Firm',
        price: 0,
        currency: 'EUR',
        billing: 'contact',
        features: ['Utenti illimitati', 'Integrazioni custom', 'Storage illimitato', 'SLA dedicato'],
      },
    ],
  },
  dental: {
    key: 'dental',
    slug: 'dental',
    accent: '#34d4b8',
    accentRgb: '52, 212, 184',
    hero: {
      iconKey: 'dental',
      eyebrow: 'Dental Tourism',
      title: 'Pazienti internazionali qualificati. Direttamente alla tua clinica.',
      subtitle:
        'Generiamo richieste qualificate da Europa, USA e UK tramite campagne mirate. Tu ricevi solo pazienti pronti a prenotare.',
    },
    features: [
      { title: 'Lead qualificati', desc: 'Pre-screening medico, budget verificato, intenzione di viaggio confermata.' },
      { title: 'Campagne multilingua', desc: 'Ads e SEO in 5 lingue. Pazienti che parlano la tua lingua arrivano già.' },
      { title: 'Esclusiva di zona', desc: 'Una sola clinica partner per città / specializzazione. Niente concorrenza interna.' },
      { title: 'Reportistica trasparente', desc: 'Dashboard con lead, contatti, conversioni. Tu vedi tutto, sempre.' },
    ],
    plans: [
      {
        id: 'dental-discovery',
        name: 'Discovery',
        price: 0,
        currency: 'EUR',
        billing: 'contact',
        features: ['Analisi mercato', 'Audit clinica', 'Strategia 90 giorni', 'Nessun impegno'],
      },
      {
        id: 'dental-partner',
        name: 'Partner',
        price: 0,
        currency: 'EUR',
        billing: 'contact',
        features: [
          '20-25% su ogni preventivo paziente',
          'Pagamento solo a risultato',
          'Nessun costo fisso mensile',
          'Lead pre-qualificati internazionali',
        ],
        popular: true,
      },
      {
        id: 'dental-premium',
        name: 'Premium',
        price: 0,
        currency: 'EUR',
        billing: 'contact',
        features: [
          'Tutto Partner +',
          'Aiutiamo la clinica a crescere',
          'Campagne ads su Meta (Facebook + Instagram)',
          'Acquisizione clienti dedicata',
          'Strategia di crescita su misura',
        ],
      },
    ],
  },
  taxi: {
    key: 'taxi',
    slug: 'taxi',
    accent: '#f5b800',
    accentRgb: '245, 184, 0',
    hero: {
      iconKey: 'taxi',
      eyebrow: 'Taxi App',
      title: 'La tua flotta taxi, stile Bolt. Brandizzata, controllata, redditizia.',
      subtitle:
        'App mobile per autisti e clienti, dispatching automatico, pagamenti integrati, mappa live, valutazioni. Tutto col tuo brand, sul tuo dominio.',
    },
    features: [
      { title: 'App passeggero', desc: 'Prenotazione istantanea, stima costo, traccia auto in tempo reale, pagamento in-app.' },
      { title: 'App driver', desc: 'Accettazione corse, navigazione integrata, guadagni in diretta, supporto immediato.' },
      { title: 'Centrale dispatch', desc: 'Assegnazione automatica per prossimità e rating, override manuale, code-zone calde.' },
      { title: 'Pagamenti & fiscalità', desc: 'Carta, Apple Pay, Google Pay, fatturazione elettronica, ripartizione commissioni driver.' },
    ],
    plans: [
      {
        id: 'taxi-starter',
        name: 'Starter (fino 20 driver)',
        price: 350,
        currency: 'EUR',
        billing: 'monthly',
        features: ['App driver + cliente', 'Dispatch automatico', 'Pagamenti carta', 'Supporto email'],
      },
      {
        id: 'taxi-fleet',
        name: 'Fleet (fino 100 driver)',
        price: 1490,
        currency: 'EUR',
        billing: 'monthly',
        features: ['Tutto Starter +', 'Multi-città', 'Pricing dinamico', 'Reportistica avanzata', 'Supporto prioritario'],
        popular: true,
      },
      {
        id: 'taxi-platform',
        name: 'Platform — Tutto tuo',
        price: 7500,
        currency: 'EUR',
        billing: 'one-time',
        features: [
          'App brandizzata (web/PWA) col tuo logo',
          'Backend + dispatching personalizzato',
          'Dominio + VPS hosting inclusi',
          'Setup completo + training',
          'Nessun canone mensile sulla piattaforma',
        ],
      },
      {
        id: 'taxi-complete',
        name: 'Completo — App native + Store',
        price: 15000,
        currency: 'EUR',
        billing: 'one-time',
        premium: true,
        features: [
          'Tutto Platform +',
          'App native iOS + Android col tuo brand',
          'Pubblicazione su App Store + Google Play',
          'Account sviluppatore e review gestiti da noi',
          'Aggiornamenti store inclusi (1° anno)',
        ],
      },
    ],
  },

  nabuel: {
    key: 'nabuel',
    slug: 'nabuel',
    accent: '#8b5cf6',
    accentRgb: '139, 92, 246',
    hero: {
      iconKey: 'nabuel',
      eyebrow: 'Nabuel · Agente Vocale AI',
      title: 'Agenti vocali AI che rispondono, prenotano e vendono — 24 ore su 24, in ogni lingua.',
      subtitle:
        'La reception virtuale e la forza vendita telefonica della tua attività. Nabuel risponde a ogni chiamata, fissa e sposta appuntamenti, ricontatta i lead e chiude contratti. Voce naturale, qualifica intelligente, integrato col tuo calendario e CRM.',
    },
    features: [
      { title: 'Reception 24/7', desc: 'Risponde a ogni chiamata in entrata, fissa e sposta appuntamenti, dà informazioni — nessuna chiamata persa, nemmeno di notte o nei festivi.' },
      { title: 'Chiamate in uscita', desc: 'Campagne outbound automatiche: conferma appuntamenti, ricontatta i lead freddi, vende contratti luce/gas e telefonia.' },
      { title: 'Qualifica intelligente', desc: 'Capisce il bisogno del cliente, filtra i curiosi e passa all\'operatore umano solo le opportunità calde, con il contesto già pronto.' },
      { title: 'Cervello + analisi', desc: 'Knowledge base su misura del tuo settore, riassunto ed esito di ogni chiamata, integrazione con calendario e CRM.' },
    ],
    plans: [
      {
        id: 'nabuel-starter',
        name: 'Starter (1 agente, reception)',
        price: 490,
        currency: 'EUR',
        billing: 'monthly',
        features: ['1 agente vocale AI', 'Chiamate in entrata (reception)', '1 settore + 1 lingua', 'Integrazione calendario', 'Riassunto chiamate', 'Supporto email'],
      },
      {
        id: 'nabuel-business',
        name: 'Business (inbound + outbound)',
        price: 1490,
        currency: 'EUR',
        billing: 'monthly',
        features: ['Tutto Starter +', 'Chiamate in entrata e in uscita', 'Multi-settore + multilingua', 'Qualifica intelligente dei lead', 'Campagne outbound', 'CRM + analisi avanzata', 'Supporto prioritario'],
        popular: true,
      },
      {
        id: 'nabuel-reseller',
        name: 'Reseller — White-label, tutto tuo',
        price: 9500,
        currency: 'EUR',
        billing: 'one-time',
        premium: true,
        features: [
          'Piattaforma white-label col tuo brand',
          'Multi-tenant: rivendi ai tuoi clienti',
          'Agenti illimitati e numeri dedicati',
          'Dominio + hosting inclusi',
          'Setup completo + training',
          'Nessuna royalty sulle tue rivendite',
        ],
      },
    ],
  },
};

export const VERTICAL_LIST = Object.values(VERTICALS);
