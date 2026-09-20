# Installazione

La card ha due parti: il **file JavaScript** (la card vera e propria) e il **package** (contatori, costi, notifiche e menu delle barre). Il package è consigliato: senza, dovresti creare a mano tutti i sensori che la card legge.

## 1. Il file della card

### Con HACS (consigliato)

1. HACS → menu ⋮ → **Repository personalizzati**.
2. Indirizzo: `https://github.com/Simonz82/controllo_energia_casa` · Categoria: **Dashboard**.
3. Scarica **Controllo Energia Casa**.
4. HACS aggiunge da solo la risorsa. Se non compare, aggiungila a mano: *Impostazioni → Dashboard → ⋮ → Risorse → Aggiungi*
   - URL: `/hacsfiles/controllo_energia_casa/controllo-energia-casa.js`
   - Tipo: **Modulo JavaScript**

### A mano

1. Copia `controllo-energia-casa.js` in `/config/www/`.
2. *Impostazioni → Dashboard → ⋮ → Risorse → Aggiungi*
   - URL: `/local/controllo-energia-casa.js`
   - Tipo: **Modulo JavaScript**

> Dopo aver aggiunto o aggiornato il file, ricarica la pagina con **Ctrl+F5** (o riapri l'app). Se aggiorni il file in seguito, cambia il numero in fondo all'URL della risorsa (`...js?v=2`) per obbligare il browser a scaricarlo di nuovo.

## 2. Il package

1. Copia [`packages/controllo_energia_casa.yaml`](../packages/controllo_energia_casa.yaml) in `/config/packages/`.
2. Se non usi già i package, aggiungi in `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

3. **Adatta le 4 cose** indicate in testa al file:

| Cosa | Dove nel file | Cosa metterci |
|---|---|---|
| Sensore di potenza totale | `Sensore Consumo Generale W: &power ...` | Il tuo sensore in watt, per esempio `{{ states('sensor.il_tuo_contatore_w') }}` |
| Speaker Alexa | `Media Player Alexa 1/2` | I tuoi `media_player.*` (o togli il ramo Alexa dall'automazione) |
| Telefoni | `notify.mobile_app_il_tuo_telefono` e `..._del_partner` | I nomi dei tuoi servizi `notify.mobile_app_*` |
| Telegram | `chat_id: 111111111 / 222222222` | I tuoi ID chat Telegram (o togli il ramo Telegram). Con più di un bot aggiungi anche `config_entry_id` |

4. *Strumenti per sviluppatori → Controlla configurazione*, poi **riavvia Home Assistant**.

### Cosa crea il package

| Tipo | Entità |
|---|---|
| Potenza | `sensor.sensore_potenza_casa_w`, `sensor.w_kwh_casa` (energia) |
| Contatori | `sensor.energia_ogni_ora_casa`, `energia_oggi_casa`, `energia_settimana_casa`, `energia_mese_casa`, `energia_bimestre_casa`, `energia_anno_casa` (`utility_meter`) |
| Costi | 12 sensori `sensor.costo_consumo_*_casa` (periodo corrente e precedente) |
| Media | `sensor.media_settimanale_kwh_consumati` e i 7 `input_number.kwh_consumati_<giorno>` |
| Soglia | `input_number.soglia_lavoro_casa_w`, `input_number.ritardo_superamento_soglia` |
| Fascia oraria | `input_datetime.orario_inizio/fine_notifiche_soglia_elettrica_casa` |
| Interruttori notifiche | `input_boolean.notify_push_soglia`, `notify_alexa_soglia`, `notify_telegram_soglia`, `notify_push_costi_giornalieri/mensili/annuali` |
| Costo | `input_number.costo_energia_casa` (€/kWh) |
| Reset | `script.reset_sensori_energia` |
| Barre | `input_number.scala_barra_1…4`, `input_text.barra_1…4_entita`, `input_select.barra_1…4_scelta` |
| Top consumo | `sensor.top_consumo_elettrico` |
| Automazioni | *Automazioni Energia*, *Energia barre: aggiorna elenco entita*, *Energia barre: salva scelta* |

## 3. Le prime impostazioni

Dopo il riavvio i valori partono da zero: imposta questi una volta sola (da *Strumenti per sviluppatori → Stati*, dalla card o dalla pagina dei Helper):

- `input_number.costo_energia_casa`: il costo di un kWh (per esempio `0.30`).
- `input_number.soglia_lavoro_casa_w`: la soglia di allarme in watt, di solito poco sotto la potenza del tuo contatore.
- `input_number.ritardo_superamento_soglia`: da quanti secondi la soglia deve restare superata prima dell'avviso (minimo 10).
- `input_number.scala_barra_1…4`: il valore massimo di ogni barra, per esempio la potenza del contatore.
- Gli interruttori `input_boolean.notify_*_soglia` accesi solo per i canali che vuoi usare.
- Le 4 barre: scegli l'entità da misurare, vedi [Barre e scale](barre-e-scale.md).

## 4. Aggiungi la card

Dalla dashboard: *Modifica → Aggiungi scheda → Manuale* e incolla l'esempio della pagina [Configurazione](configurazione.md).

Se qualcosa non compare, controlla la console del browser (F12): un nome sbagliato in `power_entity` è l'errore più comune.
