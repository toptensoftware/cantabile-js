---
title: Song
description: Song Reference
---

# Song

## Song Class {#module:@toptensoftware/cantabile-js.Song}


Interface to the current song

Access this object via the {{#crossLink "Cantabile/song:property"}}{{/crossLink}} property.



```ts
class Song extends EndPoint {
    get name(): string;
    get pr(): number;
    get currentState(): string;
    available(): string[];
    loadSong(name: string, state: string): void;
}
```

### available() {#module:@toptensoftware/cantabile-js.Song#available}


Gets a list of available songs in the user's songs folder


```ts
available(): string[];
```

### currentState {#module:@toptensoftware/cantabile-js.Song#currentState}


The name of the current song state


```ts
get currentState(): string;
```

### loadSong() {#module:@toptensoftware/cantabile-js.Song#loadSong}


Loads the specified song from the user's song folder


```ts
loadSong(name: string, state: string): void;
```

* **`name`** Name of the song to load (relative to user's song folder, without extension)

* **`state`** Optional name of state to load, or null.

### name {#module:@toptensoftware/cantabile-js.Song#name}


The name of the current song


```ts
get name(): string;
```

### pr {#module:@toptensoftware/cantabile-js.Song#pr}


The set list program number of the song (or -1 if not in set list, or not set)


```ts
get pr(): number;
```

