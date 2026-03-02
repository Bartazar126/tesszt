# Louvresite

Párizsi jegyek értékesítő weboldal: **Louvre**, **Eiffel torony**, **Seine hajókruiz**.

## Tech

- **Next.js 14** (App Router)
- **TypeScript** (.tsx komponensek)
- **Node.js** (API routes a `app/api` alatt)
- Többnyelv: HU, EN, FR (i18n context + JSON)
- Mobilra optimalizált, touch-barát UI
- Admin felület: jegyek és rendelések kezelése

## Indítás

```bash
cd louvresite
npm install
npm run dev
```

Nyisd meg: [http://localhost:3000](http://localhost:3000).

## Struktúra

- `app/` – oldalak (page.tsx) és layout
- `app/api/` – API végpontok (pl. `admin/tickets`)
- `components/` – újrafelhasználható .tsx komponensek
- `i18n/` – nyelvek (hu, en, fr) és nyelvváltó context

## Admin

- Útvonal: `/admin`
- Jelenleg: jegyek listázása az API-ból
- Később: bejelentkezés, rendelések, árak módosítása
