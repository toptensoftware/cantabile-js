---
title: SetList
description: SetList Reference
---

# SetList

## SetList Class {#module:@toptensoftware/cantabile-js.SetList}


Used to access and control Cantabile's set list functionality.

Access this object via the {{#crossLink "Cantabile/setList:property"}}{{/crossLink}} property.



```ts
class SetList extends EndPoint {
    get items(): SetListItem[];
    get name(): string;
    get preLoaded(): boolean;
    get currentSongIndex(): number;
    get currentSong(): SetListItem;
    loadSongByIndex(index: number, delayed?: boolean): void;
    loadSongByProgram(program: number, delayed?: boolean): void;
    loadFirstSong(delayed?: boolean): void;
    loadLastSong(delayed?: boolean): void;
    loadNextSong(direction: number, delayed?: boolean, wrap?: boolean): void;
    available(): string[];
    loadSetList(name: string, loadFirst?: boolean): void;
}
```

### available() {#module:@toptensoftware/cantabile-js.SetList#available}


Gets a list of available set lists in the user's set list folder


```ts
available(): string[];
```

### currentSong {#module:@toptensoftware/cantabile-js.SetList#currentSong}


The currently loaded {{#crossLink "SetListItem"}}{{/crossLink}} (or null if the current song isn't in the set list).
See also {{#crossLink "SetList/currentSongIndex:property"}}{{/crossLink}}.


```ts
get currentSong(): SetListItem;
```

### currentSongIndex {#module:@toptensoftware/cantabile-js.SetList#currentSongIndex}


The index of the currently loaded song (or -1 if the current song isn't in the set list).
See also {{#crossLink "SetList/currentSong:property"}}{{/crossLink}}.


```ts
get currentSongIndex(): number;
```

### items {#module:@toptensoftware/cantabile-js.SetList#items}


An array of {{#crossLink "SetListItem"}}{{/crossLink}} items in the set list


```ts
get items(): SetListItem[];
```

### loadFirstSong() {#module:@toptensoftware/cantabile-js.SetList#loadFirstSong}


Load the first song in the set list


```ts
loadFirstSong(delayed?: boolean): void;
```

* **`delayed`** Whether to perform a delayed or immediate load

### loadLastSong() {#module:@toptensoftware/cantabile-js.SetList#loadLastSong}


Load the last song in the set list


```ts
loadLastSong(delayed?: boolean): void;
```

* **`delayed`** Whether to perform a delayed or immediate load

### loadNextSong() {#module:@toptensoftware/cantabile-js.SetList#loadNextSong}


Load the next or previous song in the set list


```ts
loadNextSong(direction: number, delayed?: boolean, wrap?: boolean): void;
```

* **`direction`** Direction to move (1 = next, -1 = previous)

* **`delayed`** Whether to perform a delayed or immediate load

* **`wrap`** Whether to wrap around at the start/end of the list

### loadSetList() {#module:@toptensoftware/cantabile-js.SetList#loadSetList}


Loads the specified set list from the user's set list folder


```ts
loadSetList(name: string, loadFirst?: boolean): void;
```

* **`name`** Name of the set to load (relative to user's set list folder, without extension)

* **`loadFirst`** True to load the first song in the set list (default = true)

### loadSongByIndex() {#module:@toptensoftware/cantabile-js.SetList#loadSongByIndex}


Load the song at a given index position


```ts
loadSongByIndex(index: number, delayed?: boolean): void;
```

* **`index`** The zero based index of the song to load

* **`delayed`** Whether to perform a delayed or immediate load

### loadSongByProgram() {#module:@toptensoftware/cantabile-js.SetList#loadSongByProgram}


Load the song with a given program number


```ts
loadSongByProgram(program: number, delayed?: boolean): void;
```

* **`program`** The zero based program number of the song to load

* **`delayed`** Whether to perform a delayed or immediate load

### name {#module:@toptensoftware/cantabile-js.SetList#name}


The display name of the current set list (ie: its file name with path and extension removed)


```ts
get name(): string;
```

### preLoaded {#module:@toptensoftware/cantabile-js.SetList#preLoaded}


Indicates if the set list is currently pre-loaded


```ts
get preLoaded(): boolean;
```

