---
title: BindingWatcher
description: BindingWatcher Reference
---

# BindingWatcher

## BindingWatcher Class {#module:@toptensoftware/cantabile-js.BindingWatcher}


Represents an watched binding point for changes/invocations
Returned from the {{#crossLink "Bindings/watch:method"}}{{/crossLink}} method.



```ts
class BindingWatcher extends EventEmitter<any> {
    get bindablePoint(): BindingPoint;
    get value(): Object;
    unwatch(): void;
}
```

### bindablePoint {#module:@toptensoftware/cantabile-js.BindingWatcher#bindablePoint}


Returns the binding point being listened to



```ts
get bindablePoint(): BindingPoint;
```

### unwatch() {#module:@toptensoftware/cantabile-js.BindingWatcher#unwatch}


Stops monitoring this binding source



```ts
unwatch(): void;
```

### value {#module:@toptensoftware/cantabile-js.BindingWatcher#value}


Returns the last received value for the source binding point



```ts
get value(): Object;
```

