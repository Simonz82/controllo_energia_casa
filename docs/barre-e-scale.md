# Barre e scale

Sul fronte della card ci sono **4 barre**. Per ognuna decidi tu:

1. **quale sensore misurare** (un menu a tendina),
2. **qual è il valore massimo** della barra (la scala: quando il consumo arriva lì, la barra è piena).

![Grafico di una barra](screenshot/barra-light.png)

Toccando una barra si apre il grafico delle ultime 6 ore di quel sensore.

## Come si scelgono

Nel popup **Impostazioni** (ingranaggio) ci sono due righe per barra:

| Riga | Cosa è |
|---|---|
| **Barra N** | Menu a tendina con il sensore da misurare |
| **Scala Barra N** | Il valore massimo in watt (100% della barra) |

![Impostazioni](screenshot/impostazioni-light.png)

- Scegli **(nessuna)** nel menu e la barra sparisce dalla card.
- Il nome della barra è quello del sensore scelto, senza la parola *Potenza* o *Power* (per esempio `Generale Potenza` diventa **Generale**).
- La scala la imposti tu, di solito uguale per tutte le barre così si confrontano alla pari (per esempio la potenza del contatore).

## L'elenco del menu

L'elenco viene ricostruito da un'automazione del package e contiene:

- tutti i sensori il cui nome finisce per **`_power`**,
- tutti i sensori con unità **W** o **kW** (anche se non finiscono per `_power`),
- la voce che hai già scelto, **anche se non rientra nei filtri**: la scelta non è mai vincolata al filtro,
- **(nessuna)**.

Si aggiorna da solo all'avvio di Home Assistant (dopo 45 secondi), ogni ora al minuto 5 e quando lo chiedi tu, lanciando l'evento `energia_barre_aggiorna` (da *Strumenti per sviluppatori → Eventi*).

Se il sensore che vuoi non compare, scrivi il suo nome (per esempio `sensor.mio_sensore`) nel campo `input_text.barra_N_entita` da *Strumenti per sviluppatori → Stati → Imposta stato*, oppure da una dashboard con una scheda `entities`. Il menu lo mostrerà alla prossima ricostruzione dell'elenco.

## Quando una barra non compare

Una barra compare **solo se ha sia un'entità sia una scala**:

- nessuna entità scelta (o `(nessuna)`) → barra nascosta;
- entità non disponibile in quel momento → barra nascosta;
- scala non valida e nessun `max` fisso nella configurazione → barra nascosta.

Chi installa la card può quindi usare anche solo 2 o 3 barre: quelle non configurate non lasciano spazi vuoti.

## Perché ci sono due entità per ogni barra

`input_select.barra_N_scelta` è il menu che vedi. `input_text.barra_N_entita` è dove la scelta viene **salvata davvero** e la card legge quella.

Il motivo: un menu (`input_select`) con l'elenco che cambia a runtime perde la selezione a ogni riavvio, perché all'avvio ha solo le opzioni statiche. Un testo, invece, resta. Dopo l'avvio l'automazione ricostruisce l'elenco e rimette nel menu la voce salvata.

Il salvataggio parte **solo se il cambio lo fa una persona** (dall'interfaccia). I cambi fatti dall'automazione che ricostruisce l'elenco non hanno un utente e non cancellano la scelta.

## Barre fisse (senza menu)

Se non ti serve il menu, nella configurazione della card puoi mettere le barre con entità e scala fisse:

```yaml
circuits:
  - { label: Generale, entity: sensor.generale_power, max: 5500 }
  - { label: Forza,    entity: sensor.forza_power,    max: 5500 }
  - { label: Luce,     entity: sensor.luce_power,     max: 5500 }
  - { label: Cantina,  entity: sensor.cantina_power,  max: 5500 }
```

Puoi mescolare le due modalità: `entity`/`max` fissi per alcune barre, `entity_helper`/`max_entity` per le altre.
