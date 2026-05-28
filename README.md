# PillApp

PillApp e un'app mobile sviluppata con Expo e React Native che aiuta a identificare i farmaci a partire dalla confezione.

## Funzione principale

- Scansione OCR della scatola del farmaco (camera o galleria).
- Estrazione automatica del codice AIC.
- Recupero dei dati del farmaco tramite backend/Supabase.
- Visualizzazione dei dati in formato form direttamente nella home.

## Avvio rapido

1. Installa le dipendenze:

```bash
npm install
```

2. Avvia il progetto:

```bash
npx expo start
```

## Note utili

- Il flusso principale e in `app/(tabs)/index.tsx`.
- Per ambiente produzione e ottimizzazioni, consulta `docs/guida-produzione-supabase-render.md`.
