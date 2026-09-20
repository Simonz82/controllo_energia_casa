# Configurazione della card

La card si chiama `custom:controllo-energia-casa-card`. L'unico parametro obbligatorio è `power_entity`.

## Esempio completo

Questo esempio usa i nomi creati dal [package](../packages/controllo_energia_casa.yaml). Adatta solo i circuiti (`circuits`), che dipendono dai tuoi sensori.

```yaml
type: custom:controllo-energia-casa-card
name: Energia Casa
power_entity: sensor.sensore_potenza_casa_w
max_power: 5500                                   # scala del grafico delle 24 ore
top_entity: sensor.top_consumo_elettrico          # opzionale
soglia_entity: input_number.soglia_lavoro_casa_w  # opzionale: mostra l'avviso sulla card
media_entity: sensor.media_settimanale_kwh_consumati
# notif_center_path: /lovelace/notifiche          # opzionale: compare il pulsante megafono

periods:
  - { label: Ogni ora,  energy: sensor.energia_ogni_ora_casa,  cost: sensor.costo_consumo_ogni_ora_casa }
  - { label: Oggi,      energy: sensor.energia_oggi_casa,      cost: sensor.costo_consumo_giornaliero_casa }
  - { label: Settimana, energy: sensor.energia_settimana_casa, cost: sensor.costo_consumo_settimana_casa }
  - { label: Mese,      energy: sensor.energia_mese_casa,      cost: sensor.costo_consumo_mensile_casa }
  - { label: Bimestre,  energy: sensor.energia_bimestre_casa,  cost: sensor.costo_consumo_bimestre_casa }
  - { label: Anno,      energy: sensor.energia_anno_casa,      cost: sensor.costo_consumo_annuale_casa }

periods_prev:
  - { label: Ora precedente,       energy: sensor.energia_ogni_ora_casa,  energy_attr: last_period, cost: sensor.costo_consumo_ora_precedente_casa }
  - { label: Ieri,                 energy: sensor.energia_oggi_casa,      energy_attr: last_period, cost: sensor.costo_consumo_ieri_casa }
  - { label: Settimana precedente, energy: sensor.energia_settimana_casa, energy_attr: last_period, cost: sensor.costo_consumo_settimana_precedente_casa }
  - { label: Mese precedente,      energy: sensor.energia_mese_casa,      energy_attr: last_period, cost: sensor.costo_consumo_mese_precedente_casa }
  - { label: Bimestre precedente,  energy: sensor.energia_bimestre_casa,  energy_attr: last_period, cost: sensor.costo_consumo_bimestre_precedente_casa }
  - { label: Anno precedente,      energy: sensor.energia_anno_casa,      energy_attr: last_period, cost: sensor.costo_consumo_anno_precedente_casa }

weekdays:
  Lunedì: input_number.kwh_consumati_lunedi
  Martedì: input_number.kwh_consumati_martedi
  Mercoledì: input_number.kwh_consumati_mercoledi
  Giovedì: input_number.kwh_consumati_giovedi
  Venerdì: input_number.kwh_consumati_venerdi
  Sabato: input_number.kwh_consumati_sabato
  Domenica: input_number.kwh_consumati_domenica

circuits:
  # Le prime 4 voci diventano le barre sul fronte della card (vedi "Barre e scale").
  - label: Barra 1
    entity_helper: input_text.barra_1_entita       # l'entità la scegli dal menu nelle Impostazioni
    max_entity: input_number.scala_barra_1         # la scala la imposti nelle Impostazioni
  - label: Barra 2
    entity_helper: input_text.barra_2_entita
    max_entity: input_number.scala_barra_2
  - label: Barra 3
    entity_helper: input_text.barra_3_entita
    max_entity: input_number.scala_barra_3
  - label: Barra 4
    entity_helper: input_text.barra_4_entita
    max_entity: input_number.scala_barra_4
  # Dalla quinta in poi compaiono solo nel popup Circuiti, ordinate per consumo.
  - { label: Lavatrice,     entity: sensor.lavatrice_power }
  - { label: Lavastoviglie, entity: sensor.lavastoviglie_power }
  - { label: Forno,         entity: sensor.forno_power }

switches:                                          # interruttori mostrati nelle Impostazioni
  - { label: Presa Computer, entity: switch.presa_computer }

actions:
  - label: Reset Contatori
    entity: script.reset_sensori_energia
    confirm: "Vuoi azzerare tutti i contatori di consumo energia? L'operazione non è reversibile."

settings_sections:                                 # righe del popup Impostazioni "nativo"
  - title: Notifiche Soglia
    rows:
      - { entity: input_boolean.notify_push_soglia,     label: Push }
      - { entity: input_boolean.notify_alexa_soglia,    label: Alexa }
      - { entity: input_boolean.notify_telegram_soglia, label: Telegram }
      - { entity: input_number.soglia_lavoro_casa_w,    label: Soglia W }
      - { entity: input_number.ritardo_superamento_soglia, label: Ritardo (s) }
```

## Parametri

### Principali

| Parametro | Obbligatorio | Descrizione |
|---|---|---|
| `power_entity` | sì | Sensore della potenza totale in watt. Compare sul display e alimenta il grafico e l'avviso di soglia |
| `name` | no | Titolo della card (predefinito: *Energia Casa*) |
| `max_power` | no | Valore massimo dell'asse del grafico delle ultime 24 ore (predefinito 4500) |
| `top_entity` | no | Sensore di testo con il dispositivo che consuma di più (nel package: `sensor.top_consumo_elettrico`) |
| `soglia_entity` | no | `input_number` con la soglia in watt: se la potenza la supera, la card mostra l'avviso *Soglia superata* |
| `media_entity` | no | Media settimanale dei kWh, mostrata in coda agli ultimi 7 giorni |
| `notif_center_path` | no | Percorso di una tua vista (per esempio `/lovelace/notifiche`). Se lo imposti compare il pulsante megafono che ci porta. Senza, il pulsante non compare |

### Periodi e giorni

| Parametro | Descrizione |
|---|---|
| `periods` | Lista di `{label, energy, cost}`: il consumo in kWh e il costo del periodo corrente |
| `periods_prev` | Come `periods`, per il periodo precedente. `energy_attr: last_period` legge l'attributo `last_period` dei contatori `utility_meter` |
| `weekdays` | I kWh consumati in ognuno degli ultimi 7 giorni (sono compilati ogni sera dall'automazione del package) |

### Circuiti

`circuits` è una lista di `{label, entity, ...}`.

- Le **prime 4 voci** sono le barre sul fronte della card.
- **Tutte** le voci compaiono nel popup **Circuiti**, ordinate per consumo in tempo reale.

| Campo | Descrizione |
|---|---|
| `label` | Nome mostrato nel popup Circuiti (e sulla barra, se l'entità è fissa) |
| `entity` | Sensore di potenza (W) da misurare |
| `entity_helper` | Sostituisce `entity` per la barra: un `input_text` che contiene l'entità scelta dal menu. Vuoto = barra nascosta. Il nome della barra segue il nome dell'entità |
| `max` | Scala fissa della barra in watt (100% = questo valore) |
| `max_entity` | Sostituisce `max`: un `input_number` modificabile dalle Impostazioni |

Una barra compare **solo se** ha un'entità (`entity` oppure un `entity_helper` con qualcosa dentro) **e** una scala (`max` oppure `max_entity` valido). Dettagli in [Barre e scale](barre-e-scale.md).

### Impostazioni

| Parametro | Descrizione |
|---|---|
| `settings_sections` | Sezioni del popup Impostazioni nativo: `{title, rows: [{entity, label}]}`. Le entità `input_boolean`, `switch` e `automation` diventano interruttori; le altre mostrano il valore e, toccandole, aprono la finestra dell'entità |
| `switches` | Elenco `{label, entity}` mostrato come sezione *Interruttori* |
| `actions` | Pulsanti `{label, entity, confirm}`. `entity` è uno `script.*`; in alternativa `service: dominio.servizio`. `confirm` è il testo della richiesta di conferma |
| `legacy_settings_popup` | Apre invece un popup `browser_mod` a tua scelta. Vedi [Impostazioni](impostazioni.md) |
