export const metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <section className="pt-32 pb-24">
      <div className="container-aala max-w-3xl prose">
        <h1 className="font-display text-5xl tracking-tight">Privacy Policy</h1>
        <p className="text-ink-soft">Ultimo aggiornamento: da definire</p>

        <div className="mt-10 space-y-6 text-ink-soft leading-relaxed">
          <p>
            Questo è un placeholder. Il testo definitivo va redatto con un legale
            in base ai trattamenti effettivi (raccolta lead, pagamenti, cookies,
            servizi cloud Supabase/Stripe/Vercel).
          </p>
          <p>
            Punti minimi da coprire: titolare del trattamento, base giuridica,
            categorie di dati, conservazione, diritti GDPR, contatti DPO.
          </p>
        </div>
      </div>
    </section>
  );
}
