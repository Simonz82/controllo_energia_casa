# Notifiche e soglia

Tutta la logica è nell'automazione **Automazioni Energia** del [package](../packages/controllo_energia_casa.yaml). La card ti fa solo da pannello di controllo.

## Soglia di allarme

Due valori, che imposti nelle Impostazioni:

| Valore | Entità | Significato |
|---|---|---|
| **Soglia Alert** | `input_number.soglia_lavoro_casa_w` | La potenza in watt oltre la quale scatta l'allarme |
| **Ritardo Innesco** | `input_number.ritardo_superamento_soglia` | Da quanti secondi la soglia deve restare superata (minimo 10). Evita allarmi per un picco di un istante |

Quando la potenza resta sopra la soglia per il tempo del ritardo, succedono due cose:

1. la card mostra l'avviso **⚠ Soglia superata** con la potenza e il limite (serve `soglia_entity` nella configurazione);
2. parte la notifica su tutti i canali attivi.

## I tre canali, uno per uno

Nella riga **Alert** delle Impostazioni ci sono tre interruttori indipendenti:

| Interruttore | Entità | Cosa succede quando è acceso |
|---|---|---|
| **PUSH** | `input_boolean.notify_push_soglia` | Notifica sui telefoni (app Companion) |
| **ALEXA** | `input_boolean.notify_alexa_soglia` | Avviso vocale sugli speaker, solo dentro la **fascia oraria** (vedi sotto). Ripete fino a 50 volte, ogni 10 secondi, finché la potenza resta sopra la soglia |
| **TELEGRAM** | `input_boolean.notify_telegram_soglia` | Messaggio Telegram. **Se lo spegni, nessun messaggio Telegram parte** per la soglia |

Sono separati: puoi tenere solo Telegram e spegnere Push e Alexa, o qualsiasi altra combinazione.

### Fascia oraria (solo Alexa)

`input_datetime.orario_inizio_notifiche_soglia_elettrica_casa` e `..._fine_...`: l'avviso vocale parte solo dentro questa fascia, così di notte gli speaker restano muti. Push e Telegram non hanno una fascia oraria.

## Notifiche di consumo (Info Consumi)

Ogni sera, a **23:59:59**, l'automazione può inviare il riepilogo dei consumi e del costo:

| Interruttore | Entità | Quando |
|---|---|---|
| **GIORNALIERI** | `input_boolean.notify_push_costi_giornalieri` | Ogni sera |
| **MENSILI** | `input_boolean.notify_push_costi_mensili` | L'ultima sera del mese |
| **ANNUALI** | `input_boolean.notify_push_costi_annuali` | Il 31 dicembre |

Ogni riepilogo va sui telefoni **e** su Telegram: per questi messaggi Telegram dipende dallo stesso interruttore del riepilogo (non da quello della soglia).

## I kWh dei giorni della settimana

Alle **23:59:58** l'automazione salva in `input_number.kwh_consumati_<giorno>` i kWh consumati oggi. Sono i valori che la card mostra negli *Ultimi 7 giorni* e da cui calcola la media settimanale.

## Azzerare i contatori

Il pulsante **Reset Contatori** (nelle Impostazioni) lancia `script.reset_sensori_energia`, che riporta a zero tutti i contatori di energia (ora, giorno, settimana, mese, bimestre, anno). Non è reversibile: la card chiede una conferma.

## Adattare il package

Cerca nel file `packages/controllo_energia_casa.yaml`:

- `notify.mobile_app_il_tuo_telefono` e `notify.mobile_app_del_partner`: i nomi dei tuoi servizi di notifica (li trovi in *Strumenti per sviluppatori → Azioni*, cerca `notify.mobile_app`);
- `chat_id: 111111111` e `222222222`: i tuoi ID chat Telegram. Se hai più di un bot Telegram aggiungi anche `config_entry_id: ...` alle azioni `telegram_bot.send_message`;
- `media_player.il_tuo_echo_1` e `_2`: i tuoi speaker Alexa.

Se un canale non ti serve, togli il suo ramo dall'automazione oppure tieni il suo interruttore spento.
