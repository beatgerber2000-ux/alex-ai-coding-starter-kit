# PROJ-3: Projektverwaltung (anlegen, umbenennen, löschen)

## Status: Planned
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
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
