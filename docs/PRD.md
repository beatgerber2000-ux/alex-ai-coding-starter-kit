# Product Requirements Document

## Vision
Eine schlanke Projektmanagement-App für Solo-Gründer und kleine Teams, mit der Nutzer ihre Projekte und Aufgaben an einem Ort erfassen, strukturieren und im Status verfolgen — ohne die Überladung von Tools wie Jira. Im MVP verwaltet jeder Nutzer ausschließlich seine eigenen, privaten Daten. Das Projekt dient zugleich als praktische End-to-End-Übung des professionellen AI-Coding-Workflows.

## Target Users
- **Solo-Gründer & Einzelpersonen**, die einen einfachen, gemeinsamen Ort brauchen, um den Überblick über Projekte und offene Aufgaben zu behalten.
- **Kleine Teams** (als spätere Zielgruppe), die heute zwischen Chat-Nachrichten, Notizzetteln und überladenen Tools den Überblick verlieren.
- **Pain Point:** Bestehende Tools sind entweder zu komplex/teuer oder zu unstrukturiert (Chat, Zettel). Gesucht ist „leicht genug zum sofort Loslegen, strukturiert genug zum Drankbleiben".

## Core Features (Roadmap)

| Priorität | Feature | Status |
|-----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Planned |
| P0 (MVP) | Authentifizierung (Registrierung, Login, Logout) | Planned |
| P0 (MVP) | Projektverwaltung (anlegen, umbenennen, löschen) | Planned |
| P0 (MVP) | Aufgabenverwaltung (CRUD: Titel, Beschreibung, Status) | Roadmap |
| P0 (MVP) | Aufgabenansicht nach Status (To Do → In Arbeit → Erledigt) | Roadmap |
| P1 | Fälligkeitsdaten & Erinnerungen | Geplant |
| P1 | Team-Kollaboration (Einladungen, mehrere Nutzer pro Projekt, Rollen) | Geplant |
| P2 | Kommentare & Datei-Anhänge | Geplant |
| P2 | Suche, Filter & Dashboard mit Statistiken | Geplant |

## Success Metrics

**Workflow-Erfolg (Hauptziel):**
- PRD und Feature-Index sauber erstellt.
- Mindestens ein Feature vollständig durchlaufen: Spec → Architecture → Frontend → Backend → QA → Deploy.
- QA ohne kritische/hohe Bugs bestanden.
- Sicherheitsaudit bestanden: RLS greift, Nutzer sehen nur eigene Daten, keine Secrets im Frontend.
- App erfolgreich auf Vercel deployed und live erreichbar.
- Feature-Status in `features/INDEX.md` und den Feature-Files nachvollziehbar aktualisiert.
- Git-Historie dokumentiert die Umsetzung mit klaren Commits.

**Produkt-Erfolg:**
- Neuer Nutzer kann sich registrieren und einloggen.
- Nutzer kann ein Projekt anlegen.
- Nutzer kann Aufgaben anlegen, bearbeiten, löschen und den Status ändern.
- Vollständiger Kernablauf in unter 2 Minuten möglich.
- Daten bleiben nach Reload und erneutem Login erhalten.
- Daten strikt pro Nutzer getrennt.

## Constraints
- Solo-Übungsprojekt: eine Person plus AI-Workflow.
- Kein fixes Budget — kostenlose Tiers von Supabase und Vercel für den MVP.
- Keine harte Deadline; Fokus auf saubere, nachvollziehbare Umsetzung statt Geschwindigkeit.
- Technischer Stack: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui.
- Backend/Auth/Datenbank mit Supabase, möglichst in **EU-Region**.
- Deployment über Vercel.
- Secrets ausschließlich über Environment Variables; **keine sensiblen Schlüssel im Frontend-Code** (nur öffentlicher Anon-Key clientseitig, Service-Role-Key bleibt serverseitig).
- Design: Template-Defaults (Tailwind + shadcn/ui, neutrale Palette), kein eigenes Design-System.

## Non-Goals (bewusst NICHT im MVP)
- Team-Kollaboration: Einladungen, mehrere Nutzer pro Projekt, Rollen & Berechtigungen.
- Fälligkeitsdaten, Erinnerungen, Benachrichtigungen.
- Kommentare und Datei-Anhänge.
- Suche, Filter und Dashboard/Statistiken.
- Eigenes Design-System / aufwendiges Branding.
- Mobile-App (nur responsive Web im MVP, kein nativer Client).

---

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
