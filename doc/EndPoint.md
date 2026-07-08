---
title: EndPoint
description: EndPoint Reference
---

# EndPoint

## EndPoint Class {#module:@toptensoftware/cantabile-js.EndPoint}


Common functionality for all end point handlers



```ts
class EndPoint extends EventEmitter<any> {
    get owner(): Cantabile;
    get endPoint(): string;
    get data(): string;
    connect(): Promise<any>;
    disconnect(): void;
    get isConnected(): boolean;
    get willConnect(): boolean;
    waitForConnected(): Promise<any>;
}
```

### connect() {#module:@toptensoftware/cantabile-js.EndPoint#connect}


Connects this end point and starts listening for events.

Usually this method doesn't need to be called since the session
object normally automatically connects end point objects when
first accessed



```ts
connect(): Promise<any>;
```

### data {#module:@toptensoftware/cantabile-js.EndPoint#data}


Gets the last received raw data for this end point


```ts
get data(): string;
```

### disconnect() {#module:@toptensoftware/cantabile-js.EndPoint#disconnect}


Disconnect this end point and stops listening for events.

Usually this method should never be used



```ts
disconnect(): void;
```

### endPoint {#module:@toptensoftware/cantabile-js.EndPoint#endPoint}


Gets the end point url for this endpoint


```ts
get endPoint(): string;
```

### isConnected {#module:@toptensoftware/cantabile-js.EndPoint#isConnected}


Checks if this end point is current connected


```ts
get isConnected(): boolean;
```

### owner {#module:@toptensoftware/cantabile-js.EndPoint#owner}


Gets the owning session of this end point


```ts
get owner(): Cantabile;
```

### waitForConnected() {#module:@toptensoftware/cantabile-js.EndPoint#waitForConnected}


Returns a promise that will be resolved when this end point is opened



```ts
waitForConnected(): Promise<any>;
```

### willConnect {#module:@toptensoftware/cantabile-js.EndPoint#willConnect}


Checks if this end point will connect when the session connects


```ts
get willConnect(): boolean;
```

