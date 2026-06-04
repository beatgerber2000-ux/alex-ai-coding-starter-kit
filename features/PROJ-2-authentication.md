# PROJ-2: Authentifizierung (Registrierung, Login, Logout)

## Status: Planned
**Created:** 2026-06-04
**Last Updated:** 2026-06-04

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
- [ ] Soll der Logout-Button für den MVP schon final im Header platziert werden oder genügt eine schlichte Variante auf der `/dashboard`-Platzhalterseite? (Klärung spätestens in `/frontend`.)

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
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
