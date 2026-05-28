# Guida Produzione - Supabase + Render

Questa guida raccoglie i passaggi pratici per portare in produzione un backend API su Render con database su Supabase, ottimizzando latenza e affidabilita.

## 1) Architettura consigliata

- Client (app mobile/web) -> Backend API (Render) -> Supabase (Postgres)
- Evita chiamate dirette dal client al DB per la logica business.
- Usa il backend come unico punto per validazione, cache, rate limit e logging.

## 2) Regione e latenza

Il miglioramento piu importante:

- Metti Render e Supabase nella stessa regione.
- Verifica la latenza backend -> DB (target: la piu bassa possibile).
- Se oggi sono in region diverse, pianifica la migrazione prima del go-live.

## 3) Ottimizzazioni DB (endpoint per AIC)

Se il lookup principale e per codice AIC, crea un indice.

```sql
create index if not exists idx_farmaci_codice_aic
on public.farmaci (codice_aic);
```

Se AIC e univoco:

```sql
create unique index if not exists ux_farmaci_codice_aic
on public.farmaci (codice_aic);
```

Note:

- Evita query non indicizzate su endpoint ad alta frequenza.
- Se usi filtri testuali aggiuntivi, crea indici dedicati separati.

## 4) Query backend

- Evita `SELECT *` nei path caldi.
- Seleziona solo i campi necessari alla UI.
- Usa query parametrizzate.
- Normalizza AIC (con/senza zero iniziale) in un solo punto del backend.

## 5) Pooling connessioni

- Usa il pooling supportato da Supabase.
- Configura il pool lato backend in modo conservativo.
- Evita di aprire/chiudere connessioni in modo inefficiente per ogni richiesta.

## 6) Cache backend (alto impatto)

Per `GET /farmaci/{aic}`:

- Usa cache in-memory o Redis.
- TTL consigliato: 5-30 minuti (in base alla frequenza aggiornamenti).
- Chiave suggerita: `farmaco:{aic_normalizzato}`.

Flusso:

1. Cerca in cache.
2. Se miss, interroga il DB.
3. Salva in cache e rispondi.

## 7) Render: prevenire cold start

- Preferisci piani/config che non mettano il servizio in sleep.
- Espone un endpoint leggero di health check (`/healthz`).
- Se necessario, applica warm-up periodico.

## 8) API e payload

- Risposte JSON snelle.
- Invia solo i campi necessari.
- Abilita compressione (`gzip`/`br`) se disponibile.
- Mantieni schema risposta stabile (versiona API quando cambia).

## 9) Sicurezza

- Segreti solo in env vars (mai hardcoded).
- Chiavi Supabase gestite lato server.
- Rate limiting sugli endpoint pubblici.
- Log senza dati sensibili in chiaro.

## 10) Osservabilita minima

Monitora almeno:

- p50/p95/p99 latenza endpoint
- tempo query DB
- cache hit ratio
- tasso errori 4xx/5xx
- timeout rate

Usa un request id per correlare log applicativi e query.

## 11) Checklist pre go-live

- [ ] Render e Supabase nella stessa regione
- [ ] Indice AIC presente e verificato
- [ ] Endpoint AIC con cache attiva
- [ ] Query ottimizzate (no `SELECT *` nei path critici)
- [ ] Variabili ambiente corrette (prod/staging)
- [ ] Health check e alert attivi
- [ ] Test di carico base eseguiti
- [ ] Piano rollback definito

## 12) Verifica rapida post deploy

- Test da rete reale (Wi-Fi + rete mobile)
- Confronto latenza warm vs cold
- Verifica stabilita OCR -> API -> risposta form
- Controllo errori intermittenti e timeout

---

Se usi .NET per il backend, consigliato come step successivo:

- aggiungere cache su endpoint `GET /farmaci/{aic}`
- introdurre tracing e metriche per ogni request
- profilare query lente in produzione
