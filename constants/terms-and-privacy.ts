export type LegalSection = {
  title: string;
  body: string;
};

export const TERMS_AND_PRIVACY_TITLE =
  "Termini e condizioni di utilizzo e informativa sulla privacy";

export const TERMS_AND_PRIVACY_UPDATED_AT = "25 agosto 2026";

export const TERMS_AND_PRIVACY_INTRO =
  "Il presente documento disciplina l’utilizzo dell’applicazione PillApp e informa l’utente, in modo chiaro e trasparente, sulle modalità di trattamento dei dati. PillApp è concepita come strumento locale: non richiede un account, non raccoglie dati personali su server remoti e non cede informazioni a terzi.";

export const TERMS_AND_PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "1. Oggetto del servizio",
    body: "PillApp è un’applicazione di supporto personale alla gestione della terapia farmacologica, dei promemoria di assunzione e del diario di salute. L’applicazione opera sul dispositivo dell’utente e non costituisce un servizio cloud, un social network né una piattaforma di telemedicina. L’uso è consentito a chi abbia la capacità di agire ovvero, per i minori, sotto la responsabilità di chi esercita la responsabilità genitoriale o tutoria.",
  },
  {
    title: "2. Assenza di registrazione e di raccolta dati",
    body: "PillApp non richiede e-mail, password, profilo social o identificativi di accesso. Non vengono creati account presso il fornitore dell’applicazione. PillApp non raccoglie, non intercetta e non trasmette i dati dell’utente a server propri o di terzi per finalità di profilazione, marketing, analytics commerciali o vendita di informazioni. In assenza di un’infrastruttura di raccolta remota, non sussiste un trasferimento dei dati personali dell’utente verso sistemi esterni all’apparecchio.",
  },
  {
    title: "3. Dove restano le informazioni",
    body: "Le informazioni inserite o generate in PillApp (ad esempio nome scelto in locale, elenco farmaci, orari, quantità, note del diario e stato dei promemoria) sono memorizzate esclusivamente sulla memoria del telefono o del tablet, mediante gli strumenti di archiviazione del dispositivo. Tali informazioni non lasciano l’apparecchio per effetto del normale funzionamento dell’applicazione. La sicurezza materiale dei dati dipende dal dispositivo, dal blocco schermo e dalle copie di sicurezza eventualmente impostate dall’utente nel sistema operativo.",
  },
  {
    title: "4. Permessi del dispositivo",
    body: "Alcune funzioni richiedono permessi del sistema operativo, concessi solo se l’utente li autorizza: fotocamera e galleria per la lettura del codice AIC sulla confezione; notifiche per i promemoria di assunzione; calendario per la visualizzazione della settimana terapeutica. Tali permessi sono utilizzati in locale, per le finalità sopra indicate, e non comportano l’invio dei contenuti (foto, eventi, notifiche) a un server di PillApp. L’utente può revocare i permessi in qualsiasi momento dalle impostazioni del dispositivo; in tal caso alcune funzioni potrebbero non essere disponibili.",
  },
  {
    title: "5. Scansione del codice AIC",
    body: "La scansione del codice AIC avviene sull’apparecchio, al fine di riconoscere il medicinale e agevolare la compilazione della terapia. Le immagini o i fotogrammi impiegati per la lettura restano nel contesto dell’applicazione e non vengono inviati a un archivio remoto di PillApp. L’utente è responsabile della correttezza del farmaco selezionato e della coerenza con la prescrizione medica.",
  },
  {
    title: "6. Natura non medica del servizio",
    body: "PillApp non è un dispositivo medico, non effettua diagnosi, non prescrive terapie e non sostituisce il parere del medico, del farmacista o di altro professionista sanitario. Le informazioni mostrate hanno scopo organizzativo e di supporto alla memoria. L’utente resta l’unico responsabile delle assunzioni, dei dosaggi e di ogni decisione sanitaria. In caso di dubbi, effetti indesiderati o urgenza, occorre rivolgersi a un professionista o ai servizi di emergenza.",
  },
  {
    title: "7. Obblighi dell’utente",
    body: "L’utente si impegna a utilizzare PillApp in modo lecito, a inserire informazioni veritiere per quanto di propria conoscenza e a non impiegare l’applicazione per finalità illecite o in modo da compromettere il funzionamento del dispositivo. PillApp è fornita «nello stato in cui si trova»; per quanto consentito dalla legge, il fornitore non risponde di interruzioni, errori di riconoscimento, mancati promemoria o perdite di dati dovute al dispositivo, al sistema operativo o a cause non imputabili all’applicazione.",
  },
  {
    title: "8. Diritti in materia di privacy",
    body: "Poiché i dati restano sul dispositivo e non sono raccolti dal fornitore, l’utente esercita in concreto il controllo cancellando i contenuti in app, disinstallando PillApp o cancellando i dati dell’applicazione dalle impostazioni del sistema. Non essendo operato un trattamento su server del fornitore, non sussistono banche dati remote da cui estrarre, rettificare o cancellare copie centralizzate. Resta ferma la normativa applicabile, incluso il Regolamento (UE) 2016/679, per ogni eventuale trattamento futuro che venisse introdotto; in tal caso la presente informativa sarebbe aggiornata prima di qualsiasi raccolta.",
  },
  {
    title: "9. Modifiche",
    body: "I presenti termini e l’informativa sulla privacy possono essere aggiornati per adeguamenti normativi o evoluzioni del prodotto. La versione vigente è quella resa disponibile in applicazione, con indicazione della data di aggiornamento. L’uso continuato dopo un aggiornamento sostanziale potrà richiedere una nuova presa visione e accettazione.",
  },
  {
    title: "10. Accettazione",
    body: "Selezionando la casella di accettazione, l’utente dichiara di avere letto e compreso i presenti Termini e condizioni e l’informativa sulla privacy, e di accettarne il contenuto. Senza tale accettazione non è possibile completare la configurazione iniziale di PillApp.",
  },
];
