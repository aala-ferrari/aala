import crypto from 'crypto';

// ============================================================================
// GATEWAY PAGAMENTI CREDINS BANK (tecnologia ASEE / Payten "NestPay" 3D Secure).
// Redirect a pagina sicura della banca: il cliente inserisce carta/scadenza/CVV
// sulla pagina di Credins (Visa Secure / Mastercard SecureCode). I dati carta
// NON toccano mai il nostro server (a norma PCI-DSS).
//
// ATTIVAZIONE: quando Credins ti dà le credenziali del "POS virtual / e-commerce",
// riempi nel .env di AALA:
//   CREDINS_GATEWAY_URL  = URL del gate 3D (te lo danno loro, es. .../fim/est3Dgate)
//   CREDINS_CLIENT_ID    = clientid / merchant id
//   CREDINS_STORE_KEY    = store key / secret per l'hash
//   CREDINS_CURRENCY     = 978 (EUR) oppure 008 (ALL)   [default 978]
//   CREDINS_STORE_TYPE   = 3d_pay_hosting               [default]
//   CREDINS_LANG         = it | en | sq                 [default it]
//   NEXT_PUBLIC_SITE_URL = https://aala.global
//
// NB: l'algoritmo hash qui è NestPay "ver3" (HMAC-SHA512), lo standard più diffuso.
// Se la documentazione che ti dà Credins indica ver1/ver2 o campi diversi, si
// adatta in 5 minuti (i punti da toccare sono segnati con "// ADATTA:").
// ============================================================================

export type NestPayConfig = {
  gatewayUrl: string;
  clientId: string;
  storeKey: string;
  storeType: string;
  currency: string;
  lang: string;
  baseUrl: string;
};

export function getNestPayConfig(): NestPayConfig | null {
  const gatewayUrl = process.env.CREDINS_GATEWAY_URL;
  const clientId = process.env.CREDINS_CLIENT_ID;
  const storeKey = process.env.CREDINS_STORE_KEY;
  if (!gatewayUrl || !clientId || !storeKey) return null; // non configurato → fallback
  return {
    gatewayUrl,
    clientId,
    storeKey,
    storeType: process.env.CREDINS_STORE_TYPE || '3d_pay_hosting',
    currency: process.env.CREDINS_CURRENCY || '978', // 978 = EUR
    lang: process.env.CREDINS_LANG || 'it',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://aala.global',
  };
}

function esc(v: unknown): string {
  return String(v ?? '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

// NestPay ver3: chiavi ordinate (case-insensitive), valori escapati e uniti da "|",
// storeKey escapata in coda; HMAC-SHA512 → base64. (// ADATTA: se ver1/ver2)
export function nestpayHash(params: Record<string, string>, storeKey: string): string {
  const keys = Object.keys(params)
    .filter((k) => k.toLowerCase() !== 'hash' && k.toLowerCase() !== 'encoding')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const plain = keys.map((k) => esc(params[k])).join('|') + '|' + esc(storeKey);
  return crypto.createHmac('sha512', storeKey).update(plain, 'utf8').digest('base64');
}

// Campi (con hash) da POSTare al gateway 3D per aprire la sessione di pagamento.
export function buildPaymentFields(
  cfg: NestPayConfig,
  opts: { oid: string; amount: string; okUrl: string; failUrl: string; callbackUrl?: string; email?: string; billName?: string },
): Record<string, string> {
  const fields: Record<string, string> = {
    clientid: cfg.clientId,
    storetype: cfg.storeType,
    hashAlgorithm: 'ver3',
    trantype: 'Auth', // ADATTA: 'PreAuth' se vuoi autorizzare+catturare in 2 passi
    amount: opts.amount,
    currency: cfg.currency,
    oid: opts.oid,
    okUrl: opts.okUrl,
    failUrl: opts.failUrl,
    lang: cfg.lang,
    rnd: crypto.randomBytes(16).toString('hex'),
    encoding: 'UTF-8',
  };
  if (opts.callbackUrl) fields.callbackUrl = opts.callbackUrl;
  if (opts.email) fields.email = opts.email;
  if (opts.billName) fields.BillToName = opts.billName;
  fields.hash = nestpayHash(fields, cfg.storeKey);
  return fields;
}

// Verifica la firma della risposta del gateway (callback/return).
export function verifyCallback(params: Record<string, string>, storeKey: string): boolean {
  const received = params.HASH || params.hash;
  if (!received) return false;
  return nestpayHash(params, storeKey) === received;
}

// Esito pagamento dai parametri di ritorno NestPay.
export function isApproved(params: Record<string, string>): boolean {
  const proc = params.ProcReturnCode || params.procreturncode;
  const resp = (params.Response || params.response || '').toLowerCase();
  const md = params.mdStatus || params.mdstatus;
  // ProcReturnCode '00' = ok; mdStatus 1/2/3/4 = 3D autenticato/tentato
  return proc === '00' && resp === 'approved' && ['1', '2', '3', '4'].includes(String(md));
}
