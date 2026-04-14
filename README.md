# BBS2 Celle Schulkiosk System

Ein vollständiges Bestellsystem für den Schulkiosk der BBS2 Celle mit Echtzeit-Updates über WebSocket.

## Features

- **Kunden-Frontend** (mobil-optimiert): Bestellungen aufgeben via QR-Code
- **Koch-Frontend** (Tablet/Laptop): Bestellungen verwalten und als fertig markieren
- **Kassen-Frontend**: Abholbereite Bestellungen mit Preisen
- **Anzeige-Display**: Bestellstatus für Kunden (vorbereitet/abholbereit)
- **Echtzeit-Updates**: Alle Clients werden live über WebSocket synchronisiert
- **Passwortschutz**: Koch-, Kassen- und Anzeige-Seiten geschützt

## Passwort

Alle geschützten Bereiche (Küche, Kasse): `SchKosk142026#`

## URLs

- **Kundenbestellungen**: `https://kiosk.swnetworks.de/order`
- **Küche**: `https://kiosk.swnetworks.de/kitchen`
- **Kasse**: `https://kiosk.swnetworks.de/cashier`
- **Anzeige**: `https://kiosk.swnetworks.de/display`

## Sortiment

### Chicken Nuggets
- 5 Stück: 3,00€
- 9 Stück: 5,00€
- 12 Stück: 6,00€

### Crepes
- Plain: 2,00€
- Puderzucker: 2,00€
- Nutella: 2,50€

### Waffeln
- Plain: 2,00€
- Puderzucker: 2,00€
- Nutella: 2,50€

## Installation auf Debian 12 Server

Siehe [INSTALL.md](./INSTALL.md) für detaillierte Installationsanweisungen.

### Kurzversion

```bash
# Abhängigkeiten installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx

# Projekt klonen
cd /var/www
git clone <repository-url> kiosk
cd kiosk

# Abhängigkeiten installieren
npm install

# Build erstellen
npm run build

# Server starten
npm start
```

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Frontend-Dev-Server (Port 5173)
npm run dev

# Backend-Server (Port 3000)
npm start

# Build für Produktion
npm run build
```

## Technologie-Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Font Awesome Icons
- Socket.IO Client
- React Router

### Backend
- Node.js
- Express
- Socket.IO
- In-Memory Datenspeicherung

## Funktionen

### Kunden-Frontend
- Menü durchsuchen
- Artikel zum Warenkorb hinzufügen
- Bestellungen aufgeben
- Bestellnummer erhalten
- Responsive Design für Smartphones

### Koch-Frontend
- Alle offenen Bestellungen sehen
- Einzelne Artikel als fertig markieren
- Automatische Statusänderung zu "abholbereit"
- Artikel als ausverkauft markieren
- Bestellungen löschen
- Bestellstopp aktivieren/deaktivieren
- Optimiert für Tablet/Laptop

### Kassen-Frontend
- Abholbereite Bestellungen mit Preisen
- Bestellnummer und Artikelliste
- Bestellungen als bezahlt markieren (löschen)
- Übersichtliche Tabellenansicht

### Anzeige-Display
- Zwei Spalten: "Wird vorbereitet" und "Abholbereit"
- Große, gut lesbare Nummern
- Automatische Echtzeit-Updates
- Optimiert für große Bildschirme

## Systemd Service

Der Service wird automatisch mit dem System gestartet:

```bash
# Status prüfen
systemctl status kiosk

# Neustart
systemctl restart kiosk

# Logs anzeigen
journalctl -u kiosk -f
```

## Nginx-Konfiguration

Der Nginx-Reverse-Proxy leitet alle Anfragen an den Node.js-Server weiter und unterstützt WebSocket-Verbindungen.

## Sicherheit

- Passwortschutz für geschützte Bereiche
- HTTPS über Nginx (Let's Encrypt empfohlen)
- Keine sensiblen Daten in der Datenbank

## Support

Bei Problemen oder Fragen, siehe [INSTALL.md](./INSTALL.md) für Troubleshooting.
