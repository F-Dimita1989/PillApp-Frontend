# PillApp — Avvio su telefono via cavo USB

Guida da seguire ogni volta che vuoi sviluppare e testare PillApp sul telefono Android collegato al PC con cavo USB.

**Ambiente:** Windows · Android · Expo dev client (non Expo Go)

---

## Prima volta (configurazione una tantum)

1. Installa **Android Studio** (include Java e Android SDK).
2. Sul telefono: **Impostazioni → Info telefono** → tocca 7 volte **Numero build** per attivare le Opzioni sviluppatore.
3. **Impostazioni → Opzioni sviluppatore** → attiva **Debug USB**.
4. Nella cartella del progetto, installa dipendenze e build iniziale:

```bash
cd c:\Users\A753apulia\Desktop\PillApp\pillapp
npm install
npm run android
```

La prima build può richiedere diversi minuti. Al termine, PillApp sarà installata sul telefono.

---

## Ogni volta (uso quotidiano)

### 1. Sul telefono

1. Collega il cavo USB al PC.
2. Se compare la notifica USB, scegli **Trasferimento file** (MTP), non solo ricarica.
3. Se richiesto, tocca **Consenti debug USB** e (opzionale) spunta **Consenti sempre da questo computer**.
4. Tieni lo schermo sbloccato almeno la prima volta che colleghi il cavo.

### 2. Sul PC

Apri un terminale nella cartella del progetto:

```bash
cd c:\Users\A753apulia\Desktop\PillApp\pillapp
```

Verifica che il telefono sia riconosciuto:

```bash
adb devices
```

Output atteso (esempio):

```
List of devices attached
ABC123XYZ    device
```

Se vedi `unauthorized`, sblocca il telefono e accetta il prompt di debug USB, poi ripeti `adb devices`.

Apri il tunnel verso Metro (bundler JavaScript):

```bash
adb reverse tcp:8081 tcp:8081
```

Avvia il server di sviluppo:

```bash
npm start
```

### 3. Sul telefono

Apri l’app **PillApp** (icona installata sul dispositivo). Si collegherà automaticamente al PC.

---

## Flusso rapido (copia-incolla)

Quando tutto è già configurato:

```bash
cd c:\Users\A753apulia\Desktop\PillApp\pillapp
adb devices
adb reverse tcp:8081 tcp:8081
npm start
```

Poi apri PillApp sul telefono.

---

## Quando usare `npm run android`

Usa la build completa (più lenta) solo in questi casi:

- prima installazione dell’app sul telefono;
- dopo aver aggiunto o aggiornato plugin nativi (OCR, notifiche, calendario, ecc.);
- dopo aver modificato `app.json` in parti native;
- se l’app non si apre o crasha all’avvio.

```bash
npm run android
```

Per forzare il dispositivo fisico invece dell’emulatore:

```bash
npx expo run:android --device
```

---

## Risoluzione problemi

| Problema | Soluzione |
|----------|-----------|
| `adb` non riconosciuto | Usa il terminale integrato in Cursor/VS Code dal progetto, oppure apri un nuovo terminale dopo l’installazione di Android Studio |
| Nessun dispositivo in `adb devices` | Cambia cavo o porta USB; verifica Debug USB; prova un cavo dati (non solo ricarica) |
| Stato `unauthorized` | Sblocca il telefono, accetta il prompt debug USB, ripeti `adb devices` |
| App aperta ma non si aggiorna | `adb reverse tcp:8081 tcp:8081`, chiudi e riapri PillApp |
| Schermo rosso / errore di connessione | Controlla che `npm start` sia in esecuzione sul PC; PC e telefono devono essere sullo stesso PC (cavo collegato) |
| Build fallisce | Verifica che Android Studio sia installato; riprova `npm run android` |

---

## Note

- PillApp usa un **development build** (`expo-dev-client`), non Expo Go.
- `npm start` avvia solo il bundler; l’app nativa deve essere già installata sul telefono.
- Su **iPhone via cavo** serve un Mac con Xcode (`npm run ios -- --device`). Da Windows non è possibile buildare per iOS in locale.

---

*PillApp — Copyright © 2026 Filippo Dimita. Tutti i diritti riservati.*
