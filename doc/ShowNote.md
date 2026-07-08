---
title: ShowNote
description: ShowNote Reference
---

# ShowNote

## ShowNote {#module:@toptensoftware/cantabile-js.ShowNote}


Describes a show note item


```ts
interface ShowNote
{
    backgroundColor: number;
    bold: boolean;
    fixedPitch: boolean;
    fontSize: number;
    hidden: boolean;
    imageUrl: string;
    imageScale: number;
    imageWidth: number;
    imageHeight: number;
    text: string;
    textAlign: ShowNoteTextAlignment;
    textColor: number;
}
```

### backgroundColor {#module:@toptensoftware/cantabile-js.ShowNote#backgroundColor}

Background color (0 - 15) 

```ts
backgroundColor: number;
```

### bold {#module:@toptensoftware/cantabile-js.ShowNote#bold}

Bold font 

```ts
bold: boolean;
```

### fixedPitch {#module:@toptensoftware/cantabile-js.ShowNote#fixedPitch}

Fixed pitch font 

```ts
fixedPitch: boolean;
```

### fontSize {#module:@toptensoftware/cantabile-js.ShowNote#fontSize}

Font size 

```ts
fontSize: number;
```

### hidden {#module:@toptensoftware/cantabile-js.ShowNote#hidden}

True if the show note is currently hidden 

```ts
hidden: boolean;
```

### imageHeight {#module:@toptensoftware/cantabile-js.ShowNote#imageHeight}

Height of the image in pixels 

```ts
imageHeight: number;
```

### imageScale {#module:@toptensoftware/cantabile-js.ShowNote#imageScale}

How much to scale the image by (0.0 - 1.0) 

```ts
imageScale: number;
```

### imageUrl {#module:@toptensoftware/cantabile-js.ShowNote#imageUrl}

URL to retrieve the note's background image (or null) 

```ts
imageUrl: string;
```

### imageWidth {#module:@toptensoftware/cantabile-js.ShowNote#imageWidth}

Width of the image in pixels 

```ts
imageWidth: number;
```

### text {#module:@toptensoftware/cantabile-js.ShowNote#text}

The show note's text 

```ts
text: string;
```

### textAlign {#module:@toptensoftware/cantabile-js.ShowNote#textAlign}

Text alignment 

```ts
textAlign: ShowNoteTextAlignment;
```

### textColor {#module:@toptensoftware/cantabile-js.ShowNote#textColor}

Text color (0 - 15) 

```ts
textColor: number;
```

