# Impostazioni

L'**ingranaggio** in alto sulla card apre le impostazioni. Ci sono due modi.

## 1. Popup nativo (predefinito)

Se non imposti `legacy_settings_popup`, la card apre il suo popup, con lo stesso stile degli altri (titoli in grassetto, righe a scheda). Il contenuto lo decidi con tre parametri:

- `settings_sections`: sezioni con righe `{entity, label}`;
- `switches`: interruttori (prese, ecc.);
- `actions`: pulsanti come il reset dei contatori.

Le entità `input_boolean`, `switch` e `automation` diventano interruttori, le `input_select` diventano un vero menu a tendina. Le altre (per esempio un `input_number`) mostrano il valore: toccandole si apre la finestra dell'entità per modificarla.

```yaml
settings_sections:
  - title: Aspetto
    rows:
      - { entity: input_select.layout_energia, label: Layout }   # la scelta del layout, per prima
  - title: Notifiche Soglia
    rows:
      - { entity: input_boolean.notify_push_soglia,        label: Push }
      - { entity: input_boolean.notify_alexa_soglia,       label: Alexa }
      - { entity: input_boolean.notify_telegram_soglia,    label: Telegram }
      - { entity: input_number.soglia_lavoro_casa_w,       label: Soglia W }
      - { entity: input_number.ritardo_superamento_soglia, label: Ritardo (s) }
  - title: Costi
    rows:
      - { entity: input_number.costo_energia_casa, label: Costo energia (€/kWh) }
  - title: Barre
    rows:
      - { entity: input_select.barra_1_scelta, label: Barra 1 }
      - { entity: input_number.scala_barra_1,  label: Scala Barra 1 }
      - { entity: input_select.barra_2_scelta, label: Barra 2 }
      - { entity: input_number.scala_barra_2,  label: Scala Barra 2 }
      - { entity: input_select.barra_3_scelta, label: Barra 3 }
      - { entity: input_number.scala_barra_3,  label: Scala Barra 3 }
      - { entity: input_select.barra_4_scelta, label: Barra 4 }
      - { entity: input_number.scala_barra_4,  label: Scala Barra 4 }
```

## 2. Popup con `browser_mod` (come nelle schermate)

Le schermate di questa guida usano un popup `browser_mod`, con i menu a tendina delle barre direttamente nelle righe. È più ricco ma richiede tre componenti in più:

- [`browser_mod`](https://github.com/thomasloven/hass-browser_mod)
- [`multiple-entity-row`](https://github.com/benct/lovelace-multiple-entity-row)
- [`card-mod`](https://github.com/thomasloven/lovelace-card-mod) (solo per il grassetto dei titoli)

Si attiva con `legacy_settings_popup` nella configurazione della card:

```yaml
legacy_settings_popup:
  service: browser_mod.popup
  data:
    title: Impostazioni
    style: |
      --popup-background-color: var(--secondary-background-color);
      --dialog-backdrop-filter: blur(2em) brightness(0.75);
    content:
      type: entities
      entities:
        - type: divider
        - { entity: input_select.layout_energia, name: Layout, icon: mdi:view-dashboard-outline }   # il layout, per primo
        - type: divider
        - type: custom:multiple-entity-row
          entity: input_datetime.orario_fine_notifiche_soglia_elettrica_casa
          icon: mdi:timer
          name: Fascia Oraria Notifiche
          state_header: FINE
          entities:
            - { entity: input_datetime.orario_inizio_notifiche_soglia_elettrica_casa, name: INIZIO }
        - type: divider
        - type: custom:multiple-entity-row
          entity: input_boolean.notify_push_soglia
          icon: mdi:message-flash
          name: Alert
          toggle: true
          state_header: PUSH
          entities:
            - { entity: input_boolean.notify_alexa_soglia,    name: ALEXA,    toggle: true }
            - { entity: input_boolean.notify_telegram_soglia, name: TELEGRAM, toggle: true }
        - type: divider
        - type: custom:multiple-entity-row
          entity: input_number.soglia_lavoro_casa_w
          icon: mdi:flash
          name: Soglia Alert
          toggle: false
          state_header: SOGLIA
        - type: divider
        - type: custom:multiple-entity-row
          entity: input_number.ritardo_superamento_soglia
          icon: mdi:timelapse
          name: Ritardo Innesco
          toggle: false
          state_header: SUPERAMENTO SOGLIA
        - type: divider
        - type: custom:multiple-entity-row
          entity: input_boolean.notify_push_costi_annuali
          icon: mdi:counter
          name: Info Consumi
          toggle: true
          state_header: ANNUALI
          entities:
            - { entity: input_boolean.notify_push_costi_giornalieri, name: GIORNALIERI, toggle: true }
            - { entity: input_boolean.notify_push_costi_mensili,     name: MENSILI,     toggle: true }
        - type: divider
        - entity: input_number.costo_energia_casa
          name: Costo Energia
        - type: divider
        # Una coppia per ogni barra: il menu a tendina e la scala
        - { entity: input_select.barra_1_scelta, name: Barra 1, icon: mdi:gauge }
        - { type: custom:multiple-entity-row, entity: input_number.scala_barra_1, icon: mdi:ruler, name: Scala Barra 1, toggle: false, state_header: MAX W }
        - type: divider
        - { entity: input_select.barra_2_scelta, name: Barra 2, icon: mdi:gauge }
        - { type: custom:multiple-entity-row, entity: input_number.scala_barra_2, icon: mdi:ruler, name: Scala Barra 2, toggle: false, state_header: MAX W }
        - type: divider
        - { entity: input_select.barra_3_scelta, name: Barra 3, icon: mdi:gauge }
        - { type: custom:multiple-entity-row, entity: input_number.scala_barra_3, icon: mdi:ruler, name: Scala Barra 3, toggle: false, state_header: MAX W }
        - type: divider
        - { entity: input_select.barra_4_scelta, name: Barra 4, icon: mdi:gauge }
        - { type: custom:multiple-entity-row, entity: input_number.scala_barra_4, icon: mdi:ruler, name: Scala Barra 4, toggle: false, state_header: MAX W }
        - type: divider
        - type: button
          action_name: RESET
          name: Reset Contatori
          icon: mdi:restart
          tap_action:
            action: call-service
            service: script.turn_on
            target: { entity_id: script.reset_sensori_energia }
        - type: divider
      card_mod:
        style:
          # tutti i testi a sinistra in grassetto, come nel popup Circuiti
          .: |
            ha-card { font-weight: 750 !important; }
          hui-generic-entity-row $: |
            .info, .info * { font-size: 14.5px !important; font-weight: 750 !important; }
          multiple-entity-row $: |
            hui-generic-entity-row { font-size: 14.5px !important; font-weight: 750 !important; }
            .entities-row { font-size: 14px !important; font-weight: 400 !important; }
          hui-input-number-entity-row $: |
            hui-generic-entity-row { font-size: 14.5px !important; font-weight: 750 !important; }
            ha-textfield, ha-slider, input { font-weight: 400 !important; }
          hui-select-entity-row $: |
            hui-generic-entity-row { font-size: 14.5px !important; font-weight: 750 !important; }
            ha-select, ha-select * { font-weight: 400 !important; font-size: 14px !important; }
          hui-button-row $: |
            hui-generic-entity-row { font-size: 14.5px !important; font-weight: 750 !important; }
            mwc-button, ha-button, ha-button * { --mdc-typography-button-font-weight: 750; font-weight: 750 !important; }
```

> **Un dettaglio su `card-mod`**: una regola con un solo `$` (per esempio `multiple-entity-row $`) applica lo stile a **tutte** le righe di quel tipo. Una catena come `multiple-entity-row $ hui-generic-entity-row $` arriva invece solo alla **prima** riga: per questo lo stile qui sopra usa regole a un livello solo.

Quando togli una riga da `entities`, ricordati di togliere anche il suo `- type: divider`: i separatori sono voci a parte e, se restano, formano una fila di linee inutili.
