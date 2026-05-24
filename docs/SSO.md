# Single Sign-On AALA → Prodotti

Il portale AALA emette un JWT firmato HS256 e reindirizza il browser al prodotto target.
Ogni prodotto verticale deve accettare un parametro di query `?aala_token=...`,
verificarne la firma con il segreto condiviso, e creare/aggiornare la sessione locale.

## Flusso

1. L'utente è loggato su `aala.<dominio>` (sessione Supabase).
2. Clicca "Apri prodotto" su `/account` → richiesta a `/api/sso/[product]`.
3. AALA verifica che l'utente abbia un abbonamento/ordine attivo per quel prodotto.
4. AALA firma un JWT con il segreto `AALA_SSO_SECRET` (HS256, scadenza 5 min) e
   reindirizza il browser a `<URL_PRODUCT_xxx>?aala_token=<jwt>`.
5. Il prodotto verifica il JWT, accetta o crea l'utente, imposta cookie di sessione locale.

## Payload del token

```json
{
  "sub": "<auth.users.id Supabase>",
  "email": "user@example.com",
  "aud": "auto" | "medical" | "legal" | "dental",
  "iss": "aala",
  "iat": 1716480000,
  "exp": 1716480300
}
```

## Modifiche richieste a ciascun prodotto

### `auto/backend` (Node.js)
Aggiungere endpoint `GET /sso/aala` che:
- legge `req.query.aala_token`
- verifica HS256 con `process.env.AALA_SSO_SECRET`
- valida `aud === 'auto'` e `iss === 'aala'` e `exp` > now
- trova/crea utente per `sub` o `email`
- imposta cookie di sessione locale
- reindirizza alla dashboard

```js
// pseudocodice
import jwt from 'jsonwebtoken';

app.get('/sso/aala', async (req, res) => {
  const token = req.query.aala_token;
  const payload = jwt.verify(token, process.env.AALA_SSO_SECRET, {
    algorithms: ['HS256'], audience: 'auto', issuer: 'aala',
  });
  const user = await db.users.upsert({ where: { aalaId: payload.sub }, ...});
  req.session.userId = user.id;
  res.redirect('/dashboard');
});
```

### `crm medical` (idem, framework specifico)

### `Super Avocati` (Python / FastAPI)

```python
import jwt
from fastapi import APIRouter, Response, HTTPException, Request

router = APIRouter()

@router.get("/sso/aala")
def sso(request: Request, aala_token: str):
    try:
        payload = jwt.decode(
            aala_token,
            settings.AALA_SSO_SECRET,
            algorithms=["HS256"],
            audience="legal",
            issuer="aala",
        )
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid SSO token")
    user = upsert_user(aala_id=payload["sub"], email=payload["email"])
    request.session["user_id"] = user.id
    return RedirectResponse("/dashboard")
```

### `dental-tourism`
Per dental il flusso può essere diverso: il portale ricevente gestisce lead,
non utenti finali. L'SSO potrebbe portare a una dashboard clinica partner.

## Segreto condiviso

`AALA_SSO_SECRET` deve essere identico nel portale e in tutti i prodotti.
Generarlo con: `openssl rand -hex 64`.
