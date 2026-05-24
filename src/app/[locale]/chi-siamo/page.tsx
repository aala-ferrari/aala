import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chi siamo',
  description: 'La storia, la missione e i valori di Albania Auto Legal Alliance.',
};

export default function AboutPage() {
  return (
    <section className="pt-32 pb-24">
      <div className="container-aala max-w-3xl">
        <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
          Una <span className="gold-text">alleanza</span> di competenze.
        </h1>
        <div className="prose mt-10 max-w-none space-y-6 text-lg leading-relaxed text-ink-soft">
          <p>
            AALA — Albania Auto Legal Alliance — nasce dall'esigenza di unire sotto un'unica
            promessa di qualità quattro mondi che apparentemente non si parlano:
            medico, automotive, legale, turismo dentale.
          </p>
          <p>
            Quello che hanno in comune è ciò che fa la differenza per chi gestisce
            un'impresa: <span className="text-ink">tempo, fiducia, controllo</span>.
          </p>
          <p>
            Costruiamo software che durano, non che stupiscono e basta. E quando un cliente
            ne sceglie uno, sa che può contare su un solo referente per tutto.
          </p>
        </div>
      </div>
    </section>
  );
}
