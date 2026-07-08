---
title: ControllerWatcher
description: ControllerWatcher Reference
---

# ControllerWatcher

## ControllerWatcher Class {#module:@toptensoftware/cantabile-js.ControllerWatcher}


Represents a monitored controller
Returned from the {{#crossLink "OnscreenKeyboard/watch:method"}}{{/crossLink}} method.



```ts
class ControllerWatcher extends EventEmitter<any> {
    get channel(): number;
    get kind(): MidiControllerKind;
    get controller(): number;
    get value(): number;
    unwatch(): void;
}
```

### channel {#module:@toptensoftware/cantabile-js.ControllerWatcher#channel}


Returns the MIDI channel number of controller being watched



```ts
get channel(): number;
```

### controller {#module:@toptensoftware/cantabile-js.ControllerWatcher#controller}


Returns the number of the controller being watched



```ts
get controller(): number;
```

### kind {#module:@toptensoftware/cantabile-js.ControllerWatcher#kind}


Returns the kind of controller being watched



```ts
get kind(): MidiControllerKind;
```

### unwatch() {#module:@toptensoftware/cantabile-js.ControllerWatcher#unwatch}


Stops monitoring this controller for changes



```ts
unwatch(): void;
```

### value {#module:@toptensoftware/cantabile-js.ControllerWatcher#value}


Returns the current value of the controller



```ts
get value(): number;
```

