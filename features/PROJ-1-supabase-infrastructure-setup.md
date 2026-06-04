# PROJ-1: Supabase Infrastructure Setup

## Status: Approved
**Created:** 2026-06-04
**Last Updated:** 2026-06-04

## Dependencies
- None

## User Stories
- Als Entwickler möchte ich einen funktionsfähigen, konfigurierten Supabase-Client im Projekt haben, damit nachfolgende Features (Auth, Projekte, Aufgaben) direkt auf eine verbundene Datenbank zugreifen können.
- Als Entwickler möchte ich eine klare Environment-Variable-Konvention mit Beispieldatei, damit ich das Projekt lokal ohne Rätselraten konfigurieren kann.
- Als Entwickler möchte ich eine einfache Health-Check-Route, damit ich und QA mit einem Blick verifizieren können, ob die Supabase-Verbindung steht.
- Als sicherheitsbewusster Betreiber möchte ich sicherstellen, dass keine sensiblen Schlüssel im Frontend landen, damit die App von Anfang an sicher aufgebaut ist.

## Out of Scope
- Datenbankschema und RLS-Policies für `projects` — gehört zu **PROJ-3**.
- Datenbankschema und RLS-Policies für `tasks` — gehört zu **PROJ-4**.
- Registrierungs-, Login- und Logout-UI sowie Session-Handling — gehört zu **PROJ-2** (PROJ-1 bereitet E-Mail/Passwort-Auth in Supabase nur vor bzw. dokumentiert es als Voraussetzung).
- Dauerhafte Health-/Status-Seite — die Health-Check-Route ist ein temporäres Setup-/QA-Hilfsmittel und darf später entfernt oder ersetzt werden.
- Produktiv-Deployment und Vercel-Env-Konfiguration — gehört zu `/deploy`.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen die Env-Variablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` sind korrekt gesetzt, wenn die App gestartet wird, dann initialisiert sich der Supabase-Client ohne Fehler.
- [ ] Angenommen die Env-Variablen sind korrekt gesetzt, wenn die Health-Check-Route (`/api/health/supabase`) aufgerufen wird, dann antwortet sie mit einem Erfolgsergebnis „Supabase verbunden".
- [ ] Angenommen mindestens eine benötigte Env-Variable fehlt und die App läuft im Development-Modus, wenn die Health-Check-Route aufgerufen wird, dann antwortet sie mit einer verständlichen Fehlermeldung, die benennt welche Variable fehlt — **ohne** den Wert eines Schlüssels auszugeben.
- [ ] Angenommen ein Fehler tritt auf und die App läuft im Production-Modus, wenn die Health-Check-Route aufgerufen wird, dann gibt sie nur einen minimalen Status („verbunden" / „nicht verbunden") zurück — ohne Env-Namen, Schlüsselwerte, interne Details oder Stacktraces.
- [ ] Angenommen die Env-Variablen sind gesetzt, aber Supabase ist nicht erreichbar, wenn die Health-Check-Route aufgerufen wird, dann antwortet sie mit einer klaren „Verbindung fehlgeschlagen"-Meldung (Development) bzw. „nicht verbunden" (Production) statt eines unbehandelten Fehlers.
- [ ] Angenommen ein Entwickler richtet das Projekt neu ein, wenn er die Beispiel-Env-Datei (`.env.local.example`) kopiert, dann sind alle benötigten Variablen dokumentiert und keine echten Secrets enthalten.
- [ ] Angenommen die App ist gebaut, wenn das Client-Bundle inspiziert wird, dann ist kein Service-Role-Key und kein sensibler Schlüssel enthalten (nur der öffentliche Anon-Key).
- [ ] Angenommen die Health-Check-Route wird aufgerufen, wenn sie eine Antwort liefert, dann werden keine echten Nutzerdaten und keine Schlüsselwerte zurückgegeben.

## Edge Cases
- **Fehlende Env-Variable (Development):** Health-Check meldet konkret die fehlende Variable, ohne Werte preiszugeben.
- **Fehlende Env-Variable / Fehler (Production):** Health-Check gibt nur minimalen Status aus, keine Env-Namen, keine Details, keine Stacktraces.
- **Falsche/ungültige URL oder Key:** Verbindung schlägt fehl → klare Fehlermeldung (Dev) bzw. „nicht verbunden" (Prod), kein Crash der App.
- **Supabase nicht erreichbar / Timeout:** Health-Check fängt den Fehler ab und gibt „Verbindung fehlgeschlagen" (Dev) bzw. „nicht verbunden" (Prod) zurück.
- **Versehentliche Verwendung des Service-Role-Keys clientseitig:** muss durch Konvention/Doku ausgeschlossen sein (Service-Role nur serverseitig).
- **Health-Route in Produktion erreichbar:** gibt nur Status (verbunden/nicht verbunden) aus, niemals Secrets oder Nutzerdaten.

## Technical Requirements (optional)
- Security: Keine Secrets im Client-Bundle; nur öffentlicher Anon-Key clientseitig; Service-Role-Key ausschließlich serverseitig.
- Security: Health-Check unterscheidet Development (konkrete Setup-Hinweise) und Production (nur minimaler Status, keine internen Details).
- Hosting: Supabase-Projekt in EU-Region.
- Config: Alle Credentials ausschließlich über Environment Variables.

## Open Questions
- [x] Soll die Health-Check-Route in Produktion deaktiviert/abgesichert werden? **Vorläufig entschieden:** Route darf offen bleiben, solange sie in Production nur minimalen Status ohne Details ausgibt. Finale Prüfung in `/architecture` und `/deploy`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| PROJ-1 liefert nur Infrastruktur, kein MVP-Schema | Single Responsibility — Tabellen/RLS gehören fachlich zu PROJ-3/PROJ-4 und sind dort einzeln testbar | 2026-06-04 |
| Verifizierung über temporäre Health-Check-Route | Macht den Setup-Erfolg für QA eindeutig und testbar, ohne echtes Feature | 2026-06-04 |
| Health-Route gibt niemals Secrets/Nutzerdaten aus | Sicherheits-Constraint des Projekts; Route ist nur Status-Indikator | 2026-06-04 |
| Health-Route unterscheidet Dev (Details) und Prod (nur Status) | Hilfreich beim lokalen Setup, aber keine Informationspreisgabe in Produktion | 2026-06-04 |
| E-Mail/Passwort-Auth wird nur vorbereitet, nicht implementiert | Auth-UI/Flows sind eigenständiges Feature PROJ-2 | 2026-06-04 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `@supabase/ssr` einführen (zusätzlich zu `@supabase/supabase-js`) | Sauberes, Cookie-basiertes Session-Handling für Next.js App Router; macht PROJ-2 (Auth) zuverlässig und vermeidet späteren Umbau | 2026-06-04 |
| Trennung Browser-Client / Server-Client | Sicherheitsgrenze: sensible Operationen bleiben serverseitig, Browser sieht nur den öffentlichen Anon-Key | 2026-06-04 |
| Health-Check als Server-Route (`/api/health/supabase`) | Antwort kann serverseitig kontrolliert geformt werden; keine Secrets gelangen ins Frontend | 2026-06-04 |
| Dev/Prod-Unterscheidung in der Health-Antwort | Hilft beim lokalen Setup, verhindert aber Informationspreisgabe in Produktion | 2026-06-04 |
| `.env.local.example` als Vorlage, ohne Service-Role-Key | PROJ-1 prüft nur die Grundverbindung — dafür reicht der Anon-Key; weniger Secrets = weniger Risiko. Service-Role-Key wird erst aufgenommen, wenn ein serverseitiges Feature ihn zwingend braucht | 2026-06-04 |

---

## Tech Design (Solution Architect)

### A) Struktur (Datei-/Bausteinübersicht)

```
src/lib/supabase/
├── client.ts        Browser-Client (nutzt nur den öffentlichen Anon-Key)
└── server.ts        Server-Client (liest/schreibt Auth-Cookies, läuft serverseitig)

src/app/api/health/supabase/
└── route.ts         Health-Check-Endpoint (serverseitig)

.env.local.example   Vorlage mit allen benötigten Env-Variablen (ohne echte Werte)
```

- **Browser-Client** wird von UI-Komponenten genutzt (ab PROJ-2). Enthält nur den öffentlichen Anon-Key — unkritisch im Frontend.
- **Server-Client** läuft nur serverseitig und kümmert sich später um Auth-Sessions über Cookies. Hier landet niemals ein sensibler Schlüssel im Browser.
- **Health-Route** ist bewusst ein Server-Endpoint, damit der Verbindungstest serverseitig passiert und die Antwort kontrolliert geformt wird.

### B) Datenmodell

PROJ-1 legt **keine** fachlichen Tabellen an. Es geht ausschließlich um die Verbindung. Konfiguriert wird über Environment Variables (nicht im Code):

```
- NEXT_PUBLIC_SUPABASE_URL      → Adresse des Supabase-Projekts (EU-Region)
- NEXT_PUBLIC_SUPABASE_ANON_KEY → öffentlicher Schlüssel, darf im Browser sein

Tabellen: keine (projects → PROJ-3, tasks → PROJ-4)
```

Die Health-Route verwendet **ausschließlich** `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Der Service-Role-Key wird in PROJ-1 nicht verwendet und nicht in `.env.local.example` aufgenommen, solange kein serverseitiges Feature ihn zwingend benötigt.

### C) Health-Check-Verhalten (Dev vs. Prod)

```
Aufruf von /api/health/supabase
│
├── Development:
│   ├── ✅ { status: "connected", message: "Supabase verbunden" }
│   └── ❌ { status: "error", message: "Env-Variable NEXT_PUBLIC_... fehlt" }
│        (konkreter Hinweis, aber NIE der Schlüsselwert)
│
└── Production:
    ├── ✅ { status: "connected" }
    └── ❌ { status: "disconnected" }
         (kein Env-Name, keine Details, kein Stacktrace)
```

### D) Dependencies (zu installieren)

- **`@supabase/ssr`** — Server-/Browser-Client-Trennung und Cookie-basierte Sessions für Next.js App Router
- *(bereits vorhanden: `@supabase/supabase-js`)*

## Implementation Notes (Backend)
**Implementiert am:** 2026-06-04

**Was gebaut wurde:**
- `@supabase/ssr` installiert (zusätzlich zum vorhandenen `@supabase/supabase-js`).
- `src/lib/supabase/client.ts` — Browser-Client (Anon-Key).
- `src/lib/supabase/server.ts` — Server-Client mit Cookie-Handling (async `cookies()` für Next 16).
- `src/app/api/health/supabase/route.ts` — Health-Check-Route (`force-dynamic`):
  - Prüft Env-Variablen, initialisiert den Client (`auth.getSession()`) und verifiziert Erreichbarkeit über den öffentlichen Auth-Health-Endpoint (`/auth/v1/health`) — keine Tabellen, keine Nutzerdaten.
  - **Development:** konkrete Meldungen (fehlende Variable, Fehlertext). **Production:** nur `{ status: "connected" | "disconnected" }`, keine Details/Stacktraces/Env-Namen.
  - Gibt niemals Schlüsselwerte oder Nutzerdaten aus (per Test abgesichert).
- Veralteter Platzhalter `src/lib/supabase.ts` entfernt (wurde nirgends importiert).
- Integrationstest `src/app/api/health/supabase/route.test.ts` — 5 Tests (connected, fehlende Env-Variable, kein Key-Leak, Supabase nicht erreichbar, Client-Fehler). Alle grün.

**Verifiziert:**
- `npm test` → 5/5 grün.
- `npm run build` → erfolgreich; Route korrekt als dynamisch (ƒ) erkannt.

**Abweichungen / Hinweise:**
- `.env.local.example` enthielt bereits `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` ohne Service-Role-Key — Vorgabe damit erfüllt; die Datei ist durch Berechtigungseinstellungen schreibgeschützt und wurde nicht verändert.
- `npm run lint` (`next lint`) ist in Next 16 deprecated und schlägt fehl; der TypeScript-Check des Builds deckt die Typprüfung ab.
- Echter Verbindungstest gegen ein Supabase-Projekt erfolgt durch QA mit gesetzten `.env.local`-Werten.

## QA Test Results
**Getestet am:** 2026-06-04 · **Tester:** QA (Claude) · **Build:** Next 16.1.1, lokal

### Zusammenfassung
- **Akzeptanzkriterien:** 8 von 8 bestanden
- **Bugs:** 0 Critical · 0 High · 0 Medium · 1 Low (Tooling, nicht feature-bezogen)
- **Security-Audit:** keine Schwachstellen gefunden
- **Production-Ready:** ✅ **JA** (keine Critical/High-Bugs)

### Testumgebung
- Echte `.env.local` (vom Nutzer angelegt) gegen ein laufendes Supabase-Projekt.
- URL-Host `isshetqrqciswlrdtoth.supabase.co`; Anon-Key beginnt mit `sb_publi…` (publishable/anon Key, kein Secret) ✅
- Live getestet in Development (`npm run dev`) und Production (`npm start`), plus zweite Prod-Instanz mit absichtlich ungültiger URL.

### Akzeptanzkriterien
| # | Kriterium | Methode | Ergebnis |
|---|-----------|---------|----------|
| 1 | Env gesetzt → Client initialisiert ohne Fehler | Build + Dev/Prod-Start | ✅ Pass |
| 2 | Env gesetzt → Health-Route → „Supabase verbunden" | Live (Dev): `{status:"connected", message:"Supabase verbunden"}` | ✅ Pass |
| 3 | Env fehlt (Dev) → benennt fehlende Variable, ohne Wert | Integrationstest (500, message enthält Variablennamen) | ✅ Pass |
| 4 | Fehler (Prod) → nur minimaler Status, keine Details/Env-Namen/Stacktraces | Live (Prod, ungültige URL): `503 {status:"disconnected"}` | ✅ Pass |
| 5 | Env gesetzt, Supabase nicht erreichbar → „Verbindung fehlgeschlagen"/„nicht verbunden" | Live (Prod) + Integrationstest (Dev) | ✅ Pass |
| 6 | Neueinrichtung → `.env.local.example` dokumentiert alle Variablen, keine Secrets | Review: beide Variablen vorhanden, kein Service-Role-Key | ✅ Pass |
| 7 | Build → kein Service-Role-Key/sensibler Schlüssel im Client (nur Anon-Key) | Code-Audit: `service_role` nirgends im Code verwendet | ✅ Pass |
| 8 | Health-Antwort → keine Nutzerdaten, keine Schlüsselwerte | Live + E2E + Integrationstest (kein Key-Leak) | ✅ Pass |

### Edge Cases
| Fall | Ergebnis |
|------|----------|
| Fehlende Env-Variable (Dev) | ✅ Konkrete Meldung mit Variablenname, ohne Wert (Integrationstest) |
| Fehlende Env / Fehler (Prod) | ✅ Nur `{status:"disconnected"}`, keine Details (live) |
| Ungültige/unerreichbare URL | ✅ `503`, kein Crash, kontrollierte Antwort (live, Prod) |
| Versehentlicher Service-Role-Key clientseitig | ✅ Wird nirgends verwendet (Code-Audit) |
| Health-Route in Prod | ✅ Gibt nur Status aus, keine Secrets/Nutzerdaten (live) |

### Security-Audit (Red Team)
- **Secret-Leak:** Keine Antwort (Dev/Prod, Erfolg/Fehler) enthält Schlüsselwerte, Env-Namen (Prod) oder Stacktraces. ✅
- **Service-Role-Key:** in keiner Quelldatei verwendet; nicht in `.env.local.example`. ✅
- **Anon-Key clientseitig:** vorhanden und korrekt (öffentlicher Key, by design unkritisch). ✅
- **Information Disclosure:** Dev/Prod-Unterscheidung greift live nachweislich (Prod ohne `message`). ✅
- **Keine Nutzerdaten/Tabellenzugriffe:** Health-Check nutzt nur Auth-Health-Endpoint, keine Daten. ✅

### Automatisierte Tests
- **Vitest (Integration):** `src/app/api/health/supabase/route.test.ts` → **5/5 grün**
- **Playwright (E2E):** `tests/PROJ-1-supabase-infrastructure-setup.spec.ts` → **3/3 grün** (connected, kein Key-Leak, dynamisch konsistent)

### Regression
- Keine weiteren deployten Features vorhanden; nichts zu regressieren. Gesamtsuite (5 Vitest + 3 Playwright) grün.

### Nicht zutreffend
- Cross-Browser / Responsive (375/768/1440): **N/A** — PROJ-1 ist ein Infrastruktur-/API-Feature ohne UI.

### Bugs / Offene Punkte
- **[Low] Tooling:** `npm run lint` (`next lint`) ist in Next 16 deprecated und schlägt mit „Invalid project directory: …/lint" fehl. Betrifft das Template-Tooling, nicht PROJ-1. Empfehlung: in `/deploy` auf ESLint-Flat-Config / `eslint .` umstellen.
- **[Hinweis, kein Bug] EU-Region:** Aus der Projekt-URL nicht ableitbar. Bitte im Supabase-Dashboard (Project Settings → General → Region) bestätigen, dass eine EU-Region gewählt wurde.

## Deployment
_To be added by /deploy_
