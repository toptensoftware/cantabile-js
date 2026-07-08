---
title: KeyRange
description: KeyRange Reference
---

# KeyRange

## KeyRange {#module:@toptensoftware/cantabile-js.KeyRange}


Describes an active key range


```ts
interface KeyRange
{
    min: number;
    max: number;
    transport: number;
    color: number;
    title: string;
}
```

### color {#module:@toptensoftware/cantabile-js.KeyRange#color}

The color associated with the key range (0 - 15) 

```ts
color: number;
```

### max {#module:@toptensoftware/cantabile-js.KeyRange#max}

The MIDI note number of the highest note in the key range 

```ts
max: number;
```

### min {#module:@toptensoftware/cantabile-js.KeyRange#min}

The MIDI note number of the lowest note in the key range 

```ts
min: number;
```

### title {#module:@toptensoftware/cantabile-js.KeyRange#title}

The title of the key range (ie: name of the target) 

```ts
title: string;
```

### transport {#module:@toptensoftware/cantabile-js.KeyRange#transport}

The transpose setting associated with the key range (in semi-tones) 

```ts
transport: number;
```

