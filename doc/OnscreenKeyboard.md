---
title: OnscreenKeyboard
description: OnscreenKeyboard Reference
---

# OnscreenKeyboard

## OnscreenKeyboard Class {#module:@toptensoftware/cantabile-js.OnscreenKeyboard}


Provides access to controllers managed by Cantabile's on-screen keyboard device

Access this object via the {{#crossLink "Cantabile/onscreenKeyboard:property"}}{{/crossLink}} property.



```ts
class OnscreenKeyboard extends EndPoint {
    queryController(channel: number, kind: MidiControllerKind, controller: number): Promise<number>;
    watch(channel: number, kind: MidiControllerKind, controller: number, callback?: ControllerWatcherCallback): ControllerWatcher;
    injectMidi(data: object): void;
}
```

### injectMidi() {#module:@toptensoftware/cantabile-js.OnscreenKeyboard#injectMidi}


Inject MIDI from the on-screen keyboard device



```ts
injectMidi(data: object): void;
```

* **`data`** An array of bytes or a MidiControllerEvent


### queryController() {#module:@toptensoftware/cantabile-js.OnscreenKeyboard#queryController}


Queries the on-screen keyboard for the current value of a controller



```ts
queryController(channel: number, kind: MidiControllerKind, controller: number): Promise<number>;
```

* **`channel`** The MIDI channel number of the controller

* **`kind`** The MIDI controller kind

* **`controller`** The number of the controller

### watch() {#module:@toptensoftware/cantabile-js.OnscreenKeyboard#watch}


Starts watching a controller for changes



```ts
watch(channel: number, kind: MidiControllerKind, controller: number, callback?: ControllerWatcherCallback): ControllerWatcher;
```

* **`channel`** The MIDI channel number of the controller

* **`kind`** The MIDI controller kind

* **`controller`** The number of the controller

* **`callback`** Optional callback function to be called when the controller value changes.

