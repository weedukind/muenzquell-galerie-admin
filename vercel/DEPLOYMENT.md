# Next.js-Projekt auf Vercel deployen — Schritt für Schritt

Diese Anleitung fasst zusammen, was nötig ist, um ein Next.js-Projekt auf Vercel zu deployen — inklusive Git-Integration, Environment-Variablen und ein paar Stolperfallen, die in der Praxis nicht sofort offensichtlich sind. Als laufendes Beispiel dient `app-node/` aus diesem Repo (Next.js liegt hier in einem Unterordner, nicht im Repo-Root — das ist absichtlich mit drin, weil es eine der Stolperfallen betrifft).

## Voraussetzungen

- Ein Vercel-Account
- Das Next.js-Projekt in einem Git-Repository (GitHub/GitLab/Bitbucket)
- Vercel CLI — kein globales Install nötig, `npx vercel@latest <command>` reicht

## 1. Authentifizieren

**Interaktiv** (auf einer Maschine mit Browser):

```bash
npx vercel login
```

**Nicht-interaktiv** (Skripte, CI, oder wenn kein Browser zur Verfügung steht):

1. Personal Access Token erstellen unter **vercel.com/account/tokens**
2. Bei jedem Befehl mitgeben:

```bash
npx vercel whoami --token="<TOKEN>"
```

> Wichtig, falls in mehreren einzelnen Shell-Aufrufen gearbeitet wird (z. B. durch einen Agenten oder CI-Schritte): Umgebungsvariablen wie `VERCEL_TOKEN` bleiben nicht automatisch über separate Shell-Sessions hinweg erhalten. Den Token in jedem eigenständigen Befehl neu setzen bzw. mitgeben.

## 2. Projekt verknüpfen

Im Verzeichnis, das die Next.js-App enthält (bei einem Unterordner-Layout also dort hinein `cd`en):

```bash
npx vercel link --yes --token="<TOKEN>"
```

Das legt `.vercel/project.json` an, erkennt Next.js automatisch und legt bei Bedarf ein neues Vercel-Projekt an.

## 3. Environment-Variablen setzen

```bash
npx vercel env add NAME production,preview --value "<wert>" --yes --token="<TOKEN>"
```

- Mehrere Environments lassen sich kommagetrennt in einem Aufruf angeben (`production,preview,development`).
- **Falle:** Vercel erlaubt keine als "sensitive" markierten Variablen im `development`-Environment. Optionen: `--no-sensitive` verwenden (Wert bleibt dann später lesbar) oder `development` einfach weglassen — lokal läuft ohnehin meist die eigene `.env.local`, nicht `vercel dev`.
- Zum lokalen Abgleich: `npx vercel env pull .env.local --yes`

## 4. Erster Deploy (manuell über die CLI)

```bash
npx vercel deploy --token="<TOKEN>"          # Preview-Deployment
npx vercel deploy --prod --token="<TOKEN>"   # Production-Deployment
```

**Falle:** Bei einem brandneuen Projekt, das noch nicht per Git verbunden ist, kann bereits ein einfacher `vercel deploy` (ohne `--prod`) direkt auf **Production** landen — offenbar weil es die allererste Deployment für das Projekt ist und kein Branch-Kontext existiert. Nach dem Deploy im Output auf `"target": "production"` vs. `"preview"` achten, nicht blind annehmen.

## 5. Git-Integration einrichten (für automatische Deploys bei Push)

Das ist der Teil mit den meisten unsichtbaren Voraussetzungen:

### a) GitHub-Konto mit Vercel verbinden (Login Connection)

Vercel-Account-Einstellungen → Login Connections → GitHub verbinden.

### b) Die Vercel-GitHub-App installieren (separater Schritt!)

Login Connection ≠ Repo-Zugriff. Ohne diesen zweiten Schritt schlägt das Verbinden des Repos mit einer Fehlermeldung wie *"You need to add a Login Connection to your GitHub account first"* fehl, obwohl die Login Connection längst existiert.

Direkt installieren unter: **github.com/apps/vercel/installations/new** — dort explizit das gewünschte Repo (oder "All repositories") freigeben. Falls der Account/die Organisation dort nicht auftaucht: prüfen, ob es sich um eine GitHub-Organisation handelt — dann liegen App-Installationen unter `github.com/organizations/<org>/settings/installations`, nicht in den persönlichen Einstellungen.

### c) Repo verbinden

```bash
npx vercel git connect git@github.com:<owner>/<repo>.git --yes --token="<TOKEN>"
```

Danach: Push auf die **Production Branch** (Standard: der Default-Branch des Repos) löst automatisch ein Production-Deployment aus, Pushes auf andere Branches erzeugen Preview-Deployments.

## 6. Root Directory setzen (nur falls die App nicht im Repo-Root liegt)

Wenn das Next.js-Projekt in einem Unterordner liegt (z. B. `app-node/` in einem Monorepo-artigen Layout), muss Vercel das wissen — sonst sucht ein Git-getriggerter Build am Repo-Root nach einem `package.json` und scheitert.

Einstellbar über die REST-API (kein CLI-Befehl dafür gefunden):

```bash
curl -X PATCH \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"app-node"}' \
  "https://api.vercel.com/v9/projects/<projectId>?teamId=<teamId>"
```

(Alternativ: Dashboard → Project → Settings → General → Root Directory.)

## 7. Optional: Production-Deploys auf einen bestimmten Branch beschränken

- **Welcher Branch als "Production" zählt**, lässt sich über einen eigenen API-Endpunkt ändern (`productionBranch` im normalen Projekt-PATCH wird dagegen nicht akzeptiert):

```bash
npx vercel api "/v9/projects/<projectId>/branch?teamId=<teamId>" -X PATCH --input <(echo '{"branch":"production"}')
```

  Kontrolle: `link.productionBranch` in `GET /v9/projects/<projectId>`. Den Branch vorher anlegen und pushen.
- **Deployments für andere Branches komplett unterdrücken** (nicht nur "kein Production-Ziel", sondern gar kein Build) geht über den *Ignored Build Step*, per API-Feld `commandForIgnoringBuildStep`:

```bash
curl -X PATCH \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"commandForIgnoringBuildStep":"if [ \"$VERCEL_GIT_COMMIT_REF\" = \"production\" ]; then exit 1; else exit 0; fi"}' \
  "https://api.vercel.com/v9/projects/<projectId>?teamId=<teamId>"
```

Exit-Code `0` = Build überspringen, Exit-Code ungleich `0` = Build durchführen.

## 8. Optional: Zugriff einschränken (Passwortschutz)

Für einen einfachen "htaccess-artigen" Schutz vor der ganzen App (alle Seiten + API-Routen), unabhängig vom Vercel-Plan:

- Next.js **16+**: Datei `proxy.ts` im Projekt-Root (früher `middleware.ts` — Next 16 hat das umbenannt, Export heißt jetzt `proxy` statt `middleware`, Doku dazu liegt lokal unter `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`)
- Darin HTTP Basic Auth gegen zwei Environment-Variablen prüfen (z. B. `SITE_USERNAME`/`SITE_PASSWORD`), bei fehlendem/falschem Header `401` mit `WWW-Authenticate`-Header zurückgeben
- Läuft standardmäßig auf der Node.js-Runtime (Next 16), `Buffer` steht also ohne Zusatzaufwand zur Verfügung
- Alternative ohne eigenen Code: Vercels eingebauter "Password Protection" (Teil der Deployment Protection) — je nach Plan ggf. kostenpflichtig

## Checkliste zur Verifikation

- [ ] `vercel whoami` liefert den erwarteten Account
- [ ] `.vercel/project.json` existiert und zeigt aufs richtige Projekt
- [ ] Alle benötigten Env-Vars sind gesetzt (`vercel env ls`)
- [ ] Deploy-Status ist `READY` (`vercel ls` bzw. `vercel inspect <url>`)
- [ ] Bei Unterordner-Layout: Root Directory korrekt gesetzt
- [ ] Bei Git-Integration: Push auf den richtigen Branch löst tatsächlich das erwartete Deployment-Ziel (Production vs. Preview) aus
- [ ] Falls Zugriffsschutz gewünscht: manuell mit korrekten/falschen Zugangsdaten gegen die Live-URL testen
