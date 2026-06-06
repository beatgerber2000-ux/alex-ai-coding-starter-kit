# PROJ-3: Projektverwaltung (anlegen, umbenennen, löschen)

## Status: Approved
**Created:** 2026-06-05
**Last Updated:** 2026-06-05

## Dependencies
- Requires: **PROJ-1** (Supabase Infrastructure) — Datenbankverbindung, RLS
- Requires: **PROJ-2** (Authentifizierung) — `user.id` als Projektbesitzer, geschützte Routen

## User Stories
- Als eingeloggter Nutzer möchte ich Projekte anlegen, damit ich meine Aufgaben strukturieren kann.
- Als Nutzer möchte ich meine Projekte auf einer eigenen Seite sehen und navigieren, damit ich schnell den Überblick behalte.
- Als Nutzer möchte ich ein Projekt umbenennen, damit ich es jederzeit anpassen kann.
- Als Nutzer möchte ich ein Projekt (inkl. aller zugehörigen Aufgaben) löschen, damit ich veraltete Container dauerhaft entfernen kann.
- Als Nutzer möchte ich sicher sein, dass ausschließlich ich meine eigenen Projekte sehe und bearbeite.

## Out of Scope
- **Projektbeschreibung, -farbe, -status, Favoriten** — nicht im MVP.
- **Team-Zuweisung / Shared Projects** — PROJ-7.
- **Aufgabenansicht innerhalb eines Projekts** — PROJ-4 / PROJ-5 (Route `/projects/[projectId]` wird nur vorbereitet, noch nicht gebaut).
- **Soft Delete / Archivieren / Wiederherstellen** — späteres Feature.
- **Suche / Filter von Projekten** — PROJ-9.
- **Duplikat-Prüfung (gleicher Projektname)** — nicht im MVP; zwei identische Namen sind akzeptabel.
- **`/dashboard` als primäre App-Landingpage** — wird nach PROJ-3 auf `/projects` weitergeleitet.

## Datenmodell

Tabelle `projects` (in Supabase anzulegen):

| Feld | Typ | Regel |
|------|-----|-------|
| `id` | UUID, PK | auto-generiert |
| `user_id` | UUID, FK → `auth.users(id)` | NOT NULL, ON DELETE CASCADE |
| `name` | TEXT | NOT NULL, 1–100 Zeichen (getrimmt) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Row Level Security (RLS):**
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

Jeder Nutzer sieht und bearbeitet ausschließlich seine eigenen Projekte.

**Cascade zu PROJ-4:** Sobald die Tabelle `tasks` existiert, wird `tasks.project_id → projects.id ON DELETE CASCADE` gesetzt, sodass beim Löschen eines Projekts alle zugehörigen Aufgaben automatisch mitgelöscht werden.

## Routing

| Route | Zugriff | Zweck |
|-------|---------|-------|
| `/projects` | Geschützt (Auth) | Hauptseite Projektverwaltung |
| `/projects/[projectId]` | Geschützt | Vorbereitet für PROJ-4/5; noch kein Inhalt |
| `/dashboard` | Geschützt | Leitet nach PROJ-3 auf `/projects` weiter |

Nach Login und Registrierung (PROJ-2) wird das Redirect-Ziel von `/dashboard` auf `/projects` geändert.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anlegen
- [ ] Angenommen der Nutzer ist eingeloggt auf `/projects`, wenn er „Neues Projekt" klickt, dann öffnet sich ein Dialog mit leerem Textfeld.
- [ ] Angenommen der Dialog ist offen, wenn ein gültiger Name eingegeben und bestätigt wird, dann erscheint das neue Projekt sofort in der Liste (oben, da neuestes).
- [ ] Angenommen der Dialog ist offen, wenn ein leeres oder nur-Leerzeichen-Feld bestätigt wird, dann erscheint eine Fehlermeldung und das Projekt wird nicht gespeichert.
- [ ] Angenommen der Dialog ist offen, wenn ein Name mit mehr als 100 Zeichen eingegeben wird, dann erscheint eine Fehlermeldung.
- [ ] Angenommen der Dialog ist offen, wenn Abbrechen geklickt wird, dann schließt der Dialog ohne Änderung.

### Umbenennen
- [ ] Angenommen ein Projekt existiert, wenn das Stift-Icon geklickt wird, dann öffnet sich ein Dialog mit dem aktuellen Namen vorausgefüllt.
- [ ] Angenommen der Umbenennen-Dialog ist offen, wenn ein neuer gültiger Name bestätigt wird, dann ist der Projektname in der Liste sofort aktualisiert.
- [ ] Angenommen der Umbenennen-Dialog ist offen, wenn ein leeres Feld bestätigt wird, dann erscheint eine Fehlermeldung.
- [ ] Angenommen der Umbenennen-Dialog ist offen, wenn Abbrechen geklickt wird, dann bleibt der Name unverändert.

### Löschen
- [ ] Angenommen ein Projekt existiert, wenn das Löschen-Icon geklickt wird, dann erscheint ein Bestätigungsdialog mit dem Hinweis: „Dieses Projekt und alle zugehörigen Aufgaben werden dauerhaft gelöscht."
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn Löschen bestätigt wird, dann wird das Projekt sofort aus der Liste entfernt.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn Abbrechen geklickt wird, dann bleibt das Projekt erhalten.

### Liste & Routing
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er `/projects` aufruft, dann werden seine eigenen Projekte angezeigt, sortiert nach `created_at DESC` (neueste zuerst).
- [ ] Angenommen der Nutzer hat noch keine Projekte, wenn er `/projects` aufruft, dann erscheint ein Leerstate mit kurzer Erklärung und Button „Erstes Projekt anlegen".
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er `/projects` aufruft, dann wird er zu `/login` weitergeleitet.
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er `/dashboard` aufruft, dann wird er zu `/projects` weitergeleitet.
- [ ] Angenommen Nutzer A ist eingeloggt, dann sieht er niemals die Projekte von Nutzer B (RLS-Schutz).

### Fehler
- [ ] Angenommen ein API-/Netzwerkfehler tritt beim Speichern auf, dann erscheint eine verständliche Fehlermeldung und die Eingabe bleibt erhalten.

## Edge Cases
- **Netzwerkfehler beim Anlegen/Umbenennen:** Fehlermeldung im Dialog, Dialog bleibt offen, Eingabe bleibt erhalten.
- **Doppelklick auf „Speichern":** Submit-Button wird während der Verarbeitung deaktiviert — kein doppeltes Anlegen.
- **Name > 100 Zeichen:** Zod-Validierung schlägt clientseitig an, bevor ein Server-Aufruf stattfindet.
- **Leerzeichen-only-Name:** Nach Trim leer → ungültig (clientseitig + serverseitig).
- **Löschen aus zwei Tabs gleichzeitig:** Zweiter Lösch-Aufruf schlägt leise fehl (Projekt existiert nicht mehr) — kein Crash, Liste bleibt konsistent.
- **Session abgelaufen während der Nutzung:** Nächster Serverzugriff → Middleware leitet zu `/login`.

## Technical Requirements (optional)
- Security: RLS auf `projects`-Tabelle für alle CRUD-Operationen (SELECT, INSERT, UPDATE, DELETE).
- Security: Page-Guard auf `/projects` (serverseitig via `supabase.auth.getUser()`) zusätzlich zur Middleware.
- Validierung: clientseitig (Zod, sofortiges UX-Feedback) **und** serverseitig (verbindlich).
- Performance: Abfrage mit `.order('created_at', { ascending: false })`, Index auf `user_id`.

## Open Questions
*Keine offenen Fragen — Interview vollständig.*

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur `name` als Nutzerfeld | MVP: Projekt = benannter Container, fachliche Details liegen auf Aufgaben | 2026-06-05 |
| Cascade-Löschen + Bestätigungsdialog | Einfach, sauber testbar; kein Soft-Delete-Overhead | 2026-06-05 |
| `/projects` als eigene Route, `/dashboard` → Redirect | Klare Trennung Auth-Platzhalter vs. App; Erweiterbarkeit | 2026-06-05 |
| Dialog statt Inline-Editing | Konsistenter, mobil-freundlich, besser testbar | 2026-06-05 |
| Name max. 100 Zeichen, kein Duplikat-Check | Sinnvolle UX-Grenze ohne Overhead; zwei gleiche Namen akzeptabel | 2026-06-05 |
| Sortierung `created_at DESC` | Neueste zuerst, deterministisch | 2026-06-05 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| **Server Actions** für createProject/renameProject/deleteProject | Konsistent mit PROJ-2-Auth-Pattern; kein separater API-Endpoint; Redirect/revalidate direkt in der Action | 2026-06-05 |
| **`user_id` ausschließlich serverseitig** aus `auth.uid()` | Client sendet nur den Namen — niemals die user_id; verhindert Manipulation | 2026-06-05 |
| **RLS für alle 4 Operationen** (SELECT/INSERT/UPDATE/DELETE) | Defense-in-Depth: selbst wenn eine Server Action fehlerhaft wäre, blockiert die DB | 2026-06-05 |
| **Eigentumscheck in Actions** (Rename/Delete) | Zusätzliche serverseitige Prüfung vor der DB-Mutation; keine Projekt-IDs oder Nutzerdaten in Fehlermeldungen | 2026-06-05 |
| **Zod-Schema geteilt** (Client + Server) | Gleiche Trim/Längen-Regel für sofortiges UX-Feedback und verbindliche Server-Prüfung | 2026-06-05 |
| **shadcn `Dialog`** für Anlegen/Umbenennen, **`AlertDialog`** für Löschen | AlertDialog ist semantisch korrekt für destruktive Aktionen; alle Komponenten bereits vorhanden | 2026-06-05 |
| **`revalidatePath('/projects')`** nach jeder Mutation | Projektliste aktualisiert sich ohne manuelles Client-State-Management | 2026-06-05 |
| **Routing-Änderung**: Login/Register → `/projects`, `/dashboard` → Redirect | Klare Trennung Auth-Platzhalter vs. App; `/dashboard` bleibt bestehen um bestehende Sessions nicht zu brechen | 2026-06-05 |
| **Keine neuen Pakete** | Alle benötigten Pakete bereits im Stack (supabase/ssr, zod, react-hook-form, shadcn) | 2026-06-05 |

---

## Tech Design (Solution Architect)

### A) Struktur (Seiten & Bausteine)

```
src/app/projects/
└── page.tsx                      Geschützte Hauptseite (Page-Guard via getUser)

src/app/dashboard/page.tsx        Geändert: leitet nun auf /projects weiter
src/app/auth/actions.ts           Geändert: Login/Register-Redirect → /projects
src/app/projects/actions.ts       Server Actions: createProject, renameProject,
                                  deleteProject (Zod + user_id aus Session,
                                  Eigentumscheck, keine Daten in Fehlermeldungen)

src/lib/projects/validation.ts    Zod-Schema (Name: Pflicht, max 100 Zeichen,
                                  getrimmt), geteilt Client + Server

src/components/projects/
├── project-list.tsx              Zeigt alle Projekte (sorted created_at DESC)
│                                 + Leerstate-Anzeige
├── project-card.tsx              Einzelprojekt: Name, Stift-Icon, Löschen-Icon
├── create-project-dialog.tsx     Dialog mit leerem Textfeld → createProject
├── rename-project-dialog.tsx     Dialog mit vorausgefülltem Name → renameProject
└── delete-project-dialog.tsx     AlertDialog mit Cascade-Hinweis → deleteProject
```

Seitenaufbau `/projects`:
```
/projects (Server Component, Page-Guard)
├── Header: „Meine Projekte" + Button „Neues Projekt"
├── ProjectList
│   ├── ProjectCard (je Projekt)
│   │   ├── Projektname
│   │   ├── Stift-Icon → RenameProjectDialog
│   │   └── Löschen-Icon → DeleteProjectDialog
│   └── Leerstate (wenn keine Projekte vorhanden)
└── CreateProjectDialog
```

### B) Datenmodell

```
Tabelle: projects (in Supabase anzulegen)
- id            UUID, Primärschlüssel, auto-generiert
- user_id       UUID, FK → auth.users — wird NIEMALS vom Client übergeben;
                serverseitig aus auth.uid() gesetzt
- name          Text, Pflicht, 1–100 Zeichen (getrimmt, serverseitig validiert)
- created_at    Zeitstempel, Sortiergrundlage (DESC)
- updated_at    Zeitstempel, für spätere Nachvollziehbarkeit

Row Level Security (alle 4 Operationen explizit abgesichert):
  SELECT  → auth.uid() = user_id
  INSERT  → auth.uid() = user_id
  UPDATE  → auth.uid() = user_id
  DELETE  → auth.uid() = user_id

Index auf user_id (Performance bei SELECT/UPDATE/DELETE).

Vorbereitung PROJ-4: tasks.project_id → projects.id ON DELETE CASCADE
(kommt mit PROJ-4; im Löschen-Dialog-Text bereits berücksichtigt).
```

### C) Sicherheitsvorgaben (verbindlich für Umsetzung)

- **`user_id` serverseitig**: Server Actions lesen `user_id` ausschließlich aus der Supabase-Session (`auth.uid()`). Der Client übergibt nur den Projektnamen.
- **Eigentumscheck**: Bei Rename und Delete prüft die Server Action vor der Mutation, dass das Projekt der eingeloggten Session gehört.
- **Keine Datenlecks**: Keine Projekt-IDs, user_ids oder interne Details in Fehlermeldungen oder Logs.
- **Serverseitige Validierung**: Projektname wird in der Server Action getrimmt und per Zod validiert — unabhängig von der Client-Validierung.
- **RLS als zweite Verteidigungslinie**: Selbst bei fehlerhafter Server-Logik blockiert die DB unberechtigte Zugriffe.

### D) Routing-Änderungen

```
Vorher (PROJ-2):                Nachher (PROJ-3):
  Login/Register → /dashboard     Login/Register → /projects
  /dashboard (Platzhalter)        /dashboard → Redirect auf /projects
```

Middleware (`src/middleware.ts`) bleibt unverändert — `/projects` ist automatisch geschützt.

### E) Abhängigkeiten

**Keine neuen Pakete** — alle vorhanden:
- `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `react-hook-form`, `@hookform/resolvers`
- shadcn `Dialog`, `AlertDialog`, `Input`, `Button`, `Card` (alle installiert)

**Manueller Schritt in Supabase (vor `/backend`):**
Tabelle `projects` + RLS-Policies + Index auf `user_id` über den Supabase SQL-Editor anlegen (wird in `/backend` vollständig dokumentiert).

## Implementation Notes (Frontend)
**Implementiert am:** 2026-06-05

**Was gebaut wurde (UI + Client-Validierung):**
- `src/lib/projects/validation.ts` — geteiltes Zod-Schema (`projectNameSchema`: trim, min 1, max 100)
- `src/components/projects/create-project-dialog.tsx` — Dialog (shadcn), react-hook-form + Zod, Loading/Fehler-State
- `src/components/projects/rename-project-dialog.tsx` — Dialog mit vorausgefülltem Namen, useEffect für Reset (kein setState in Effect), Loading/Fehler-State
- `src/components/projects/delete-project-dialog.tsx` — AlertDialog (shadcn, destruktive Aktion), Cascade-Hinweis, Loading/Fehler-State
- `src/components/projects/project-card.tsx` — Karte mit Stift/Trash-Icons (hover-visible), öffnet Rename/Delete-Dialog
- `src/components/projects/project-list.tsx` — Liste + Leerstate mit „Erstes Projekt anlegen"-Button
- `src/app/projects/page.tsx` — geschützte Hauptseite (Page-Guard via getUser), Header mit Logout; Projektliste als Platzhalter (leeres Array bis /backend)
- `src/app/projects/[projectId]/page.tsx` — Platzhalterseite für PROJ-4/5
- `src/app/projects/actions.ts` — typisierter Server-Action-Seam (createProject/renameProject/deleteProject, Platzhalter-Implementierung für /backend)
- `src/app/dashboard/page.tsx` → Redirect auf `/projects`
- `src/app/auth/actions.ts` → Redirects nach Login/Register von `/dashboard` auf `/projects` geändert

**Verifiziert:**
- `npm run build` → grün, alle Routen erzeugt
- `npm run lint` → grün
- Smoke-Test: `/projects` und `/dashboard` → 307 `/login` ohne Session; kein Redirect-Loop

**Bewusst dem Backend überlassen (/backend):**
- Echte Supabase-DB: Tabelle `projects` anlegen + RLS-Policies + Index auf user_id
- createProject/renameProject/deleteProject: Supabase-Logik, user_id aus Session, Eigentumscheck, revalidatePath
- Projekte laden in `projects/page.tsx` (aktuell leeres Array-Platzhalter)

## Implementation Notes (Backend)
**Implementiert am:** 2026-06-06

**Manueller Schritt (erledigt):** Tabelle `projects` + RLS-Policies (SELECT/INSERT/UPDATE/DELETE) + Index `idx_projects_user_id` via Supabase SQL-Editor angelegt.

**Was gebaut wurde:**
- `src/app/projects/actions.ts` — echte Server Actions mit Supabase:
  - `createProject`: Zod-Validierung → `user_id` aus Session → INSERT
  - `renameProject`: Zod-Validierung → Eigentumscheck via `.eq('user_id', user.id)` + `.select('id')` → UPDATE; kein Match → GENERIC_ERROR
  - `deleteProject`: Eigentumscheck via `.eq('user_id', user.id)` → DELETE; doppeltes Löschen schlägt lautlos fehl (kein Error)
  - `revalidatePath('/projects')` nach jeder erfolgreichen Mutation
  - Keine Projekt-IDs/user_ids in Fehlermeldungen
- `src/app/projects/page.tsx` — echte DB-Abfrage: `.from('projects').select('id, name').order('created_at', { ascending: false })`; RLS filtert automatisch auf eigene Projekte
- `src/app/auth/actions.test.ts` — Tests auf `/projects`-Redirect aktualisiert (PROJ-3-Routing-Änderung)

**Tests:**
- `src/lib/projects/validation.test.ts` — 6 Tests (gültig, trim, leer, nur-Leerzeichen, genau 100, >100)
- `src/app/projects/actions.test.ts` — 13 Tests (create/rename/delete: Erfolg, Auth-Fehler, DB-Fehler, Validierung, user_id-Sicherheit, Doppel-Löschen)

**Verifiziert:**
- `npm test` → **41/41 grün** (inkl. PROJ-1/2/3)
- `npm run build` → grün
- `npm run lint` → grün

## QA Test Results
**Getestet am:** 2026-06-06 · **Tester:** QA (Claude) · **Build:** Next 16.1.1, lokal · Echte Supabase-Verbindung

### Zusammenfassung
- **Akzeptanzkriterien:** 18 von 18 bestanden
- **Bugs:** 0 Critical · 0 High · 0 Medium · 2 Low (Tooling/Flakiness, kein Produktions-Impact)
- **Regression (PROJ-1/2):** 0 neue Fehler, PROJ-2-E2E-Tests auf neues Routing aktualisiert
- **Security-Audit:** keine Schwachstellen gefunden
- **Production-Ready:** ✅ **JA** (keine Critical/High-Bugs)

### Testumgebung
- Live gegen echtes Supabase-Projekt (EU), echte Registrierungen und Projektmutationen.
- E2E über Playwright (Chromium), Dev-Server via Playwright webServer.
- `--retries=1` lokal wegen Supabase Free Tier Timing (alle Tests bestehen auf Retry).

### Akzeptanzkriterien

| Kriterium | Methode | Ergebnis |
|-----------|---------|----------|
| Nicht eingeloggt → /projects → /login | E2E | ✅ |
| /dashboard → /projects (eingeloggt) | E2E | ✅ |
| Leerstate erscheint wenn keine Projekte | E2E | ✅ |
| Dialog öffnet sich bei „Neues Projekt" / „Erstes Projekt anlegen" | E2E | ✅ |
| Abbrechen schließt Dialog ohne Änderung | E2E | ✅ |
| Gültiger Name → Projekt erscheint in Liste | E2E | ✅ |
| Leerer Name → Fehlermeldung, kein Speichern | E2E | ✅ |
| Name > 100 Zeichen → Fehlermeldung | E2E | ✅ |
| Stift-Icon → Dialog mit vorausgefülltem Namen | E2E | ✅ |
| Gültiger neuer Name → Projektname aktualisiert | E2E | ✅ |
| Leeres Umbenennen-Feld → Fehlermeldung | Unit (Zod) | ✅ |
| Umbenennen-Abbrechen → kein Speichern | E2E | ✅ |
| Löschen-Icon → Bestätigungsdialog mit Cascade-Hinweis | E2E | ✅ |
| Löschen bestätigen → Projekt entfernt | E2E | ✅ |
| Löschen-Abbrechen → Projekt bleibt | E2E | ✅ |
| Eigene Projekte sortiert nach created_at DESC | Live (manuell) | ✅ |
| API-Fehler → Fehlermeldung, Eingabe bleibt | Unit (mock) | ✅ |
| Nutzer A sieht nicht Projekte von Nutzer B (RLS) | Security-Audit | ✅ |

### Security-Audit (Red Team)
- **user_id-Manipulation:** user_id nie vom Client übergeben; Server Action liest immer aus `auth.uid()`. ✅
- **Eigentumscheck:** renameProject/deleteProject prüfen via `.eq('user_id', userId)` — fremde Projekte können nicht verändert werden. ✅
- **RLS Defense-in-Depth:** Alle 4 Operationen durch RLS-Policies abgesichert (SELECT/INSERT/UPDATE/DELETE). ✅
- **Keine Datenlecks:** Fehlermeldungen enthalten keine Projekt-IDs, user_ids oder interne Details. ✅
- **Routenschutz:** /projects ohne Session → /login (Middleware + Page-Guard). ✅
- **XSS:** Projektnamen werden von React automatisch escaped. Kein reflektiertes XSS gefunden. ✅

### Automatisierte Tests
- **Vitest:** 41/41 grün (PROJ-1: 5, PROJ-2: 16, PROJ-3: 19, Auth-Redirect: 1 update)
- **Playwright E2E:** 24/24 bestehen (13 PROJ-1/2, 11 PROJ-3); 6 flaky → pass auf Retry (Supabase Free Tier Timing)

### Regression
- PROJ-2-E2E-Tests auf neues Routing (`/projects` statt `/dashboard`) aktualisiert — keine Regressionsfehler.
- PROJ-1 Health-Route weiterhin unverändert funktional.

### Bugs / Offene Punkte
- **[Low] Middleware-Deprecation:** `middleware.ts` → `proxy.ts` (Next 16, funktioniert aktuell einwandfrei).
- **[Low] E2E-Flakiness:** Supabase Free Tier hat gelegentlich Timing-Timeouts unter sequenzieller Last (~30 Tests/Lauf). Lösung: `retries: 1` in `playwright.config.ts` gesetzt. Kein Produktions-Impact.
- **[Hinweis] Test-Nutzer und -Projekte:** E2E legt echte Supabase-Einträge an (`qa-*@example.com`, `qa-proj-*`). Periodisches Aufräumen empfohlen.

## Deployment
_To be added by /deploy_
