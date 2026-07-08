---
title: BindingPointEntry
description: BindingPointEntry Reference
---

# BindingPointEntry

## BindingPointEntry {#module:@toptensoftware/cantabile-js.BindingPointEntry}


describes a binding point entry as returned from {{#crossLink "Bindings/availableBindingPoints:method"}}{{/crosslink}}


```ts
interface BindingPointEntry
{
    bindableId: string;
    bindingPointId: string; 
    displayName: string;
    isSource: boolean;
    isTarget: boolean;
}
```

### bindableId {#module:@toptensoftware/cantabile-js.BindingPointEntry#bindableId}

The id of the bindable object 

```ts
bindableId: string;
```

### bindingPointId {#module:@toptensoftware/cantabile-js.BindingPointEntry#bindingPointId}

The id of the binding point on the bindable object 

```ts
bindingPointId: string;
```

### displayName {#module:@toptensoftware/cantabile-js.BindingPointEntry#displayName}

The display name of the binding point 

```ts
displayName: string;
```

### isSource {#module:@toptensoftware/cantabile-js.BindingPointEntry#isSource}

Indicates if this binding point can be used as a source binding point 

```ts
isSource: boolean;
```

### isTarget {#module:@toptensoftware/cantabile-js.BindingPointEntry#isTarget}

Indicates if this binding point can be used as a target binding point 

```ts
isTarget: boolean;
```

