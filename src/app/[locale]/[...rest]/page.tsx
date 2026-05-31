import { notFound } from 'next/navigation';

// Catch-all per le rotte inesistenti SOTTO una lingua (es. /it/qualcosa-che-non-esiste).
// Senza questa, Next renderizza il 404 fuori dal layout [locale] → mancano <html>/<body>
// ("Missing required html tags"). Così invece il notFound() passa per il layout giusto
// e mostra [locale]/not-found.tsx con tutta la cornice (Nav, Footer, html/body).
export default function CatchAllNotFound() {
  notFound();
}
