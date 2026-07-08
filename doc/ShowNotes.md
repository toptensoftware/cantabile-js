---
title: ShowNotes
description: ShowNotes Reference
---

# ShowNotes

## ShowNotes Class {#module:@toptensoftware/cantabile-js.ShowNotes}


Used to access the current set of show notes

Access this object via the {{#crossLink "Cantabile/showNotes:property"}}{{/crossLink}} property.



```ts
class ShowNotes extends EndPoint {
    getV1Raw(): Promise<object>;
    get items(): ShowNote[];
    get markdown(): any;
    storeMarkdown(markdown: string): Promise<any>;
}
```

### getV1Raw() {#module:@toptensoftware/cantabile-js.ShowNotes#getV1Raw}


Get's the original v1 show notes in raw json format


```ts
getV1Raw(): Promise<object>;
```

### items {#module:@toptensoftware/cantabile-js.ShowNotes#items}


An array of {{#crossLink "ShowNote"}}{{/crossLink}} items


```ts
get items(): ShowNote[];
```

### markdown {#module:@toptensoftware/cantabile-js.ShowNotes#markdown}


The markdown show notes


```ts
get markdown(): any;
```

### storeMarkdown() {#module:@toptensoftware/cantabile-js.ShowNotes#storeMarkdown}


Stores the markdown notes		 for the current song



```ts
storeMarkdown(markdown: string): Promise<any>;
```

* **`markdown`** * @returns {Promise} A promise that resolves when the markdown has been stored with the song

