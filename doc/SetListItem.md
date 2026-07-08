---
title: SetListItem
description: SetListItem Reference
---

# SetListItem

## SetListItem {#module:@toptensoftware/cantabile-js.SetListItem}


Represents an item in a list


```ts
interface SetListItem
{
    readonly kind: SetListItemKind;
    readonly name: string;
    readonly pr: number;
    readonly color: number;
}
```

### color {#module:@toptensoftware/cantabile-js.SetListItem#color}

The color of the item (0 to 15) 

```ts
readonly color: number;
```

### kind {#module:@toptensoftware/cantabile-js.SetListItem#kind}

The item kind  

```ts
readonly kind: SetListItemKind;
```

### name {#module:@toptensoftware/cantabile-js.SetListItem#name}

The name of the song or break 

```ts
readonly name: string;
```

### pr {#module:@toptensoftware/cantabile-js.SetListItem#pr}

The zero based program number of a song 

```ts
readonly pr: number;
```

