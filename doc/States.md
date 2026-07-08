---
title: States
description: States Reference
---

# States

## States Class {#module:@toptensoftware/cantabile-js.States}


Base states functionality for State and racks



```ts
class States extends EndPoint {
    get items(): State[];
    get name(): string;
    get currentStateIndex(): number;
    get currentState(): State;
    loadStateByIndex(index: number, delayed?: boolean): void;
    loadStateByProgram(program: number, delayed?: boolean): void;
    loadFirstState(delayed?: boolean): void;
    loadLastState(delayed?: boolean): void;
    loadNextState(direction: number, delayed?: boolean, wrap?: boolean): void;
}
```

### currentState {#module:@toptensoftware/cantabile-js.States#currentState}


The currently loaded {{#crossLink "State"}}{{/crossLink}} (or null if no active state).
See also {{#crossLink "States/currentStateIndex:property"}}{{/crossLink}}.


```ts
get currentState(): State;
```

### currentStateIndex {#module:@toptensoftware/cantabile-js.States#currentStateIndex}


The index of the currently loaded State (or -1 if no active state).
See also {{#crossLink "States/currentState:property"}}{{/crossLink}}.


```ts
get currentStateIndex(): number;
```

### items {#module:@toptensoftware/cantabile-js.States#items}


An array of {{#crossLink "State"}}{{/crossLink}} items


```ts
get items(): State[];
```

### loadFirstState() {#module:@toptensoftware/cantabile-js.States#loadFirstState}


Load the first state


```ts
loadFirstState(delayed?: boolean): void;
```

* **`delayed`** Whether to perform a delayed or immediate load

### loadLastState() {#module:@toptensoftware/cantabile-js.States#loadLastState}


Load the last state


```ts
loadLastState(delayed?: boolean): void;
```

* **`delayed`** Whether to perform a delayed or immediate load

### loadNextState() {#module:@toptensoftware/cantabile-js.States#loadNextState}


Load the next or previous state


```ts
loadNextState(direction: number, delayed?: boolean, wrap?: boolean): void;
```

* **`direction`** Direction to move (1 = next, -1 = previous)

* **`delayed`** Whether to perform a delayed or immediate load

* **`wrap`** Whether to wrap around at the start/end

### loadStateByIndex() {#module:@toptensoftware/cantabile-js.States#loadStateByIndex}


Load the State at a given index position


```ts
loadStateByIndex(index: number, delayed?: boolean): void;
```

* **`index`** The zero based index of the State to load

* **`delayed`** Whether to perform a delayed or immediate load

### loadStateByProgram() {#module:@toptensoftware/cantabile-js.States#loadStateByProgram}


Load the State with a given program number


```ts
loadStateByProgram(program: number, delayed?: boolean): void;
```

* **`program`** The zero based program number of the State to load

* **`delayed`** Whether to perform a delayed or immediate load

### name {#module:@toptensoftware/cantabile-js.States#name}


The display name of the containing song or rack


```ts
get name(): string;
```

