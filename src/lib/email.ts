import { Resend } from 'resend';
import type { VerticalKey } from './products';

const VERTICAL_LABEL: Record<VerticalKey, string> = {
  medical: 'Medical CRM',
  auto: 'Gestionale Auto',
  legal: 'Super Avokati',
  dental: 'Dental Tourism',
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface DemoEmailResult {
  sent: boolean;
  skipped?: 'no-api-key' | 'no-from' | 'no-recipient';
  id?: string;
  error?: string;
}

export async function sendDemoCodeEmail(opts: {
  to: string | null | undefined;
  name?: string | null;
  code: string;
  vertical: VerticalKey;
  expiresInDays: number;
}): Promise<DemoEmailResult> {
  if (!opts.to) return { sent: false, skipped: 'no-recipient' };

  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) return { sent: false, skipped: 'no-from' };

  const resend = getResend();
  if (!resend) return { sent: false, skipped: 'no-api-key' };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://aala.example';
  const demoUrl = `${siteUrl}/it/demo`;
  const verticalLabel = VERTICAL_LABEL[opts.vertical];

  const subject = `Il tuo codice di accesso demo · ${verticalLabel}`;

  const html = renderDemoEmailHtml({
    name: opts.name ?? undefined,
    code: opts.code,
    verticalLabel,
    demoUrl,
    expiresInDays: opts.expiresInDays,
  });

  const text = [
    opts.name ? `Ciao ${opts.name},` : 'Ciao,',
    '',
    `Hai richiesto accesso alla demo di ${verticalLabel}.`,
    `Il tuo codice di accesso è:`,
    '',
    `    ${opts.code}`,
    '',
    `Vai su ${demoUrl} e inseriscilo per entrare.`,
    `Il codice è valido ${opts.expiresInDays} giorni ed è a uso singolo.`,
    '',
    'Un saluto,',
    'Albania Auto Legal Alliance',
  ].join('\n');

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject,
      html,
      text,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true, id: data?.id };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : 'Errore' };
  }
}

function renderDemoEmailHtml(o: {
  name?: string;
  code: string;
  verticalLabel: string;
  demoUrl: string;
  expiresInDays: number;
}) {
  const greeting = o.name ? `Ciao ${escapeHtml(o.name)},` : 'Ciao,';

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(o.verticalLabel)} — Codice demo</title>
</head>
<body style="margin:0;padding:0;background:#f6f1e6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#15192a;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f1e6;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 30px 60px -20px rgba(15,25,42,0.12);overflow:hidden;">
        <!-- header -->
        <tr>
          <td style="padding:36px 40px 20px 40px;border-bottom:1px solid #e7e0cf;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <div style="width:28px;height:28px;background:linear-gradient(135deg,#ecdcb0,#c9a849,#8a6717);clip-path:polygon(50% 6%, 91% 84%, 69% 84%, 63% 69%, 38% 69%, 31% 84%, 9% 84%);"></div>
                </td>
                <td style="vertical-align:middle;font-family:'Fraunces',Georgia,serif;font-size:18px;color:#15192a;letter-spacing:-0.01em;">
                  Albania Auto Legal Alliance
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#b08a3e;">Accesso demo</p>
            <h1 style="margin:0 0 16px 0;font-family:'Fraunces',Georgia,serif;font-size:30px;line-height:1.15;color:#15192a;font-weight:600;">
              Il tuo codice è pronto.
            </h1>
            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#3a4055;">
              ${greeting}<br>
              Hai richiesto l'accesso alla demo di <strong style="color:#15192a;">${escapeHtml(o.verticalLabel)}</strong>. Ecco il codice da inserire:
            </p>

            <!-- code box -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px 0;">
              <tr>
                <td align="center" style="background:linear-gradient(135deg,#f6f1e6,#efe7d3);border:1px solid #d8c08e;border-radius:14px;padding:24px;">
                  <div style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:0.2em;color:#15192a;">
                    ${escapeHtml(o.code)}
                  </div>
                  <div style="margin-top:8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8a8f9e;">
                    Valido ${o.expiresInDays} giorni · uso singolo
                  </div>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
              <tr>
                <td align="center">
                  <a href="${o.demoUrl}" style="display:inline-block;background:linear-gradient(135deg,#ecdcb0,#c9a849,#a07a26);color:#15192a;text-decoration:none;font-weight:600;font-size:14px;padding:14px 32px;border-radius:999px;letter-spacing:0.02em;">
                    Apri pagina demo →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;line-height:1.6;color:#5a6072;">
              Se il bottone non funziona, copia e incolla questo link nel browser:<br>
              <a href="${o.demoUrl}" style="color:#b08a3e;word-break:break-all;">${o.demoUrl}</a>
            </p>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="padding:24px 40px;background:#fbf8f0;border-top:1px solid #e7e0cf;text-align:center;">
            <p style="margin:0;font-size:12px;color:#8a8f9e;">
              Hai ricevuto questa email perché hai richiesto un accesso demo.<br>
              Auto · Legal · CRM · Medical · Webpages · Taxi App
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  );
}
