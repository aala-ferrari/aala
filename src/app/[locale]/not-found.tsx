import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center pt-24">
      <div className="container-aala max-w-md text-center">
        <p className="text-xs uppercase tracking-widest text-ink-mute">404</p>
        <h1 className="mt-4 font-display text-6xl tracking-tight">
          <span className="gold-text">Pagina non trovata</span>
        </h1>
        <p className="mt-4 text-ink-soft">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/" className="btn-primary mt-10">
          Torna alla home
        </Link>
      </div>
    </section>
  );
}
