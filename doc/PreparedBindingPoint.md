---
title: PreparedBindingPoint
description: PreparedBindingPoint Reference
---

# PreparedBindingPoint

## PreparedBindingPoint Class {#module:@toptensoftware/cantabile-js.PreparedBindingPoint}


Represents a target binding point prepared for multiple invocations
Returned from the {{#crossLink "Bindings/prepare:method"}}{{/crossLink}} method.



```ts
class PreparedBindingPoint {
    waitForConnected(): Promise<any>;
    get isConnected(): boolean;
    unprepare(): void;
    invoke(value: Object): Promise<any>;
    tryInvoke(value: Object): boolean | Promise<any>;
}
```

### invoke() {#module:@toptensoftware/cantabile-js.PreparedBindingPoint#invoke}


Invokes this binding point


```ts
invoke(value: Object): Promise<any>;
```

* **`value`** The value to pass to the binding point

### isConnected {#module:@toptensoftware/cantabile-js.PreparedBindingPoint#isConnected}


Check if this binding point is currently connected and ready to accept invocations



```ts
get isConnected(): boolean;
```

### tryInvoke() {#module:@toptensoftware/cantabile-js.PreparedBindingPoint#tryInvoke}


Tries to invokes this binding point


```ts
tryInvoke(value: Object): boolean | Promise<any>;
```

* **`value`** The value to pass to the binding point

### unprepare() {#module:@toptensoftware/cantabile-js.PreparedBindingPoint#unprepare}


Releases this prepared binding point



```ts
unprepare(): void;
```

### waitForConnected() {#module:@toptensoftware/cantabile-js.PreparedBindingPoint#waitForConnected}


Returns a promise that will resolve once this prepared binding has connected


```ts
waitForConnected(): Promise<any>;
```

