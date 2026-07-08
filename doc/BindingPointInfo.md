---
title: BindingPointInfo
description: BindingPointInfo Reference
---

# BindingPointInfo

## BindingPointInfo {#module:@toptensoftware/cantabile-js.BindingPointInfo}


Information about an available binding point


```ts
interface BindingPointInfo
{
    id: string;
    displayName: string;
    kind: BindingPointKind;
    valueFormat: BindingPointValueFormat;
    valueMin: number;
    valueMax: number;
    bindableParams: BindingParam[];
    bindingPointParams: BindingParam[];
}
```

### bindableParams {#module:@toptensoftware/cantabile-js.BindingPointInfo#bindableParams}

Information about the bindable object parameters supported by this binding point 

```ts
bindableParams: BindingParam[];
```

### bindingPointParams {#module:@toptensoftware/cantabile-js.BindingPointInfo#bindingPointParams}

Information about the binding point parameters supported by this binding point 

```ts
bindingPointParams: BindingParam[];
```

### displayName {#module:@toptensoftware/cantabile-js.BindingPointInfo#displayName}

The display name of the binding point 

```ts
displayName: string;
```

### id {#module:@toptensoftware/cantabile-js.BindingPointInfo#id}

The id of the binding point 

```ts
id: string;
```

### kind {#module:@toptensoftware/cantabile-js.BindingPointInfo#kind}

The kind of value accepted/sent by this binding point 

```ts
kind: BindingPointKind;
```

### valueFormat {#module:@toptensoftware/cantabile-js.BindingPointInfo#valueFormat}

The kind of value accepted/sent by this binding point
This property is only present if 'kind' is "Value" 

```ts
valueFormat: BindingPointValueFormat;
```

### valueMax {#module:@toptensoftware/cantabile-js.BindingPointInfo#valueMax}

The maximum value range (only if 'kind' is "Value") 

```ts
valueMax: number;
```

### valueMin {#module:@toptensoftware/cantabile-js.BindingPointInfo#valueMin}

The minimum value range (only if 'kind' is "Value") 

```ts
valueMin: number;
```

