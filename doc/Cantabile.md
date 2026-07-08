---
title: Cantabile
description: Cantabile Reference
---

# Cantabile

## Cantabile Class {#module:@toptensoftware/cantabile-js.Cantabile}


Represents a connection to Cantabile.



```ts
class Cantabile extends EventEmitter<any> {
    constructor(options: string | Object);
    set autoConnectEndPoints(value: boolean);
    get autoConnectEndPoints(): boolean;
    get options(): Object;
    get state(): string;
    connect(): Promise<any>;
    disconnect(): void;
    send(obj: object): void;
    request(message: object): Promise<object>;
    waitForConnected(): Promise<any>;
    get host(): string;
    get socketUrl(): string;
    get song(): Song;
    get setList(): SetList;
    get songStates(): SongStates;
    get keyRanges(): KeyRanges;
    get showNotes(): ShowNotes;
    get variables(): Variables;
    get onscreenKeyboard(): OnscreenKeyboard;
    get commands(): Commands;
    get transport(): Transport;
    get application(): Application;
    get engine(): Engine;
    get bindings(): Bindings;
}
```

### application {#module:@toptensoftware/cantabile-js.Cantabile#application}


Gets the {{#crossLink "Application"}}{{/crossLink}} object



```ts
get application(): Application;
```

### autoConnectEndPoints {#module:@toptensoftware/cantabile-js.Cantabile#autoConnectEndPoints}


Controls whether the sub-object end points are automatically
connected when first accessed.



```ts
get autoConnectEndPoints(): boolean;
```

```ts
set autoConnectEndPoints(value: boolean);
```

### bindings {#module:@toptensoftware/cantabile-js.Cantabile#bindings}


Gets the {{#crossLink "Bindings"}}{{/crossLink}} object



```ts
get bindings(): Bindings;
```

### commands {#module:@toptensoftware/cantabile-js.Cantabile#commands}


Gets the {{#crossLink "Commands"}}{{/crossLink}} object



```ts
get commands(): Commands;
```

### connect() {#module:@toptensoftware/cantabile-js.Cantabile#connect}


Initiate connection and retry if fails until success


```ts
connect(): Promise<any>;
```

### constructor() {#module:@toptensoftware/cantabile-js.Cantabile#constructor}


Creates a new Cantabile network session


```ts
constructor(options: string | Object);
```

* **`options.host`** the host to connect to (defaults to browser url, or localhost:35007)

* **`options.autoConnect`** if true automatically initiates connection

* **`options.autoConnectEndPoints`** if true automatically connects end point objects when accessed

* **`options.maxListeners`** set the max event listeners for this object (if supported)

### disconnect() {#module:@toptensoftware/cantabile-js.Cantabile#disconnect}


Disconnect and stop retries


```ts
disconnect(): void;
```

### engine {#module:@toptensoftware/cantabile-js.Cantabile#engine}


Gets the {{#crossLink "Engine"}}{{/crossLink}} object



```ts
get engine(): Engine;
```

### host {#module:@toptensoftware/cantabile-js.Cantabile#host}


The host URL



```ts
get host(): string;
```

### keyRanges {#module:@toptensoftware/cantabile-js.Cantabile#keyRanges}


Gets the {{#crossLink "KeyRanges"}}{{/crossLink}} object



```ts
get keyRanges(): KeyRanges;
```

### onscreenKeyboard {#module:@toptensoftware/cantabile-js.Cantabile#onscreenKeyboard}


Gets the {{#crossLink "OnscreenKeyboard"}}{{/crossLink}} object



```ts
get onscreenKeyboard(): OnscreenKeyboard;
```

### options {#module:@toptensoftware/cantabile-js.Cantabile#options}


Gets the resolved options object used to construct this object


```ts
get options(): Object;
```

### request() {#module:@toptensoftware/cantabile-js.Cantabile#request}


Stringify an object as a JSON message, send it to the server and returns
a promise which will resolve to the result.



```ts
request(message: object): Promise<object>;
```

* **`message`** The message object to send

### send() {#module:@toptensoftware/cantabile-js.Cantabile#send}


Stringify an object as a JSON message and send it to the server



```ts
send(obj: object): void;
```

* **`obj`** The object to send

### setList {#module:@toptensoftware/cantabile-js.Cantabile#setList}


Gets the {{#crossLink "SetList"}}{{/crossLink}} object



```ts
get setList(): SetList;
```

### showNotes {#module:@toptensoftware/cantabile-js.Cantabile#showNotes}


Gets the {{#crossLink "ShowNotes"}}{{/crossLink}} object



```ts
get showNotes(): ShowNotes;
```

### socketUrl {#module:@toptensoftware/cantabile-js.Cantabile#socketUrl}


The base socket url



```ts
get socketUrl(): string;
```

### song {#module:@toptensoftware/cantabile-js.Cantabile#song}


Gets the {{#crossLink "Song"}}{{/crossLink}} object



```ts
get song(): Song;
```

### songStates {#module:@toptensoftware/cantabile-js.Cantabile#songStates}


Gets the {{#crossLink "SongStates"}}{{/crossLink}} object



```ts
get songStates(): SongStates;
```

### state {#module:@toptensoftware/cantabile-js.Cantabile#state}


The current connection state, either "connecting", "connected" or "disconnected"



```ts
get state(): string;
```

### transport {#module:@toptensoftware/cantabile-js.Cantabile#transport}


Gets the {{#crossLink "Transport"}}{{/crossLink}} object



```ts
get transport(): Transport;
```

### variables {#module:@toptensoftware/cantabile-js.Cantabile#variables}


Gets the {{#crossLink "Variables"}}{{/crossLink}} object



```ts
get variables(): Variables;
```

### waitForConnected() {#module:@toptensoftware/cantabile-js.Cantabile#waitForConnected}


Returns a promise that will be resolved when connected



```ts
waitForConnected(): Promise<any>;
```

