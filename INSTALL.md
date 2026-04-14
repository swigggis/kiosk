# Installation auf Debian 12 Server

Diese Anleitung beschreibt die Installation des Schulkiosk-Systems auf einem Debian 12 Server.

## Voraussetzungen

- Debian 12 Server mit root-Zugriff
- Internetzugang
- Optional: Domain-Name (z.B. kiosk.swnetworks.de)

## Schnellinstallation

### Option 1: Automatisches Deployment

```bash
# 1. Projekt auf den Server hochladen
scp -r schulkiosk-projekt root@YOUR_SERVER:/root/schulkiosk

# 2. Auf den Server verbinden
ssh root@YOUR_SERVER

# 3. In das Projekt-Verzeichnis wechseln
cd /root/schulkiosk

# 4. Deployment-Skript ausführen
chmod +x deploy.sh
./deploy.sh
```

Das war's! Die Anwendung läuft jetzt auf Port 3000.

### Option 2: Manuelle Installation

#### Schritt 1: Node.js installieren

```bash
# Node.js 20.x Repository hinzufügen
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js installieren
apt-get install -y nodejs

# Version überprüfen
node --version
npm --version
```

#### Schritt 2: Projekt hochladen

```bash
# Projekt-Verzeichnis erstellen
mkdir -p /root/schulkiosk

# Projekt-Dateien hochladen (von lokalem Computer)
# Methode A: Mit scp
scp -r * root@YOUR_SERVER:/root/schulkiosk/

# Methode B: Mit rsync
rsync -avz --exclude 'node_modules' --exclude 'dist' . root@YOUR_SERVER:/root/schulkiosk/

# Methode C: Mit Git (wenn Repository vorhanden)
git clone YOUR_REPOSITORY /root/schulkiosk
```

#### Schritt 3: Abhängigkeiten installieren

```bash
cd /root/schulkiosk

# NPM-Pakete installieren
npm install

# Frontend bauen
npm run build
```

#### Schritt 4: Systemd Service einrichten

```bash
# Service-Datei kopieren
cp schulkiosk.service /etc/systemd/system/

# Pfade anpassen (falls nötig)
nano /etc/systemd/system/schulkiosk.service

# Systemd neu laden
systemctl daemon-reload

# Service aktivieren (startet automatisch beim Boot)
systemctl enable schulkiosk

# Service starten
systemctl start schulkiosk

# Status überprüfen
systemctl status schulkiosk
```

#### Schritt 5: Firewall konfigurieren (falls UFW verwendet wird)

```bash
# Port 3000 öffnen
ufw allow 3000/tcp

# Status überprüfen
ufw status
```

## Nginx als Reverse Proxy einrichten (optional, empfohlen)

Mit Nginx können Sie die Anwendung auf Port 80 (HTTP) verfügbar machen.

### Nginx installieren

```bash
apt-get update
apt-get install -y nginx
```

### Nginx konfigurieren

```bash
# Beispiel-Konfiguration kopieren
cp nginx-config-example.conf /etc/nginx/sites-available/schulkiosk

# Domain-Namen anpassen
nano /etc/nginx/sites-available/schulkiosk
# Ändern Sie "kiosk.swnetworks.de" zu Ihrer Domain

# Konfiguration aktivieren
ln -s /etc/nginx/sites-available/schulkiosk /etc/nginx/sites-enabled/

# Standard-Site deaktivieren (optional)
rm /etc/nginx/sites-enabled/default

# Nginx-Konfiguration testen
nginx -t

# Nginx neu laden
systemctl reload nginx
```

### Firewall für Nginx anpassen

```bash
# Port 80 öffnen
ufw allow 80/tcp

# Optional: Port 443 für HTTPS
ufw allow 443/tcp
```

## SSL/HTTPS mit Let's Encrypt (optional, empfohlen)

```bash
# Certbot installieren
apt-get install -y certbot python3-certbot-nginx

# SSL-Zertifikat erhalten und Nginx automatisch konfigurieren
certbot --nginx -d kiosk.swnetworks.de

# Automatische Erneuerung testen
certbot renew --dry-run
```

## Zugriff auf die Anwendung

Nach erfolgreicher Installation ist die Anwendung unter folgenden URLs erreichbar:

### Ohne Nginx (direkter Zugriff)
- Kunden-Bestellungen: `http://YOUR_SERVER:3000/`
- Koch-Bereich: `http://YOUR_SERVER:3000/kitchen`
- Anzeige-Display: `http://YOUR_SERVER:3000/display`

### Mit Nginx
- Kunden-Bestellungen: `http://kiosk.swnetworks.de/`
- Koch-Bereich: `http://kiosk.swnetworks.de/kitchen`
- Anzeige-Display: `http://kiosk.swnetworks.de/display`

### Passwort
- Koch und Display: `SchKosk142026#`

## Verwaltung

### Service-Befehle

```bash
# Status anzeigen
systemctl status schulkiosk

# Service starten
systemctl start schulkiosk

# Service stoppen
systemctl stop schulkiosk

# Service neu starten
systemctl restart schulkiosk

# Logs anzeigen
journalctl -u schulkiosk -f

# Logs der letzten 100 Zeilen
journalctl -u schulkiosk -n 100

# Logs seit heute
journalctl -u schulkiosk --since today
```

### Updates einspielen

```bash
# In Projekt-Verzeichnis wechseln
cd /root/schulkiosk

# Neueste Änderungen holen (wenn Git verwendet wird)
git pull

# Oder neue Dateien hochladen mit scp/rsync

# Abhängigkeiten aktualisieren
npm install

# Frontend neu bauen
npm run build

# Service neu starten
systemctl restart schulkiosk
```

## QR-Code generieren

Für einfachen Zugriff können Sie einen QR-Code erstellen:

### Online-Tools
- https://www.qr-code-generator.com/
- https://www.the-qrcode-generator.com/

Einfach die URL eingeben: `http://kiosk.swnetworks.de/order`

### Mit Linux-Tool

```bash
# qrencode installieren
apt-get install -y qrencode

# QR-Code in Terminal anzeigen
qrencode -t ansiutf8 'http://kiosk.swnetworks.de/order'

# QR-Code als PNG speichern
qrencode -o /root/kiosk-qr.png 'http://kiosk.swnetworks.de/order'
```

## Problembehebung

### Service startet nicht

```bash
# Detaillierte Logs anzeigen
journalctl -u schulkiosk -n 50 --no-pager

# Node.js manuell starten zum Testen
cd /root/schulkiosk
node server.js
```

### Port bereits in Verwendung

```bash
# Prozess auf Port 3000 finden
lsof -i :3000

# Oder mit netstat
netstat -tulpn | grep :3000

# Prozess beenden (PID aus obigem Befehl)
kill -9 PID
```

### WebSocket-Verbindung schlägt fehl

Stellen Sie sicher, dass:
- Der Service läuft: `systemctl status schulkiosk`
- Nginx korrekt konfiguriert ist (WebSocket-Headers)
- Keine Firewall die Verbindung blockiert

### Frontend zeigt alte Version

```bash
# Cache löschen und neu bauen
rm -rf dist/
npm run build
systemctl restart schulkiosk

# Browser-Cache löschen (Strg+Shift+R oder Strg+F5)
```

## Monitoring

### Server-Ressourcen überwachen

```bash
# CPU und Speicher in Echtzeit
htop

# Oder mit top
top

# Speichernutzung
free -h

# Festplattennutzung
df -h
```

### Application Performance

```bash
# Prozess-Details des Node.js-Servers
ps aux | grep node

# Netzwerk-Verbindungen
netstat -an | grep :3000
```

## Backup

```bash
# Einfaches Backup erstellen
cd /root
tar -czf schulkiosk-backup-$(date +%Y%m%d).tar.gz schulkiosk/

# Backup auf anderen Server kopieren
scp schulkiosk-backup-*.tar.gz backup-server:/backups/
```

## Support

Bei Problemen:

1. Logs überprüfen: `journalctl -u schulkiosk -f`
2. Service-Status: `systemctl status schulkiosk`
3. Nginx-Logs: `tail -f /var/log/nginx/error.log`

---

**Viel Erfolg mit dem Schulkiosk-System!** 🍴
