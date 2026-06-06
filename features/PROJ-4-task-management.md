# PROJ-4: Aufgabenverwaltung (CRUD: Titel, Beschreibung, Status)

## Status: Planned
**Created:** 2026-06-06
**Last Updated:** 2026-06-06

## Dependencies
- Requires: **PROJ-1** (Supabase Infrastructure) — Datenbankverbindung, RLS
- Requires: **PROJ-2** (Authentifizierung) — `user_id` als Aufgabenbesitzer, geschützte Routen
- Requires: **PROJ-3** (Projektverwaltung) — `project_id` als Eltern-Relation, `/projects/[projectId]`-Route

## User Stories
- Als eingeloggter Nutzer möchte ich Aufgaben innerhalb eines Projekts anlegen, damit ich meine Arbeit strukturieren kann.
- Als Nutzer möchte ich Titel und Beschreibung einer Aufgabe bearbeiten, damit ich Details anpassen kann.
- Als Nutzer möchte ich den Status einer Aufgabe direkt auf der Karte ändern, damit ich meinen Fortschritt schnell festhalten kann.
- Als Nutzer möchte ich Aufgaben löschen, damit ich veraltete oder fehlerhafte Einträge entfernen kann.
- Als Nutzer möchte ich sicher sein, dass ausschließlich ich meine eigenen Aufgaben sehen und bearbeiten kann.

## Out of Scope
- **Aufgabenansicht nach Status (Gruppierung, Board/Spalten)** — PROJ-5.
- **Fälligkeitsdaten und Erinnerungen** — PROJ-6.
- **Zuweisung an andere Nutzer (Team-Kollaboration)** — PROJ-7.
- **Kommentare und Datei-Anhänge** — PROJ-8.
- **Suche, Filter, Sortierung nach anderen Kriterien** — PROJ-9.
- **Drag-and-Drop-Reihenfolge** — nicht im MVP.
- **Prioritäten oder Labels** — nicht im MVP.
- **Bulk-Aktionen** — nicht im MVP.
- **Soft Delete / Archivieren** — nicht im MVP.

## Datenmodell

Tabelle `tasks` (in Supabase anzulegen):

| Feld | Typ | Regel |
|------|-----|-------|
| `id` | UUID, PK | auto-generiert |
| `project_id` | UUID, FK → `projects(id)` | NOT NULL, ON DELETE CASCADE |
| `user_id` | UUID, FK → `auth.users(id)` | NOT NULL, ON DELETE CASCADE |
| `title` | TEXT | NOT NULL, 1–200 Zeichen (getrimmt) |
| `description` | TEXT | nullable; wenn nur Leerzeichen → als leer/null speichern |
| `status` | TEXT | CHECK IN ('todo', 'in_progress', 'done'), DEFAULT 'todo' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Row Level Security (RLS):**
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

**Statuswerte:**

| DB-Wert | Anzeigetext |
|---------|-------------|
| `todo` | To Do |
| `in_progress` | In Arbeit |
| `done` | Erledigt |

**Cascade-Löschen:** Wird ein Projekt (PROJ-3) gelöscht, werden alle zugehörigen Aufgaben automatisch mitgelöscht (`ON DELETE CASCADE`).

## Routing

| Route | Zweck |
|-------|-------|
| `/projects/[projectId]` | Projektdetailseite mit Aufgabenliste (war PROJ-3-Platzhalter) |

Sicherheit:
- Middleware + Page-Guard (`getUser()`) schützen die Route.
- Wenn `projectId` nicht existiert oder einem anderen Nutzer gehört → neutrale Not-found-Behandlung (kein Datenleck über Existenz fremder Projekte).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Navigation & Schutz
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er `/projects/[projectId]` aufruft und das Projekt ihm gehört, dann werden die Aufgaben des Projekts angezeigt.
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er `/projects/[projectId]` aufruft, dann wird er zu `/login` weitergeleitet.
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er eine `projectId` aufruft, die nicht existiert oder einem anderen Nutzer gehört, dann erhält er eine neutrale Not-found-Behandlung ohne Hinweis auf die Existenz des Projekts.

### Leerstate
- [ ] Angenommen ein Projekt hat noch keine Aufgaben, wenn `/projects/[projectId]` aufgerufen wird, dann erscheint ein Leerstate mit kurzer Erklärung und Button „Erste Aufgabe anlegen".

### Aufgaben anlegen
- [ ] Angenommen der Nutzer ist auf der Projektdetailseite, wenn er „Neue Aufgabe" klickt, dann öffnet sich ein Dialog mit Titel-Pflichtfeld und optionalem Beschreibungsfeld.
- [ ] Angenommen der Dialog ist offen, wenn ein gültiger Titel eingegeben und bestätigt wird, dann erscheint die Aufgabe sofort in der Liste (oben, da neueste).
- [ ] Angenommen der Dialog ist offen, wenn ein leeres oder nur-Leerzeichen-Titel-Feld bestätigt wird, dann erscheint eine Fehlermeldung.
- [ ] Angenommen der Dialog ist offen, wenn ein Titel mit mehr als 200 Zeichen eingegeben wird, dann erscheint eine Fehlermeldung.
- [ ] Angenommen der Dialog ist offen, wenn Abbrechen geklickt wird, dann schließt der Dialog ohne Änderung.

### Aufgaben bearbeiten
- [ ] Angenommen eine Aufgabe existiert, wenn das Stift-Icon geklickt wird, dann öffnet sich ein Dialog mit dem aktuellen Titel und der aktuellen Beschreibung vorausgefüllt.
- [ ] Angenommen der Bearbeiten-Dialog ist offen, wenn ein neuer gültiger Titel bestätigt wird, dann ist die Aufgabe in der Liste aktualisiert.
- [ ] Angenommen der Bearbeiten-Dialog ist offen, wenn ein leeres Titel-Feld bestätigt wird, dann erscheint eine Fehlermeldung.
- [ ] Angenommen der Bearbeiten-Dialog ist offen, wenn Abbrechen geklickt wird, dann bleibt die Aufgabe unverändert.

### Status ändern
- [ ] Angenommen eine Aufgabe existiert, wenn der Status per Select geändert wird, dann wird der neue Status sofort gespeichert und in der Karte angezeigt.
- [ ] Angenommen die drei Statuswerte sind vorhanden, wenn der Nutzer das Select öffnet, dann werden „To Do", „In Arbeit" und „Erledigt" als Optionen angezeigt.

### Aufgaben löschen
- [ ] Angenommen eine Aufgabe existiert, wenn das Löschen-Icon geklickt wird, dann erscheint ein Bestätigungsdialog.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn Löschen bestätigt wird, dann wird die Aufgabe aus der Liste entfernt.
- [ ] Angenommen der Bestätigungsdialog ist offen, wenn Abbrechen geklickt wird, dann bleibt die Aufgabe erhalten.

### Liste
- [ ] Angenommen Aufgaben existieren, wenn die Projektdetailseite geladen wird, dann werden die Aufgaben nach `created_at DESC, id DESC` (neueste zuerst, stabile Reihenfolge) angezeigt — ohne Gruppierung nach Status.

### Fehler
- [ ] Angenommen ein API-Fehler tritt beim Speichern auf, dann erscheint eine verständliche Fehlermeldung und die Eingabe bleibt erhalten.

## Edge Cases
- **Fremdes Projekt:** Nicht-Besitzer erhält neutrale Not-found-Behandlung (kein Datenleck).
- **Leerer Titel / nur Leerzeichen:** Clientseitig + serverseitig abgelehnt.
- **Beschreibung nur Leerzeichen:** Wird als leer/null gespeichert.
- **Doppelklick auf „Speichern":** Submit-Button disabled während Verarbeitung.
- **Netzwerkfehler beim Speichern:** Fehlermeldung, Dialog bleibt offen, Eingabe bleibt erhalten.
- **Status-Select unter Load:** Optimistic UI oder Loading-Indikator; bei Fehler wieder auf alten Wert zurücksetzen.
- **Projekt wird gelöscht:** Alle Aufgaben werden via CASCADE mitgelöscht (DB-Seite).
- **Session abgelaufen:** Nächster Serverzugriff → Middleware leitet zu `/login`.

## Technical Requirements (optional)
- Security: RLS auf `tasks`-Tabelle (SELECT/INSERT/UPDATE/DELETE via `auth.uid() = user_id`).
- Security: `user_id` wird serverseitig aus `auth.uid()` gesetzt — niemals vom Client.
- Security: `project_id` beim Erstellen, Bearbeiten, Statuswechsel und Löschen gegen ein Projekt des eingeloggten Nutzers geprüft (Eigentumscheck).
- Security: Nutzer sehen/bearbeiten/löschen nur Aufgaben, deren `project_id` einem ihnen gehörenden Projekt zugeordnet ist.
- Security: Page-Guard prüft Projektzugehörigkeit; fremde `projectId` liefert keine Daten.
- Security: Keine `project_id`-, `task_id`- oder `user_id`-Details in Fehlermeldungen.
- Validierung: Zod clientseitig + serverseitig (verbindlich).
- Performance: Index auf `project_id` (+ `user_id`) für schnelle Abfragen; Sortierung `created_at DESC, id DESC` für stabile Reihenfolge.

## Open Questions
*Keine offenen Fragen — Interview vollständig.*

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Aufgaben auf `/projects/[projectId]`, keine `/tasks`-Unterroute | Aufgaben gehören fachlich zum Projekt; keine Extraroute nötig | 2026-06-06 |
| Statusänderung direkt per Select (inline) | Häufige Aktion → so wenig Reibung wie möglich | 2026-06-06 |
| Titel + Beschreibung per Dialog bearbeiten | Seltene Aktion; Dialog konsistent mit PROJ-3-Pattern | 2026-06-06 |
| Titel max. 200 Zeichen, Beschreibung max. 1000 Zeichen | Ausreichend für MVP; kein Overhead | 2026-06-06 |
| Einfache Liste (created_at DESC, id DESC), keine Status-Gruppierung | Stabile Sortierung; Gruppierung kommt mit PROJ-5 als eigenständiges Feature | 2026-06-06 |
| Kein Soft Delete, kein Archiv | MVP-Schlankheit; Bestätigungsdialog reicht | 2026-06-06 |
| Neutrale Not-found-Behandlung für fremde Projekte | Kein Datenleck über Existenz fremder Daten | 2026-06-06 |
| project_id-Eigentumscheck bei allen Mutationen | Verhindert Cross-Project-Manipulation; user_id allein reicht nicht | 2026-06-06 |

### Technical Decisions
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
