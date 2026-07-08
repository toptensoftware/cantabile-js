---
title: Transport
description: Transport Reference
---

# Transport

## Transport Class {#module:@toptensoftware/cantabile-js.Transport}


Interface to the master transport

Access this object via the {{#crossLink "Cantabile/transport:property"}}{{/crossLink}} property.



```ts
class Transport extends EndPoint {
    set state(value: TransportState);
    get state(): TransportState;
    get timeSignatureNum(): number;
    get timeSignatureDen(): number;
    get timeSignature(): string;
    get tempo(): number;
    set loopMode(value: TransportLoopMode);
    get loopMode(): TransportLoopMode;
    get loopCount(): number;
    get loopIteration(): number;
    play(): void;
    togglePlayPause(): void;
    togglePause(): void;
    togglePlay(): void;
    togglePlayStop(): void;
    pause(): void;
    stop(): void;
    cycleLoopMode(): void;
}
```

### cycleLoopMode() {#module:@toptensoftware/cantabile-js.Transport#cycleLoopMode}


Cycles between the various loop modes


```ts
cycleLoopMode(): void;
```

### loopCount {#module:@toptensoftware/cantabile-js.Transport#loopCount}


Gets the current loopCount


```ts
get loopCount(): number;
```

### loopIteration {#module:@toptensoftware/cantabile-js.Transport#loopIteration}


Gets the current loopIteration


```ts
get loopIteration(): number;
```

### loopMode {#module:@toptensoftware/cantabile-js.Transport#loopMode}


Gets or sets the current loopMode


```ts
get loopMode(): TransportLoopMode;
```

```ts
set loopMode(value: TransportLoopMode);
```

### pause() {#module:@toptensoftware/cantabile-js.Transport#pause}


Pauses the master transport


```ts
pause(): void;
```

### play() {#module:@toptensoftware/cantabile-js.Transport#play}


Starts transport playback


```ts
play(): void;
```

### state {#module:@toptensoftware/cantabile-js.Transport#state}


The current transport state.


```ts
get state(): TransportState;
```

```ts
set state(value: TransportState);
```

### stop() {#module:@toptensoftware/cantabile-js.Transport#stop}


Stops the master transport


```ts
stop(): void;
```

### tempo {#module:@toptensoftware/cantabile-js.Transport#tempo}


Gets the current tempo


```ts
get tempo(): number;
```

### timeSignature {#module:@toptensoftware/cantabile-js.Transport#timeSignature}


Gets the current time signature as a string (eg: "3/4")


```ts
get timeSignature(): string;
```

### timeSignatureDen {#module:@toptensoftware/cantabile-js.Transport#timeSignatureDen}


Gets the current time signature denominator


```ts
get timeSignatureDen(): number;
```

### timeSignatureNum {#module:@toptensoftware/cantabile-js.Transport#timeSignatureNum}


Gets the current time signature numerator


```ts
get timeSignatureNum(): number;
```

### togglePause() {#module:@toptensoftware/cantabile-js.Transport#togglePause}


Toggles pause and play states (unless stopped)


```ts
togglePause(): void;
```

### togglePlay() {#module:@toptensoftware/cantabile-js.Transport#togglePlay}


Toggles play and stopped states


```ts
togglePlay(): void;
```

### togglePlayPause() {#module:@toptensoftware/cantabile-js.Transport#togglePlayPause}


Toggles between play and pause states


```ts
togglePlayPause(): void;
```

### togglePlayStop() {#module:@toptensoftware/cantabile-js.Transport#togglePlayStop}


Toggles between play and stop states


```ts
togglePlayStop(): void;
```

