# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Status | Prio | Dependencies | Spec | Created |
|----|---------|--------|------|--------------|------|---------|
| PROJ-1 | Supabase Infrastructure Setup | Deployed | P0 | None | [Spec](PROJ-1-supabase-infrastructure-setup.md) | 2026-06-04 |
| PROJ-2 | Authentifizierung (Registrierung, Login, Logout) | In Progress | P0 | PROJ-1 | [Spec](PROJ-2-authentication.md) | 2026-06-04 |
| PROJ-3 | Projektverwaltung (anlegen, umbenennen, löschen) | Roadmap | P0 | PROJ-1, PROJ-2 | — | 2026-06-04 |
| PROJ-4 | Aufgabenverwaltung (CRUD: Titel, Beschreibung, Status) | Roadmap | P0 | PROJ-1, PROJ-2, PROJ-3 | — | 2026-06-04 |
| PROJ-5 | Aufgabenansicht nach Status | Roadmap | P0 | PROJ-4 | — | 2026-06-04 |
| PROJ-6 | Fälligkeitsdaten & Erinnerungen | Roadmap | P1 | PROJ-4 | — | 2026-06-04 |
| PROJ-7 | Team-Kollaboration (Einladungen, Rollen) | Roadmap | P1 | PROJ-3 | — | 2026-06-04 |
| PROJ-8 | Kommentare & Datei-Anhänge | Roadmap | P2 | PROJ-4 | — | 2026-06-04 |
| PROJ-9 | Suche, Filter & Dashboard | Roadmap | P2 | PROJ-4 | — | 2026-06-04 |

<!-- Add features above this line -->

## Recommended Build Order
PROJ-1 → PROJ-2 → PROJ-3 → PROJ-4 → PROJ-5 (kompletter MVP), danach P1/P2 nach Bedarf.

## Next Available ID: PROJ-10
