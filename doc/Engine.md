---
title: Engine
description: Engine Reference
---

# Engine

## Engine Class {#module:@toptensoftware/cantabile-js.Engine}


Provides access to Cantabile's engine object for start/stop control

Access this object via the {{#crossLink "Cantabile/engine:property"}}{{/crossLink}} property.



```ts
class Engine {
    isStarted(): Promise<boolean>;
    start(): Promise<any>;
    stop(): Promise<any>;
    restart(): Promise<any>;
    startStop(): Promise<any>;
}
```

### isStarted() {#module:@toptensoftware/cantabile-js.Engine#isStarted}


Returns a promise to provide the started state of Cantabile's audio engine.

This API is only available via  AJAX, and not WebSocket



```ts
isStarted(): Promise<boolean>;
```

### restart() {#module:@toptensoftware/cantabile-js.Engine#restart}


Restarts Cantabile's audio engine

This API is only available via  AJAX, and not WebSocket



```ts
restart(): Promise<any>;
```

### start() {#module:@toptensoftware/cantabile-js.Engine#start}


Starts Cantabile's audio engine

This API is only available via  AJAX, and not WebSocket



```ts
start(): Promise<any>;
```

### startStop() {#module:@toptensoftware/cantabile-js.Engine#startStop}


Toggles the audio engine between started and stopped

This API is only available via  AJAX, and not WebSocket



```ts
startStop(): Promise<any>;
```

### stop() {#module:@toptensoftware/cantabile-js.Engine#stop}


Stops Cantabile's audio engine

This API is only available via  AJAX, and not WebSocket



```ts
stop(): Promise<any>;
```

