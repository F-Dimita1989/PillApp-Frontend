# PillApp

PillApp è un'app mobile sviluppata con **Expo** e **React Native** pensata per aiutare chi segue una terapia farmaceutica a tenerla sotto controllo, annotarla e gestirla con semplicità.

L'obiettivo è offrire uno strumento chiaro e affidabile per creare **piani terapeutici personali**, senza appesantire l'utente con passaggi complessi o dati da digitare a mano.

## Perché PillApp

Seguire una terapia significa ricordare orari, dosaggi, giorni della settimana e monitorare quando un farmaco sta per finire. PillApp centralizza tutto in un unico posto, con un'interfaccia studiata per essere **facile e intuitiva anche per utenti fragili**, grazie a un'attenzione particolare al design UI/UX.

## Funzionalità principali

### Piani terapeutici personali

Crea e gestisci i tuoi piani di cura: imposta orari, giorni e dosaggio per ogni farmaco. L'app ti accompagna nella configurazione passo dopo passo.

### Calendario integrato

Visualizza la terapia nel tempo con un calendario integrato che collega assunzioni, promemoria e andamento settimanale.

### Promemoria e notifiche

Ricevi notifiche che ti avvisano quando è il momento di assumere un farmaco, così non devi affidarti solo alla memoria.

### Controllo scorte

Tieni sotto controllo quando un farmaco sta per finire, indipendentemente dalla forma: **pillole**, **gocce/forma liquida** o **bustine**. L'app aggiorna le quantità in base all'uso e ti segnala quando serve un rifornimento.

### Scansione intelligente della confezione

Il cuore dell'esperienza è un sistema di inserimento rapido basato su **ML Kit** e **OCR on-device**:

1. Scatta una foto alla scatola del farmaco (o seleziona un'immagine dalla galleria).
2. L'app legge automaticamente il **codice AIC** stampato sulla confezione.
3. Interroga il database per recuperare nome, composizione chimica, quantità e altre informazioni utili.
4. Compila la scheda del farmaco in automatico.

A te resta solo impostare **orario**, **giorni** e **dosaggio**. Niente digitazione manuale di codici o nomi complessi.

## Stack tecnico

- **Expo SDK 54** · **React Native** · **TypeScript**
- **expo-router** per la navigazione
- **expo-mlkit-ocr** per il riconoscimento del testo sulla confezione
- **expo-notifications** per i promemoria terapia
- **expo-calendar** e calendario integrato per la visualizzazione settimanale
- **Supabase** per il database farmaci e i dati AIC

## Avvio rapido

1. Installa le dipendenze:

```bash
npm install
```

2. Avvia il progetto:

```bash
npx expo start
```

Per Android con dev client:

```bash
npm run android
```

## Struttura del progetto

| Percorso | Descrizione |
|----------|-------------|
| `app/(tabs)/index.tsx` | Home e flusso principale di gestione terapia |
| `lib/ocr/` | Preprocessing immagine, OCR e estrazione codice AIC |
| `components/therapy-week-calendar.tsx` | Calendario settimanale della terapia |
| `components/onboarding-screen.tsx` | Onboarding iniziale |
| `lib/therapy/` | Tipi e logica dei piani terapeutici |

## Documentazione aggiuntiva

Per configurazione produzione, backend e ottimizzazioni, consulta `docs/guida-produzione-supabase-render.md`.

## Licenza

Progetto privato.
