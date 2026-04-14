# Bedienungsanleitung - Schulkiosk BBS2 Celle

## Übersicht

Das Schulkiosk-System besteht aus drei Komponenten:

1. **Kunden-App** - Für Schüler zum Bestellen (Handy)
2. **Koch-Dashboard** - Für die Küche (Tablet/Laptop)
3. **Anzeige-Display** - Für Kunden-Information (Monitor/TV)

---

## 1. Kunden-App (Schüler)

**URL:** `kiosk.swnetworks.de/order` oder `/`

### So funktioniert's:

1. **QR-Code scannen** oder URL im Browser öffnen
2. **Produkte auswählen**
   - Durch die Kategorien scrollen (Nuggets, Crêpes, Waffeln)
   - Auf **+** Button tippen, um Produkt in den Warenkorb zu legen
   - Auf **−** Button im Warenkorb tippen, um Produkte zu entfernen
3. **Bestellung aufgeben**
   - Warenkorb wird unten angezeigt
   - Gesamtpreis wird berechnet
   - Auf grünen **"Bestellung aufgeben"** Button tippen
4. **Bestellnummer merken!**
   - Eine große Nummer wird angezeigt
   - Diese Nummer gut merken oder Screenshot machen
5. **Abholen & Bezahlen**
   - Auf dem Display-Monitor auf deine Nummer warten
   - Wenn die Nummer **grün** erscheint → Abholen!
   - **Bezahlung erfolgt bei Abholung**

### Wichtig:
- 📱 **Nur 1 Bestellung** pro Person gleichzeitig
- 💰 **Bezahlung erst bei Abholung**
- 🔢 **Nummer gut merken** - ohne Nummer keine Bestellung!

---

## 2. Koch-Dashboard

**URL:** `kiosk.swnetworks.de/kitchen`  
**Passwort:** `SchKosk142026#`

### Hauptfunktionen:

#### Bestellungen verwalten

1. **Neue Bestellungen**
   - Erscheinen automatisch in Echtzeit (kein Neuladen nötig!)
   - Orange hervorgehoben
   - Mit Bestellnummer (#1, #2, #3, ...)
   - Uhrzeit der Bestellung angezeigt

2. **Produkte als fertig markieren**
   - Auf **"Als fertig markieren"** Button bei jedem Produkt klicken
   - Button wird grün mit ✅
   - Wenn ALLE Produkte einer Bestellung fertig sind:
     → Bestellung verschwindet automatisch
     → Nummer erscheint auf Display als "Abholbereit" (grün)

3. **Bestellung löschen**
   - Falls Fehler oder Stornierung
   - Auf **🗑️ Löschen** Button klicken
   - Bestätigung erforderlich

#### Verfügbarkeit verwalten

Im rechten Bereich:

- **Produkte als "Ausverkauft" markieren**
  - Auf **⛔ Ausverkauft** Button klicken
  - Produkt wird rot markiert
  - Kunden können es nicht mehr bestellen
  
- **Produkte wieder verfügbar machen**
  - Auf **✅ Verfügbar machen** Button klicken
  - Produkt ist wieder bestellbar

#### Bestell-Stopp

Oben rechts:

- **🛑 Bestell-Stopp** aktivieren
  - ALLE Bestellungen werden gestoppt
  - Kunden sehen: "Wir nehmen keine Bestellungen mehr an"
  - Display zeigt entsprechende Meldung
  
- **✅ Bestellungen aktivieren**
  - Bestellungen werden wieder möglich

### Workflow:

```
1. Neue Bestellung kommt rein (Orange #5)
2. Produkt 1 fertig → Klick "Als fertig markieren" → Grün ✅
3. Produkt 2 fertig → Klick "Als fertig markieren" → Grün ✅
4. Alle fertig? → Bestellung verschwindet automatisch
5. Nummer #5 erscheint auf Display als "Abholbereit" (Grün)
```

---

## 3. Anzeige-Display

**URL:** `kiosk.swnetworks.de/display`  
**Passwort:** `SchKosk142026#`

### Aufbau:

Zwei große Spalten:

#### Linke Spalte: ⏳ Wird vorbereitet (Orange)
- Zeigt alle Bestellnummern, die gerade zubereitet werden
- Orange Kacheln mit großer Nummer

#### Rechte Spalte: ✅ Abholbereit (Grün)
- Zeigt alle fertigen Bestellungen
- Grüne, pulsierende Kacheln
- **Hier auf deine Nummer achten!**

### Für Kunden:

1. **Bestellung aufgegeben** → Nummer erscheint **orange** links
2. **Warten...**
3. **Nummer wird grün** rechts → **ABHOLEN & BEZAHLEN!**

### Setup:

- Am besten auf großem Monitor/TV im Kiosk-Bereich
- Browser im Vollbild-Modus (F11)
- Automatische Aktualisierung (kein Neuladen nötig)

---

## Produktsortiment & Preise

### 🍗 Chicken Nuggets
- 5 Stück: **3,00 €**
- 9 Stück: **5,00 €**
- 12 Stück: **6,00 €**

### 🥞 Crêpes
- Plain: **2,00 €**
- Puderzucker: **2,00 €**
- Nutella: **2,50 €**

### 🧇 Waffeln
- Plain: **2,00 €**
- Puderzucker: **2,00 €**
- Nutella: **2,50 €**

---

## Häufige Fragen (FAQ)

### Für Schüler:

**Q: Ich habe meine Nummer vergessen!**  
A: Leider können wir die Bestellung dann nicht zuordnen. Beim nächsten Mal einen Screenshot machen!

**Q: Wie lange dauert meine Bestellung?**  
A: Je nach Auslastung 5-15 Minuten. Achte auf das Display!

**Q: Kann ich stornieren?**  
A: Sprich mit dem Personal an der Kasse.

**Q: Wann muss ich bezahlen?**  
A: Erst bei Abholung, wenn deine Nummer grün auf dem Display erscheint.

**Q: Ein Produkt ist ausverkauft!**  
A: Wähle ein anderes Produkt. Ausverkaufte Artikel sind gekennzeichnet.

### Für Köche:

**Q: Eine Bestellung wurde doppelt aufgegeben!**  
A: Einfach eine der Bestellungen über den 🗑️ Button löschen.

**Q: Display zeigt alte Bestellungen!**  
A: Alle Produkte der Bestellung als fertig markieren, dann verschwindet sie automatisch.

**Q: Kunde sagt, seine Nummer ist fertig, aber nicht abgeholt!**  
A: Nummer bleibt auf Display bis zum nächsten Tag. Einfach erneut zubereiten oder löschen.

**Q: Internet/System ist down!**  
A: System neu starten mit: `systemctl restart schulkiosk`

---

## Tipps & Best Practices

### Für effizientes Arbeiten:

1. **Mehrere Bestellungen parallel** vorbereiten
2. **Gleiche Produkte zusammen** zubereiten (z.B. alle Nuggets auf einmal)
3. **Regelmäßig Verfügbarkeit** aktualisieren
4. **Am Ende des Tages** Bestell-Stopp aktivieren

### Setup-Empfehlungen:

- **Küche:** Tablet im Querformat auf Ständer
- **Display:** Großer Monitor/TV im Hochformat oder Querformat
- **QR-Code:** Ausgedruckt und gut sichtbar am Kiosk

---

## Technischer Support

Bei Problemen:

1. **Browser neu laden** (F5 oder Strg+R)
2. **Service neu starten** (für IT): `systemctl restart schulkiosk`
3. **Logs prüfen** (für IT): `journalctl -u schulkiosk -f`

---

**Guten Appetit und viel Erfolg!** 🍴
