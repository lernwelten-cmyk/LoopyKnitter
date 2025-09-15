# DEPLOYMENT GUIDE - LoopyKnitter PWA

Dieser Guide beschreibt den vollständigen Deployment-Prozess für die **LoopyKnitter** PWA über GitHub und Netlify.

## 1. Projektübersicht

### Relevante Dateien für Deployment:
- ✅ `index.html` - Haupt-App-Datei
- ✅ `manifest.json` - PWA Manifest
- ✅ `sw.js` - Service Worker
- ✅ `icon-192.png` - App Icon (192x192)
- ✅ `icon-512.png` - App Icon (512x512)
- ✅ `app_icon.png` - Original Icon (Optional)

---

## 2. GitHub Repository Setup

### Initial Setup:
```bash
# 1. Repository auf GitHub erstellen (loopyknitter)
# 2. Lokales Git initialisieren
git init
git branch -M main

# 3. .gitignore erstellen (optional)
echo "*.log" > .gitignore
echo ".DS_Store" >> .gitignore

# 4. Erste Commits
git add .
git commit -m "feat: initial commit - LoopyKnitter PWA v1.0.0"

# 5. Remote Repository verbinden
git remote add origin https://github.com/[USERNAME]/loopyknitter.git
git push -u origin main
```

### Empfohlene README.md:
```markdown
# LoopyKnitter

Ein Strickprojekt-Zähler als Progressive Web App.

- 🧶 Mehrere Projekte verwalten
- 📱 Offline-fähig
- 🎯 Ziel-basierte Fortschrittsverfolgung

## Live Demo
https://loopyknitter.netlify.app
```

---

## 3. Netlify GitHub Deployment

### Schritt-für-Schritt Setup:

1. **Netlify Account verbinden**
   - Auf [netlify.com](https://netlify.com) anmelden
   - "Add new site" → "Import an existing project"
   - GitHub als Quelle auswählen

2. **Repository auswählen**
   - `loopyknitter` Repository wählen
   - Berechtigung für Repository erteilen

3. **Build Settings konfigurieren:**
   ```
   Branch to deploy: main
   Base directory: (leer lassen)
   Build command: (leer lassen)
   Publish directory: /
   Functions directory: (leer lassen)
   ```

4. **Deploy starten**
   - "Deploy site" klicken
   - Netlify generiert automatische URL: `https://[random-name].netlify.app`

5. **Custom Domain (Optional)**
   - Site settings → Domain management
   - "Add custom domain" → `loopyknitter.netlify.app`

---

## 4. Versionierung & Cache Management

### App Version aktualisieren:

**In `sw.js` anpassen:**
```js
// Vorher
const APP_VERSION = "1.0.0";

// Nachher (bei Update)
const APP_VERSION = "1.0.1";
const CACHE_NAME = `loopy-knitter-${APP_VERSION}`;
```

### Update-Workflow:
```bash
# 1. Änderungen vornehmen
# 2. APP_VERSION in sw.js erhöhen
# 3. Commit erstellen
git add .
git commit -m "update: v1.0.1 - improved counter logic"

# 4. Push zu GitHub
git push origin main

# 5. Netlify deployt automatisch die neue Version
```

### Cache Invalidation (iOS/iPad):
- **Safari:** Einstellungen → Safari → Website-Daten → Alle Website-Daten löschen
- **PWA:** App vom Homescreen löschen und neu hinzufügen
- **Alternative:** Hard Refresh in Safari (Cmd+Shift+R)

---

## 5. Post-Deployment Checks ✅

### Deployment-Verifikation:
- [ ] App-URL aufrufen: `https://loopyknitter.netlify.app`
- [ ] Service Worker lädt korrekt (F12 → Application → Service Workers)
- [ ] Manifest funktioniert (F12 → Application → Manifest)
- [ ] Icons werden angezeigt
- [ ] "Zum Home-Bildschirm hinzufügen" testen
- [ ] Offline-Funktionalität prüfen (Netzwerk deaktivieren)
- [ ] Neue Version wird geladen (Cache-Name in DevTools prüfen)

### Mobile Tests:
- [ ] Safari auf iPhone/iPad öffnen
- [ ] PWA Installation testen
- [ ] App startet eigenständig
- [ ] Alle Funktionen arbeiten korrekt

---

## 6. Netlify Management

### Deploy History einsehen:
1. Netlify Dashboard → Site auswählen
2. "Deploys" Tab öffnen
3. Liste aller Deployments mit Status und Zeitstempel

### Rollback durchführen:
1. Gewünschten Deploy auswählen
2. "Preview deploy" klicken
3. Bei Zufriedenheit: "Publish deploy"
4. **Achtung:** Cache-Invalidation bei Rollback erforderlich!

### Fehlerbehebung:
**Deploy fehlgeschlagen:**
- Build-Log in Netlify prüfen
- Dateipfade in `manifest.json` und `sw.js` kontrollieren
- GitHub Repository-Berechtigung prüfen

**Service Worker nicht aktualisiert:**
```js
// In Browser-Konsole:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

---

## 7. Best Practices

### Commit Messages:
```bash
# Gute Beispiele:
git commit -m "feat: add project deletion feature"
git commit -m "fix: counter reset bug on iOS Safari"
git commit -m "update: v1.0.2 - improved offline handling"
git commit -m "style: update app icon and color theme"
```

### Wann APP_VERSION erhöhen:
- ✅ **Immer bei:** Funktionsänderungen, Bug-Fixes, Asset-Updates
- ✅ **Empfohlen bei:** Design-Änderungen, neue Features
- ❌ **Nicht bei:** README-Updates, Code-Kommentaren

### Häufige Fehlerquellen:

| Problem | Symptom | Lösung |
|---------|---------|--------|
| Falsche Icon-Pfade | Icons werden nicht angezeigt | Pfade in `manifest.json` prüfen |
| Alter Service Worker | App lädt nicht neu | APP_VERSION erhöhen + Cache löschen |
| Publish Directory falsch | 404 bei App-Aufruf | Publish directory auf `/` setzen |
| Branch nicht synced | Deployment läuft nicht | `git push origin main` prüfen |

### Deployment-Intervall:
- **Entwicklung:** Bei jedem Feature-Commit
- **Produktion:** Wöchentlich oder bei kritischen Fixes
- **Hotfixes:** Sofort nach Bestätigung

---

## Quick Reference

**Typischer Update-Workflow:**
```bash
# 1. Änderungen machen
# 2. APP_VERSION in sw.js erhöhen
# 3. Testen
# 4. Committen und pushen
git add .
git commit -m "update: v1.0.X - [description]"
git push origin main
# 5. Netlify deployt automatisch
# 6. Post-Deployment Tests durchführen
```

**Wichtige URLs:**
- 🌐 **Live App:** https://loopyknitter.netlify.app
- ⚙️ **Netlify Dashboard:** https://app.netlify.com
- 📂 **GitHub Repo:** https://github.com/[USERNAME]/loopyknitter

---

*Letztes Update: 15. September 2025*