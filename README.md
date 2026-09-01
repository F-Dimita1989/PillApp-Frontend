# PillApp

PillApp è un'app mobile sviluppata con **Expo** e **React Native** pensata per aiutare chi segue una terapia farmaceutica a tenerla sotto controllo, annotarla e gestirla con semplicità.

L'obiettivo è offrire uno strumento chiaro e affidabile per creare **piani terapeutici personali**, senza appesantire l'utente con passaggi complessi o dati da digitare a mano.

I dati di profilo, terapia e diario restano **sul telefono**. Il cloud serve solo a risolvere il **codice AIC** della confezione (nome, composizione, quantità in confezione).

## Perché PillApp

Seguire una terapia significa ricordare orari, dosaggi, giorni della settimana e monitorare quando un farmaco sta per finire. PillApp centralizza tutto in un unico posto, con un'interfaccia studiata per essere **facile e intuitiva anche per utenti fragili**, grazie a un'attenzione particolare al design UI/UX e all'accessibilità.

## Funzionalità principali

### Piani terapeutici personali

Crea e gestisci i tuoi piani di cura: imposta orari, giorni e dosaggio per ogni farmaco. L'app ti accompagna nella configurazione passo dopo passo, senza registrazione: il profilo è un ospite locale.

### Calendario integrato

Visualizza la terapia nel tempo con un calendario settimanale in Home, allineato agli impegni già presenti nel calendario del telefono.

### Promemoria e notifiche

Ricevi notifiche all'orario di assunzione (con anticipo configurabile). Su Android i reminder usano allarmi esatti, così l'avviso non viene raggruppato dal sistema.

### Controllo scorte

Tieni sotto controllo quando un farmaco sta per finire, indipendentemente dalla forma: **pillole**, **gocce/forma liquida** o **bustine**. La quantità in confezione si imposta in fase di inserimento (anche da scansione) e si aggiorna a mano dalla scheda del farmaco.

### Scansione intelligente della confezione

Il cuore dell'esperienza è un sistema di inserimento rapido basato su **ML Kit** e **OCR on-device**:

1. Scatta una foto alla scatola del farmaco (o seleziona un'immagine dalla galleria).
2. L'app legge automaticamente il **codice AIC** stampato sulla confezione.
3. Interroga il catalogo (Supabase, API backend o catalogo locale di fallback) per recuperare nome, composizione chimica, quantità e altre informazioni utili.
4. Compila la scheda del farmaco in automatico.

A te resta solo impostare **orario**, **giorni** e **dosaggio**. Niente digitazione manuale di codici o nomi complessi. In alternativa puoi inserire il farmaco a mano.

### Diario e export PDF

Annota misurazioni (pressione, glicemia, peso, saturazione), sintomi, umore e note. Quando serve, condividi un PDF del diario.

### Accessibilità

Testo più grande, contrasto alto, tap facilitato, feedback tattile e sintesi vocale in italiano, pensati per chi ha bisogno di un'interfaccia più chiara.

### Widget Android

Il widget **Terapia di oggi** mostra la prossima dose e l'andamento della giornata senza aprire l'app.

## Stack tecnico

- **Expo SDK 54** · **React Native** · **TypeScript**
- **expo-router** per la navigazione a tab
- **Tamagui** per UI e design system
- **AsyncStorage** per profilo, terapia e diario (locale-first)
- **expo-mlkit-ocr** per il riconoscimento del testo sulla confezione
- **expo-notifications** per i promemoria terapia (allarmi esatti su Android)
- **expo-calendar** per la settimana in Home
- **Supabase** e/o API REST per l'anagrafe AIC; catalogo JSON locale se il server non è raggiungibile
- **react-native-android-widget** per il widget terapia

OCR, notifiche native e widget richiedono una **build con dev client**, non Expo Go.

## Avvio rapido

1. Installa le dipendenze:

```bash
npm install
```

2. Avvia il Metro bundler:

```bash
npx expo start --dev-client
```

3. Su Android, installa e avvia il dev client (prima build più lunga):

```bash
npm run android
```

Per il telefono collegato via USB, la procedura completa è in `docs/avvio-telefono-usb.md`.

Variabili d'ambiente (opzionali): copia `.env.example` in `.env`. Senza `EXPO_PUBLIC_API_URL` l'app usa il backend di default; Supabase si attiva solo se URL e chiave anon sono valorizzati.

## Struttura del progetto

| Percorso | Descrizione |
|---|---|
| `app/` | Route Expo Router (tab Home, Farmaci, Scansione, Diario, Profilo) |
| `features/` | Schermate di dominio e store (`AppDataProvider`) |
| `lib/ocr/` | Preprocessing immagine, OCR e estrazione codice AIC |
| `lib/farmaci/` | Lookup AIC (Supabase, API, catalogo locale) e scansione |
| `lib/notifications/` | Promemoria terapia e allarmi esatti |
| `lib/app-data/` | Hydrate, persistenza e generazione dosi del giorno |
| `components/home/home-week-calendar.tsx` | Calendario settimanale in Home |
| `components/onboarding-flow.tsx` | Onboarding, privacy e permessi |
| `types/domain.ts` | Tipi di dominio (farmaco, dose, diario, profilo) |
| `widgets/` | Widget Android «Terapia di oggi» |

## Documentazione aggiuntiva

- Avvio su telefono Android via USB: `docs/avvio-telefono-usb.md`
- Backend, Supabase, cache AIC e go-live: `docs/guida-produzione-supabase-render.md`

## Diritti d'autore e licenza

**Copyright © 2026 Filippo Dimita. Tutti i diritti riservati.**

Titolare: **Filippo Dimita** — [f.dimita1989@gmail.com](mailto:f.dimita1989@gmail.com)

Questo progetto — inclusi codice sorgente, design, interfacce, documentazione, logica applicativa e l'idea concettuale di PillApp — è di **esclusiva proprietà del titolare**. I diritti appartengono unicamente a me; non sono concessi a terzi.

È **vietato** copiare, riprodurre, modificare, distribuire, pubblicare o utilizzare questo progetto o parti di esso — in qualsiasi forma — senza la mia **autorizzazione scritta espressa**.

Progetto privato e non open source. I termini completi sono nel file [LICENSE](./LICENSE).
