# PROJ-1: Supabase Infrastructure Setup

## Status: Planned
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
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
