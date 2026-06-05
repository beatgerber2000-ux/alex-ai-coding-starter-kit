# PROJ-2: Authentifizierung (Registrierung, Login, Logout)

## Status: Deployed
**Created:** 2026-06-04
**Last Updated:** 2026-06-05

## Dependencies
- Requires: **PROJ-1** (Supabase Infrastructure Setup) — Supabase-Client, Server-Client und Cookie-Handling sind die Grundlage für Auth-Sessions.

## User Stories
- Als neuer Nutzer möchte ich mich mit E-Mail und Passwort registrieren, damit ich ein eigenes Konto bekomme und sofort loslegen kann.
- Als wiederkehrender Nutzer möchte ich mich einloggen, damit ich Zugriff auf meinen geschützten App-Bereich habe.
- Als eingeloggter Nutzer möchte ich mich ausloggen, damit niemand sonst an meinem Gerät auf mein Konto zugreifen kann.
- Als Nutzer möchte ich über Page-Reloads und Browser-Neustarts eingeloggt bleiben, damit ich mich nicht ständig neu anmelden muss.
- Als sicherheitsbewusster Nutzer möchte ich, dass meine Daten hinter Login geschützt sind und Fehlermeldungen nichts über die Existenz von Konten verraten.

## Out of Scope
- **E-Mail-Bestätigung / Confirm-Email-Flow** — bewusst deaktiviert im MVP; spätere Härtung (P1/P2).
- **Passwort-zurücksetzen / „Passwort vergessen"** — nicht im MVP (eigenes späteres Feature).
- **Social-/OAuth-Login** (Google, GitHub etc.) — nicht im MVP.
- **„Angemeldet bleiben"-Checkbox**, manuell verkürzte Session-Dauer, eigene Session-Verwaltungsseite — nicht im MVP.
- **Profil-/Account-Verwaltung** (E-Mail ändern, Konto löschen) — nicht im MVP.
- **Team-Kollaboration, Rollen, Berechtigungen** — PROJ-7.
- **Inhalte des `/dashboard`** (Projekte/Aufgaben) — PROJ-3 / PROJ-4; hier nur eine geschützte Platzhalterseite.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Registrierung
- [ ] Angenommen ein nicht eingeloggter Besucher ist auf `/register`, wenn er gültige E-Mail, Passwort (≥ 8 Zeichen) und übereinstimmende Passwort-Bestätigung absendet, dann wird das Konto angelegt, er ist sofort eingeloggt und wird nach `/dashboard` weitergeleitet.
- [ ] Angenommen der Besucher ist auf `/register`, wenn er ein leeres Formular absendet, dann wird für jedes Pflichtfeld eine feldbezogene Fehlermeldung angezeigt.
- [ ] Angenommen der Besucher gibt eine E-Mail in ungültigem Format ein, wenn er absendet, dann erscheint eine Formatfehlermeldung am E-Mail-Feld.
- [ ] Angenommen der Besucher gibt ein Passwort mit weniger als 8 Zeichen ein, wenn er absendet, dann erscheint eine Fehlermeldung zur Mindestlänge.
- [ ] Angenommen „Passwort bestätigen" stimmt nicht mit dem Passwort überein, wenn er absendet, dann erscheint eine Fehlermeldung am Bestätigungsfeld.
- [ ] Angenommen die E-Mail ist bereits registriert, wenn er die Registrierung absendet, dann erscheint die neutrale Meldung „Registrierung konnte nicht abgeschlossen werden. Bitte versuche es mit einer anderen E-Mail oder melde dich an." inkl. Link zu `/login` — ohne offenzulegen, dass das Konto existiert.

### Login
- [ ] Angenommen ein registrierter Nutzer ist auf `/login`, wenn er korrekte E-Mail und Passwort eingibt, dann wird er eingeloggt und nach `/dashboard` weitergeleitet.
- [ ] Angenommen die Kombination aus E-Mail und Passwort ist falsch, wenn er absendet, dann erscheint die generische Meldung „E-Mail oder Passwort falsch." — ohne Hinweis, ob die E-Mail existiert.
- [ ] Angenommen ein Login-Pflichtfeld ist leer oder die E-Mail hat ungültiges Format, wenn er absendet, dann erscheint eine feldbezogene Fehlermeldung (beim Login keine Passwort-Mindestlängenprüfung).

### Geschützte Routen & Weiterleitungen
- [ ] Angenommen ein nicht eingeloggter Nutzer, wenn er `/dashboard` (oder eine andere geschützte Route) aufruft, dann wird er nach `/login` weitergeleitet.
- [ ] Angenommen ein eingeloggter Nutzer, wenn er `/login` oder `/register` aufruft, dann wird er nach `/dashboard` weitergeleitet.
- [ ] Angenommen ein nicht eingeloggter Nutzer, wenn er `/` aufruft, dann wird er nach `/login` weitergeleitet; ist er eingeloggt, nach `/dashboard`.
- [ ] Angenommen eine Session ist abgelaufen oder ungültig, wenn der Nutzer eine geschützte Route aufruft, dann wird er ohne kryptischen Fehler nach `/login` weitergeleitet.

### Logout & Session
- [ ] Angenommen ein eingeloggter Nutzer, wenn er auf „Logout" klickt, dann wird die Session beendet, die Auth-Cookies werden ungültig und er wird nach `/login` weitergeleitet.
- [ ] Angenommen ein Nutzer hat sich ausgeloggt, wenn er anschließend `/dashboard` aufruft, dann wird er nach `/login` weitergeleitet.
- [ ] Angenommen ein Nutzer ist eingeloggt, wenn er die Seite neu lädt oder den Browser neu startet, dann bleibt er eingeloggt (solange das Token gültig ist).

## Edge Cases
- **Leeres Formular** (Login/Registrierung) → feldbezogene Pflichtfeld-Fehler.
- **Ungültiges E-Mail-Format** → Formatfehler, kein Serveraufruf nötig.
- **Passwort/Bestätigung weichen ab** → Fehler am Bestätigungsfeld.
- **Bereits registrierte E-Mail** → neutrale Meldung, kein Enumeration-Leak.
- **Falsche Login-Kombination** → generische Meldung „E-Mail oder Passwort falsch.".
- **Netzwerk-/Serverfehler beim Absenden** → verständliche Fehlermeldung; **E-Mail-Feld bleibt erhalten, Passwortfelder werden aus Sicherheitsgründen geleert**; kein sonstiger Eingabeverlust.
- **Doppelter Klick / Mehrfach-Submit** → Submit-Button wird während der Verarbeitung deaktiviert (Loading-State), keine doppelte Kontoanlage.
- **Abgelaufene Session während der Nutzung** → beim nächsten geschützten Zugriff Weiterleitung zu `/login`.
- **Manuelles Aufrufen einer geschützten URL ohne Session** → Weiterleitung zu `/login` (serverseitig via Middleware, nicht nur clientseitig versteckt).
- **Brute-Force-Versuche** → für den MVP Verlass auf Supabase-eigene Auth-Rate-Limits (kein eigenes Rate-Limiting).

## Technical Requirements (optional)
- Security: Validierung clientseitig (Zod) **und** serverseitig; Login-/Registrierungsfehler bewusst generisch (Enumeration-Schutz).
- Security: **Keine Passwörter, Session-Tokens oder Auth-Cookies in Logs ausgeben.**
- Security: Bei Fehlern werden Passwortfelder geleert; E-Mail-Eingabe bleibt erhalten.
- Security: Routenschutz serverseitig über `@supabase/ssr`-Middleware und Cookie-basierte Session-Prüfung.
- Config: Supabase „Confirm email" für den MVP **deaktivieren**; Passwort-Mindestlänge 8.
- UX: Loading-States und feldbezogene Fehlermeldungen in beiden Formularen.

## Open Questions
- [x] Logout-Button-Platzierung für den MVP. **Entschieden (2026-06-04):** Ein schlichter Logout-Button auf der `/dashboard`-Platzhalterseite genügt. Ein finaler Header bzw. ein Nutzermenü kommt später mit der echten Projekt-/Aufgabenansicht (ab PROJ-3).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Keine E-Mail-Bestätigung im MVP („Confirm email" aus) | Vermeidet SMTP/Domain + Bestätigungs-Flow; hält MVP schlank; nachrüstbar | 2026-06-04 |
| Nach Registrierung sofort eingeloggt → `/dashboard` | Schnellster Weg in die App, weniger Reibung | 2026-06-04 |
| Passwort-Mindestlänge 8 (keine Komplexitätsregeln) | Einfache Härtung über Supabase-Default (6), ohne UX-Last | 2026-06-04 |
| Generische Login-Fehlermeldung | Schutz vor User-Enumeration | 2026-06-04 |
| Generische Meldung bei bereits registrierter E-Mail | Konsistenter Enumeration-Schutz; Komfortverlust akzeptiert | 2026-06-04 |
| Passwortfelder bei Fehlern leeren, E-Mail behalten | Sicherheit (keine Passwörter im DOM belassen) bei guter UX | 2026-06-04 |
| Routenschutz serverseitig via `@supabase/ssr`-Middleware | Sicher (nicht nur clientseitig versteckt); nutzt PROJ-1-Grundlage | 2026-06-04 |
| `/dashboard` als generisches Landeziel | `/projects` kommt erst mit PROJ-3 | 2026-06-04 |
| Keine „Angemeldet bleiben"-Option; Session standardmäßig persistent | MVP-Schlankheit; Default genügt | 2026-06-04 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| **Server Actions** für signUp/signIn/signOut | Weniger Boilerplate, kein separater API-Endpoint, native Next-16-Integration; Redirect direkt in der Action | 2026-06-04 |
| **Middleware** als zentraler Routenschutz | Eine Stelle für Session-Refresh + Redirects; serverseitig (nicht clientseitig umgehbar) | 2026-06-04 |
| **Zod-Schema geteilt** (Client + Server) | Gleiche Regeln für UX-Feedback und verbindliche Server-Prüfung; kein Doppelpflegen | 2026-06-04 |
| **react-hook-form + shadcn Form** | Bereits im Stack; saubere feldbezogene Fehlermeldungen + Loading-States | 2026-06-04 |
| **Keine eigene User-Tabelle** | Supabase `auth.users` deckt Konten/Passwort-Hashing ab; eigene Profiltabellen erst bei Bedarf | 2026-06-04 |
| **Generische Fehlermeldungen** in der Action (Login + bereits registrierte E-Mail) | Enumeration-Schutz, serverseitig erzwungen | 2026-06-04 |
| **Passwortfelder bei Fehler leeren, E-Mail behalten** | Keine Passwörter im DOM belassen; gute UX | 2026-06-04 |
| **Keine neuen Pakete** | `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner` bereits vorhanden | 2026-06-04 |

---

## Tech Design (Solution Architect)

### A) Struktur (Seiten & Bausteine)

```
src/middleware.ts                  Läuft vor jeder Anfrage:
                                   - frischt die Supabase-Session auf (Cookie)
                                   - schützt Routen & leitet je nach Session um

src/app/
├── page.tsx            (/)        Redirect: eingeloggt → /dashboard, sonst → /login
├── login/page.tsx      (/login)   Öffentlich — Login-Formular
├── register/page.tsx   (/register) Öffentlich — Registrierungs-Formular
└── dashboard/page.tsx  (/dashboard) Geschützt — Platzhalter + Logout-Button

src/app/auth/actions.ts            Server Actions: signUp, signIn, signOut
                                   (Zod serverseitig, Supabase-Aufruf, Redirect)

src/lib/auth/validation.ts         Zod-Schemas (Login & Registrierung),
                                   gemeinsam von Client (UX) und Server genutzt

src/components/auth/
├── login-form.tsx                 Client-Komponente (react-hook-form + Zod)
└── register-form.tsx              Client-Komponente (react-hook-form + Zod)
```

Formular-Bausteine (aus vorhandenem shadcn/ui): Card, Form, Input (E-Mail/Passwort/Bestätigung), feldbezogene + generische Fehlermeldung, Submit-Button mit Loading-/Disabled-State, Link zur jeweils anderen Seite.

### B) Datenmodell

PROJ-2 legt **keine eigenen Tabellen** an. Nutzerkonten verwaltet Supabase in `auth.users`:

```
Pro Nutzer (von Supabase verwaltet):
- ID (UUID)            → wird später Besitzer von Projekten/Aufgaben (PROJ-3/4)
- E-Mail
- Passwort (gehasht, nie im Klartext, nie für uns sichtbar)
- Zeitstempel

Session: verschlüsseltes Cookie, serverseitig via @supabase/ssr verwaltet
Supabase-Konfiguration: "Confirm email" = AUS (MVP)
```

### C) Schutz-Ablauf

```
Anfrage an eine Route
        │
        ▼
   middleware.ts ── Session aus Cookie lesen/auffrischen
        │
        ├─ geschützte Route + keine Session   → Redirect /login
        ├─ /login oder /register + Session     → Redirect /dashboard
        └─ sonst → weiter zur Seite

Formular-Absenden (z. B. Login)
        │  (Client: Zod-Validierung für sofortiges Feedback)
        ▼
   Server Action ── Zod-Validierung (verbindlich) ── supabase.auth.* ── Cookie setzen
        │
        ├─ Erfolg → redirect('/dashboard')
        └─ Fehler → generische/feldbezogene Meldung zurück (Passwortfelder leeren)
```

### D) Sicherheits- & Robustheitsvorgaben (verbindlich für Umsetzung)

**Server Actions:**
- Keine Passwörter, Session-Tokens oder Auth-Cookies loggen.
- Passwortfelder bei Fehlern leeren (E-Mail bleibt erhalten).
- Fehlermeldungen bei Login und bei bereits registrierter E-Mail generisch halten (Enumeration-Schutz).

**Middleware:**
- Keine Redirect-Endlosschleifen erzeugen.
- Öffentliche Routen `/login` und `/register` korrekt vom Schutz ausschließen.
- Health-Route `/api/health/supabase` **nicht** blockieren.
- Static Assets, Next.js-interne Pfade (`_next/*`, Favicon etc.) und nicht zu schützende API-Routen sauber per Matcher ausschließen.

### E) Abhängigkeiten

**Keine neuen Pakete nötig** — alle vorhanden:
- `@supabase/ssr`, `@supabase/supabase-js` (PROJ-1)
- `react-hook-form`, `zod`, `@hookform/resolvers`
- `sonner` (Toasts, optional für Erfolg/Fehler)

## Implementation Notes (Frontend)
**Implementiert am:** 2026-06-04

**Was gebaut wurde (UI + Client-Validierung):**
- `src/lib/auth/validation.ts` — geteilte Zod-Schemas (`loginSchema`, `registerSchema`) für Client **und** (künftig) Server.
- `src/components/auth/login-form.tsx`, `register-form.tsx` — Client-Komponenten mit react-hook-form + zodResolver, feldbezogene Fehler, Loading-/Disabled-State, generische Fehleranzeige; **Passwortfelder werden bei Fehlern geleert** (E-Mail bleibt).
- `src/app/login/page.tsx`, `src/app/register/page.tsx` — zentrierte Card-Layouts (shadcn) mit Querverlinkung.
- `src/app/dashboard/page.tsx` — geschützte Platzhalterseite mit Header, Nutzer-E-Mail und Logout-Button (`<form action={signOut}>`); server-seitiger Page-Guard via `supabase.auth.getUser()` (Defense-in-Depth zusätzlich zur Middleware).
- `src/app/page.tsx` — Startseite leitet je nach Session weiter (`/dashboard` bzw. `/login`).
- `src/app/auth/actions.ts` — **Seam zum Backend**: typisierte Server Actions `signIn`/`signUp`/`signOut` mit Fehlerkontrakt (`AuthActionState`), aktuell Platzhalter („noch nicht verbunden"). Echte Supabase-Logik, serverseitige Zod-Prüfung, generische Fehlermeldungen und Redirects kommen in `/backend`.

**Verifiziert:**
- `npm run build` → erfolgreich (Routen `/`, `/login`, `/register`, `/dashboard`, Health-Route).
- `npm run lint` → grün.
- Live-Smoke-Test (Dev): `/` → 307 `/login`; `/login` 200; `/register` 200; `/dashboard` → 307 `/login` (Page-Guard greift).

**Bewusst dem Backend überlassen (`/backend`):**
- Echte Auth über `@supabase/ssr` (signUp/signInWithPassword/signOut) inkl. Cookie-Handling und serverseitigem Redirect.
- `src/middleware.ts` (zentraler Routenschutz, Session-Refresh, Matcher-Ausschlüsse für `/login`, `/register`, `/api/health/supabase`, Static/_next).
- Serverseitige Zod-Validierung + generische Fehlermeldungen (Login & bereits registrierte E-Mail).
- Supabase-Konfiguration „Confirm email" = AUS.

**Logout-Button:** Entschieden — schlichter Logout-Button auf der `/dashboard`-Platzhalterseite (so umgesetzt). Finaler Header/Nutzermenü erst mit der echten Projekt-/Aufgabenansicht (ab PROJ-3).

## Implementation Notes (Backend)
**Implementiert am:** 2026-06-05

**Was gebaut wurde (echte Auth-Logik):**
- `src/app/auth/actions.ts` — Server Actions mit echter Supabase-Auth über `@supabase/ssr`:
  - `signIn`: serverseitige Zod-Prüfung → `signInWithPassword` → bei Erfolg `revalidatePath` + `redirect('/dashboard')`; bei Fehler generische Meldung „E-Mail oder Passwort falsch." (kein Enumeration-Leak).
  - `signUp`: Zod-Prüfung → `signUp` → Erfolg nur bei vorhandener Session (Confirm-Email AUS) → `/dashboard`; bei Fehler/ohne Session neutrale Meldung (deckt „bereits registriert" generisch ab).
  - `signOut`: `signOut` → `revalidatePath` + `redirect('/login')`.
  - Keine Passwörter/Tokens/Cookies werden geloggt.
- `src/middleware.ts` — zentraler Routenschutz + Session-Refresh:
  - Nicht eingeloggt + geschützte Route → `/login`; eingeloggt + `/login`/`/register` → `/dashboard`.
  - API-Routen (inkl. `/api/health/supabase`) werden nicht umgeleitet, nur Session refreshed.
  - Aufgefrischte Session-Cookies werden bei Redirects erhalten (kein Session-Verlust).
  - Matcher schließt `_next/static`, `_next/image`, `favicon.ico` und Bild-Assets aus.
  - Keine Redirect-Endlosschleifen (verifiziert).

**Tests:**
- `src/lib/auth/validation.test.ts` — 9 Tests (Login-/Register-Schema, Pflichtfelder, Format, Mindestlänge, Passwort-Match).
- `src/app/auth/actions.test.ts` — 7 Tests (signIn Erfolg/falsch/ungültig, signUp Erfolg/bereits-registriert/keine-Session/Passwort-Mismatch, signOut), mit gemocktem Supabase-Client, `redirect` und `revalidatePath`.

**Verifiziert:**
- `npm test` → **21/21 grün** (Health-Route 5, Validierung 9, Actions 7).
- `npm run build` → erfolgreich; Middleware registriert (`ƒ Proxy (Middleware)`).
- `npm run lint` → grün.
- Live-Smoke-Test Middleware: `/`→`/login`, `/login` 200, `/register` 200, `/dashboard`→`/login`, `/api/health/supabase` 200 (nicht blockiert), keine Endlosschleifen.

**Config-Fix (Tooling):**
- `vitest.config.ts` — `include: ['src/**/*.{test,spec}.{ts,tsx}']` ergänzt, damit Vitest nur co-locatete Unit-/Integrationstests sammelt und die Playwright-E2E-Tests in `tests/` (über `npm run test:e2e`) nicht mehr fälschlich einliest.

**WICHTIG — manueller Schritt vor QA/Nutzung:**
- In Supabase muss **„Confirm email" deaktiviert** sein (Authentication → Providers/Email bzw. Sign In/Up Settings). Andernfalls liefert `signUp` keine Session und die Registrierung schlägt mit der neutralen Meldung fehl. (QA verifiziert den echten End-to-End-Flow.)

## QA Test Results
**Getestet am:** 2026-06-05 · **Tester:** QA (Claude) · **Build:** Next 16.1.1, lokal · Supabase mit „Confirm email" = AUS

### Zusammenfassung
- **Akzeptanzkriterien:** 16 von 16 bestanden
- **Bugs:** 0 Critical · 0 High · 0 Medium · 2 Low (Tooling/Prozess)
- **Security-Audit:** keine Schwachstellen gefunden
- **Production-Ready:** ✅ **JA** (keine Critical/High-Bugs)

### Testumgebung
- Live gegen echtes Supabase-Projekt (EU), reale Registrierung/Login.
- E2E über Playwright (Chromium), Dev-Server via Playwright webServer.

### Akzeptanzkriterien (E2E + Unit)
| Bereich | Kriterien | Ergebnis |
|---------|-----------|----------|
| Registrierung: gültig → eingeloggt → /dashboard | AC | ✅ E2E |
| Registrierung: leeres Formular → Feldfehler | AC | ✅ E2E |
| Registrierung: ungültiges E-Mail-Format | AC | ✅ E2E |
| Registrierung: Passwort < 8 Zeichen | AC | ✅ E2E |
| Registrierung: Passwort-Bestätigung weicht ab | AC | ✅ E2E |
| Registrierung: bereits registrierte E-Mail → neutrale Meldung | AC | ✅ E2E |
| Login: korrekt → /dashboard | AC | ✅ E2E |
| Login: falsche Kombination → generische Meldung | AC | ✅ E2E |
| Login: Pflichtfeld/Format-Fehler | AC | ✅ Unit (Schema) |
| Routenschutz: nicht eingeloggt + /dashboard → /login | AC | ✅ E2E |
| Routenschutz: eingeloggt + /login → /dashboard | AC | ✅ E2E |
| Startseite / → Session-abhängige Weiterleitung | AC | ✅ E2E/Smoke |
| Session abgelaufen/ungültig → /login | AC | ✅ (getUser-Validierung, Routenschutz) |
| Logout → Session beendet → /login | AC | ✅ E2E |
| Nach Logout /dashboard nicht erreichbar | AC | ✅ E2E |
| Session bleibt über Reload/Login erhalten | AC | ✅ E2E |

### Edge Cases
| Fall | Ergebnis |
|------|----------|
| Leeres Formular | ✅ Feldbezogene Fehler |
| Ungültiges E-Mail-Format | ✅ Formatfehler |
| Passwort/Bestätigung weichen ab | ✅ Fehler am Bestätigungsfeld |
| Bereits registrierte E-Mail | ✅ Neutrale Meldung, kein Enumeration-Leak |
| Falsche Login-Kombination | ✅ Generische Meldung |
| Manueller Zugriff auf geschützte URL ohne Session | ✅ Redirect /login (Middleware) |
| Keine Redirect-Endlosschleifen | ✅ Verifiziert (Smoke + E2E) |
| /api/health/supabase nicht blockiert | ✅ Verifiziert |

### Security-Audit (Red Team)
- **Auth-Bypass:** /dashboard ohne Session → /login; Schutz serverseitig in Middleware **und** Page-Guard. ✅
- **Token-Validierung:** überall `getUser()` (validiert serverseitig) statt spoofbarem `getSession()`. ✅
- **User-Enumeration:** Login („E-Mail oder Passwort falsch.") und Registrierung (neutrale Meldung) konsistent generisch. ✅
- **Injection/XSS:** E-Mail-Format wird per Zod erzwungen; Fehlermeldungen sind statische Strings (kein Echo von Eingaben); React escapt Ausgaben. Kein reflektiertes XSS gefunden. ✅
- **Logging:** keine Passwörter/Tokens/Cookies im Auth-Code geloggt. ✅
- **Secrets:** kein Service-Role-Key im Code; nur öffentlicher Anon-Key clientseitig. ✅
- **Session-Cookies:** via `@supabase/ssr`-Defaults (httpOnly Auth-Cookies); funktionierende Persistenz per E2E bestätigt. *(httpOnly-Flag über Framework-Default, nicht zusätzlich manuell inspiziert.)*

### Automatisierte Tests
- **Vitest:** 21/21 grün (Health 5, Validierungs-Schemas 9, Server Actions 7).
- **Playwright E2E:** 13/13 grün (PROJ-1: 3, PROJ-2: 10).

### Regression
- PROJ-1 (Deployed): Health-Route E2E weiterhin grün, keine Regression.

### Nicht zutreffend / Limitierungen
- **Cross-Browser:** nur Chromium getestet (Firefox/WebKit-Binaries nicht installiert). Auth-UI nutzt Standard-shadcn/ui — geringes Risiko, aber nicht verifiziert.
- **Responsive (375/768/1440):** nicht explizit pro Breakpoint getestet; Layout ist eine zentrierte Card (unkritisch).

### Bugs / Offene Punkte
- **[Low] Tooling:** Next 16 markiert die `middleware.ts`-Konvention als deprecated (Empfehlung: `proxy.ts`). Funktioniert aktuell einwandfrei (Build registriert „ƒ Proxy (Middleware)"). Migration kann später erfolgen.
- **[Low] Testdaten:** Die E2E-Registrierungstests legen reale Supabase-Nutzer an (`qa-*@example.com`). Für ein Übungsprojekt akzeptabel; Empfehlung: separates Test-Projekt oder gelegentliches Aufrämen der Test-Accounts.
- **[Hinweis] Voraussetzung:** „Confirm email" muss in Supabase deaktiviert bleiben, sonst schlägt die Registrierung (neutral) fehl.

## Deployment
**Deployed am:** 2026-06-05 · **Plattform:** Vercel (Auto-Deploy via GitHub-Push)

- **Production-URL:** https://alex-ai-coding-starter-kit.vercel.app
- **Login:** `/login` · **Registrierung:** `/register` · **Geschützt:** `/dashboard`
- **Git-Tag:** `v1.1.0-PROJ-2`

### Pre-Deployment-Checks
- ✅ `npm run build` lokal erfolgreich (Middleware registriert)
- ✅ `npm run lint` grün
- ✅ QA approved, keine Critical/High-Bugs
- ✅ Env-Variablen in Vercel gesetzt (aus PROJ-1, unverändert); keine Secrets committet
- N/A DB-Migrationen (Supabase verwaltet `auth.users`)

### Production-Verifikation (live, echter Browser)
- ✅ Routing/Middleware: `/`→`/login`, `/login` 200, `/register` 200, `/dashboard`→`/login`, `/api/health/supabase` 200 (nicht blockiert)
- ✅ Registrierung → sofort eingeloggt → `/dashboard` („Willkommen" sichtbar)
- ✅ Logout → `/login`; `/dashboard` danach gesperrt
- ✅ Login → `/dashboard`; Session bleibt über Reload erhalten
- ✅ Security-Header auf `/login` gesetzt (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS)

### Voraussetzungen (bestätigt)
- Supabase „Confirm email" = AUS.
- Supabase-Env-Variablen in Vercel gesetzt (nur Anon-Key, kein Service-Role-Key).

### Offene Punkte / Empfehlungen
- **[Low]** `middleware.ts` → später auf `proxy.ts` migrieren (Next-16-Deprecation; funktioniert aktuell).
- **[Low]** Reale QA-Test-Nutzer (`qa-*@example.com`) in Supabase ggf. aufräumen.
- Error-Tracking (Sentry) + Lighthouse-Check weiterhin empfohlen vor breiterem Rollout (siehe `docs/production/`).
