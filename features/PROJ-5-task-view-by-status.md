# PROJ-5: Aufgabenansicht nach Status

## Status: Planned
**Created:** 2026-06-06
**Last Updated:** 2026-06-06

## Dependencies
- Requires: **PROJ-4** (Aufgabenverwaltung) — Bestehende Tasks, Status-Select, Server Actions

## User Stories
- Als Nutzer möchte ich meine Aufgaben auf der Projektdetailseite nach Status gruppiert sehen, damit ich schnell den Überblick über To Do, In Arbeit und Erledigt behalte.
- Als Nutzer möchte ich den Status einer Aufgabe direkt aus ihrer Gruppe ändern können, damit ich meinen Fortschritt schnell aktualisieren kann.
- Als Nutzer möchte ich sehen, wie viele Aufgaben in jeder Status-Gruppe sind, damit ich den Projektfortschritt überblicke.
- Als Nutzer möchte ich eine leere Status-Gruppe sehen, wenn keine Aufgaben in dieser Kategorie vorhanden sind, damit die Struktur konsistent bleibt.

## Out of Scope
- **Drag-and-Drop zwischen Gruppen** — Statusänderung bleibt über Select-Dropdown (PROJ-4-Muster). Drag-and-Drop wird später (P2) als separates Feature erwogen.
- **Reihenfolge-Speicherung innerhalb Gruppen** — Tasks bleiben nach created_at DESC, id DESC sortiert. Benutzerdefinierte Reihenfolge nicht im MVP.
- **Separate View/Tab** — Gruppierung erfolgt auf der bestehenden Seite `/projects/[projectId]`, keine neue Route.
- **Filterung oder zusätzliche Spalten** — Nur die 3 Status-Gruppen; weitere Filter/Sortiermöglichkeiten sind PROJ-9.
- **Archivieren oder Soft-Delete** — Aufgaben-Lifecycle bleibt wie in PROJ-4.

## Datenmodell

Keine neuen Tabellen. Bestehende `tasks`-Tabelle wird nach `status` gruppiert:

| Status | Anzeigetext |
|--------|-------------|
| `todo` | To Do |
| `in_progress` | In Arbeit |
| `done` | Erledigt |

**Gruppierungs-Logik (Client-seitig):**
```
1. Alle Tasks von /projects/[projectId] laden (wie PROJ-4)
2. Nach status gruppieren (3 Gruppen: todo, in_progress, done)
3. Innerhalb jeder Gruppe nach created_at DESC, id DESC sortieren
4. Leerstate-Text pro Gruppe, wenn keine Tasks vorhanden
```

## Routing

| Route | Behavior |
|-------|----------|
| `/projects/[projectId]` | Zeigt Tasks nach Status gruppiert (Ersetzung der flachen TaskList) |

**Keine neuen Routes.**

## UI / Komponenten

**Bestehende Komponenten bleiben unverändert:**
- `src/components/tasks/task-card.tsx` — Status-Select, Icons unverändert
- `src/app/tasks/actions.ts` — Server Actions unverändert
- `src/lib/tasks/validation.ts` — Zod-Schemas unverändert

**Neue/Angepasste Komponenten:**
- `src/components/tasks/task-list-by-status.tsx` — Neue Komponente: gruppierte Ansicht
  - Eingabe: `tasks: Task[]` (ungruppiert)
  - Zeigt 3 Gruppen: To Do, In Arbeit, Erledigt
  - Jede Gruppe zeigt: Heading mit Count, TaskCard-Liste, Leerstate-Text
- `src/app/projects/[projectId]/page.tsx` — Ersetzt `<TaskList />` durch `<TaskListByStatus />`

**Seitenaufbau:**
```
/projects/[projectId] (Server Component, Page-Guard)
├── Header (projektname, buttons, logout) — unverändert
├── TaskListByStatus (NEW)
│   ├── To Do (Heading: "To Do (3)")
│   │   ├── TaskCard
│   │   ├── TaskCard
│   │   └── TaskCard
│   ├── In Arbeit (Heading: "In Arbeit (1)")
│   │   └── TaskCard
│   ├── Erledigt (Heading: "Erledigt (0)")
│   │   └── Leerstate: "Noch keine erledigten Aufgaben"
│   └── CreateTaskDialog — unverändert
```

## Acceptance Criteria

**Navigation & Routing:**
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er `/projects/[projectId]` aufruft, dann sieht er Tasks nach Status gruppiert statt als flache Liste.
- [ ] Angenommen fremde/nicht-existierende projectId, wenn aufgerufen wird, dann notFound() (kein Datenleck).

**Status-Gruppen & Darstellung:**
- [ ] Angenommen Tasks existieren, wenn die Seite geladen wird, dann werden sie in die 3 Gruppen „To Do", „In Arbeit" und „Erledigt" eingeteilt.
- [ ] Angenommen eine Gruppe hat Tasks, wenn die Seite geladen wird, dann zeigt das Heading die Anzahl an (z.B. „To Do (5)").
- [ ] Angenommen eine Gruppe ist leer, wenn die Seite geladen wird, dann zeigt sie ein Leerstate-Text (z.B. „Noch keine To-Do-Aufgaben").
- [ ] Angenommen mehrere Tasks in einer Gruppe, wenn die Seite geladen wird, dann sind sie nach created_at DESC, id DESC sortiert (neueste zuerst).

**Status-Änderung:**
- [ ] Angenommen eine Task in einer Gruppe, wenn ihr Status über das Select geändert wird, dann wandert sie sofort zur neuen Gruppe (optimistic).
- [ ] Angenommen zwei Status-Gruppen, wenn eine Task verschoben wird, dann aktualisiert sich der Count in beiden Headings.

**Leerstate & Edge Cases:**
- [ ] Angenommen eine Gruppe wird leer nach Löschen einer Task, wenn die Seite neu lädt, dann zeigt Leerstate-Text.
- [ ] Angenommen alle Tasks gelöscht, wenn die Seite neu lädt, dann zeigen alle 3 Gruppen Leerstate.
- [ ] Angenommen neue Task erstellt, wenn Seite lädt, dann erscheint in der richtigen Status-Gruppe (default: To Do).

## Edge Cases
- **Leere Gruppen:** Alle 3 Gruppen bleiben sichtbar auch wenn leer (keine versteckt).
- **Optimistic UI bei Statuswechsel:** Task bewegt sich sofort in neue Gruppe; bei Fehler zurück zur alten.
- **Session abgelaufen:** Wie PROJ-4 — Middleware leitet zu `/login`.
- **Projekt gelöscht:** Tasks verschwinden (CASCADE); User sieht 404 auf `/projects/[projectId]`.
- **Neue Task über Dialog:** Wird default in „To Do" erstellt; erscheint oben in dieser Gruppe.
- **Browser-Reload:** Tasks werden neu vom Server geladen (kein localStorage).

## Out of Scope (wiederholt zur Klarheit)
- Drag-and-Drop: später (P2) als separates Feature.
- Reihenfolgen-Speicherung: User-spezifische Reihenfolge nicht im MVP.
- Filter/Suche: PROJ-9.
- Archivieren: nicht im MVP.
- Massenoperationen: nicht im MVP.

## Technical Requirements (optional)
- **Frontend-only grouping:** Keine neue DB-Query; bestehende Task-Liste wird client-seitig gruppiert.
- **Keine neuen Packages:** Verwende bestehende Komponenten (shadcn, Tailwind).
- **Optimistic UI:** Status-Änderung nutzt bestehende updateTaskStatus Action (PROJ-4).
- **RLS unverändert:** Alle Security-Policies von PROJ-4 bleiben; nur UI-Darstellung ändert sich.

## Open Questions
*Keine offenen Fragen — Interview vollständig.*

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Status-Gruppierung auf gleicher Seite `/projects/[projectId]` | Keine neue Route/Tab nötig; Tasks gehören zum Projekt | 2026-06-06 |
| 3 Gruppen (To Do, In Arbeit, Erledigt) | Alle bestehenden Status direkt sichtbar; konsistent mit PROJ-4 | 2026-06-06 |
| Keine Drag-and-Drop im MVP | Statusänderung über Select reicht; D&D bringt Komplexität (mobile, accessibility, Reihenfolge) | 2026-06-06 |
| Leerstate pro Gruppe sichtbar | Struktur konsistent; User weiß, dass Kategorie existiert | 2026-06-06 |
| Count im Group-Heading anzeigen | Schneller Überblick über Fortschritt | 2026-06-06 |
| Client-seitige Gruppierung | Keine neue DB-Query; bestehende Tasks von PROJ-4 wiederverwenden | 2026-06-06 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| **Neue Komponente `TaskListByStatus`** | Gruppierung-Logik separiert von PROJ-4-`TaskList` | 2026-06-06 |
| **Bestehende TaskCard & Actions unverändert** | Validierung, Optimistic UI, RLS-Check wiederverwenden | 2026-06-06 |
| **Keine neue Server Action** | updateTaskStatus von PROJ-4 reicht; Gruppierung ist reine UI-Anpassung | 2026-06-06 |
| **RLS unverändert** | Alle PROJ-4-Security-Policies bleiben aktiv; nur UI-Filter ändert sich | 2026-06-06 |

---

## Tech Design (Solution Architect)
*To be added by /architecture*

## Implementation Notes (Frontend)
*To be added by /frontend*

## Implementation Notes (Backend)
*Not applicable — keine Backend-Änderungen.*

## QA Test Results
*To be added by /qa*

## Deployment
*To be added by /deploy*
