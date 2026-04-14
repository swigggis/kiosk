# Schulkiosk BBS2 Celle

Ein vollständiges Bestellsystem für den Schulkiosk der BBS2 Celle.

## Features

- **Kunden-Frontend** (`/` oder `/order`): Mobil-optimiert für Schülerbestellungen
- **Koch-Frontend** (`/kitchen`): Tablet/Laptop-optimiert für die Küche
- **Anzeige-Display** (`/display`): Großbildschirm für Bestellstatus

## Produktsortiment

### Chicken Nuggets
- 5 Stück: 3,00 €
- 9 Stück: 5,00 €
- 12 Stück: 6,00 €

### Crêpes
- Plain: 2,00 €
- Puderzucker: 2,00 €
- Nutella: 2,50 €

### Waffeln
- Plain: 2,00 €
- Puderzucker: 2,00 €
- Nutella: 2,50 €

## Installation auf Debian 12 Server

### Voraussetzungen

```bash
# Node.js installieren (als root)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Projekt hochladen
# (z.B. via git clone oder scp)
```

### Installation

```bash
# In das Projektverzeichnis wechseln
cd /pfad/zum/projekt

# Abhängigkeiten installieren
npm install

# Frontend bauen
npm run build
```

### Server starten

**Manuell:**
```bash
node server.js
```

**Mit Start-Skript:**
```bash
chmod +x start-server.sh
./start-server.sh
```

### Als Systemd Service (empfohlen)

Erstelle `/etc/systemd/system/schulkiosk.service`:

```ini
[Unit]
Description=Schulkiosk BBS2 Celle
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/pfad/zum/projekt
ExecStart=/usr/bin/node /pfad/zum/projekt/server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Dann:
```bash
systemctl daemon-reload
systemctl enable schulkiosk
systemctl start schulkiosk
systemctl status schulkiosk
```

### Nginx Reverse Proxy (optional)

Wenn Sie die App auf Port 80/443 verfügbar machen möchten:

```nginx
server {
    listen 80;
    server_name kiosk.swnetworks.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Verwendung

### Kunden-Seite (/)
1. QR-Code scannen oder `kiosk.swnetworks.de/order` aufrufen
2. Produkte in den Warenkorb legen
3. Bestellung aufgeben
4. Bestellnummer merken
5. Bei Abholung bezahlen

### Koch-Seite (/kitchen)
- **Passwort:** `SchKosk142026#`
- Bestellungen werden live angezeigt
- Einzelne Produkte als fertig markieren
- Produkte als ausverkauft markieren
- Bestellungen löschen (falls nötig)
- Bestell-Stopp aktivieren/deaktivieren

### Anzeige-Seite (/display)
- **Passwort:** `SchKosk142026#`
- Zeigt zwei Spalten:
  - "Wird vorbereitet" (orange)
  - "Abholbereit" (grün, pulsierend)
- Aktualisiert sich automatisch in Echtzeit

## Technologie-Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Echtzeit:** WebSocket (ws)
- **Build:** Vite

## Support

Bei Fragen oder Problemen wenden Sie sich an den IT-Support der BBS2 Celle.
