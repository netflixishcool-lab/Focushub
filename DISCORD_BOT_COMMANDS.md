# Discord Bot Befehle

## Übersicht

Der FocusHub Discord Bot bietet folgende Befehle:

---

## !redeem <key>

**Beschreibung**: Löst einen Lizenzschlüssel ein

**Syntax**:
```
!redeem A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

**Beispiel**:
```
@user: !redeem A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6

@Bot:
🔐 Key Einlösung erfolgreich!
Benutzer: User_a1b2c3d4
Lizenztyp: PREMIUM
Verfällsdatum: 07.07.2025

Einlösung auch per DM erhalten
```

**Fehler**:
- `Key nicht gefunden` - Key existiert nicht
- `Key bereits verwendet` - Key wurde bereits eingelöst
- `Key ist abgelaufen` - Key Verfallsdatum überschritten

**Sicherheit**:
- Key wird in DM bestätigt
- Admin sieht nur Namen und Typ
- Details in privater Nachricht

---

## !status

**Beschreibung**: Zeigt Live-Systemstatistiken

**Syntax**:
```
!status
```

**Beispiel**:
```
@user: !status

@Bot:
📊 System Status
Aktive Benutzer: 42
Gesamt Keys: 150
Eingelöste Keys: 127
Verfügbare Keys: 23
Premium User: 28
Lifetime User: 10
```

**Zugriff**: Öffentlich für alle

**Aktualisierung**: Alle 30 Sekunden

---

## !myinfo

**Beschreibung**: Zeigt Deine Account Informationen

**Syntax**:
```
!myinfo
```

**Beispiel**:
```
@user: !myinfo

@Bot (Private Message):
👤 Deine Account Informationen
Username: User_a1b2c3d4
Lizenztyp: PREMIUM
Status: ✓ Aktiv
Verfällsdatum: 07.07.2025
```

**Fehler**:
- `Account nicht gefunden` - Du hast noch keinen Key eingelöst

**Sicherheit**:
- Nur per DM sichtbar
- Keine öffentliche Anzeige von Accountdaten

---

## !info

**Beschreibung**: Zeigt alle verfügbaren Befehle

**Syntax**:
```
!info
```

**Beispiel**:
```
@user: !info

@Bot:
ℹ️ FocusHub Admin Panel Befehle
!redeem <key> - Löse einen Key ein
!status - Zeige Systemstatus
!myinfo - Zeige deine Account-Informationen
!info - Zeige diese Hilfe
```

**Zugriff**: Öffentlich für alle

---

## Erweiterte Befehle (Geplant)

### !license <duration>
Verlange Lizenz-Ververlängerung

### !verify <hwid>
Verifiziere deine Hardware ID

### !support
Kontaktiere Support

---

## Fehlerbehandlung

### Allgemeine Fehler

```
Fehler beim Verarbeiten des Befehls
```
Das System hat einen internen Fehler. Versuche es später erneut.

### Rate Limiting

```
Zu viele Anfragen - Bitte warte 1 Minute
```
Jeder Benutzer kann maximal 10 Befehle pro Minute nutzen.

### Authentifizierung

```
Du musst dich zuerst anmelden
```
Löse einen Key ein um einen Account zu erstellen.

---

## Tips & Tricks

### 🚠 Key Einlösung

**Sichere Methode**:
1. Kopiere deinen Key
2. Schreibe `!redeem ` (mit Leerzeichen)
3. Füge Key ein
4. Sende

**Vorsicht**:
- Key ist CASE-SENSITIVE
- Keine Leerzeichen am Anfang/Ende
- Jeder Key kann nur 1x verwendet werden

### 👤 Account Sicherheit

- Teile deine Account-Infos nicht
- Verwende einen sicheren Discord-Account
- Aktiviere 2FA auf Discord
- Melde verdächtige Aktivität

### 🕐 Zeitzonen

Alle Daten werden in UTC gespeichert
Beispiel: `07.07.2025 14:30:00 UTC`

---

## FAQ

**Q: Kann ich einen eingelösten Key wieder verwenden?**
A: Nein, jeder Key kann nur einmal verwendet werden.

**Q: Was passiert wenn meine Lizenz abläuft?**
A: Du kannst keinen neuen Key einlösen bis Admin deinen Account aktualisiert.

**Q: Kann ich meinen Account auf einen anderen Discord transferieren?**
A: Nein, Accounts sind an Discord ID gebunden. Kontaktiere Support.

**Q: Kann ich mehrere Keys auf einem Account?**
A: Nein, aber Admin kann Lizenz-Dauer verlängern.

**Q: Mein Bot reagiert nicht - was tun?**
A: 
1. Prüfe dass Bot online ist
2. Prüfe dass Backend läuft
3. Warte 30 Sekunden und versuche erneut
4. Wenn noch nicht: Kontaktiere Support

---

## Support

Bei Fragen oder Problemen:
- Schreibe `!support` im Bot
- Oder kontaktiere den Admin

---

**Zuletzt aktualisiert**: 2025-06-07
**Bot Version**: 1.0.0
