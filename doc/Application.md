---
title: Application
description: Application Reference
---

# Application

## Application Class {#module:@toptensoftware/cantabile-js.Application}


Interface to the application object

Access this object via the {{#crossLink "Cantabile/application:property"}}{{/crossLink}} property.



```ts
class Application extends EndPoint {
    get companyName(): string;
    get name(): string;
    get version(): string;
    get edition(): string;
    get copyright(): string;
    get build(): number;
    get colors(): ColorEntry[];
    get busy(): boolean;
    get baseProgramNumber(): number;
    get bankedProgramNumberFormat(): string;
}
```

### bankedProgramNumberFormat {#module:@toptensoftware/cantabile-js.Application#bankedProgramNumberFormat}


The preferred banked program display format - "SeparateBanks","CombinedBanks","Plain" or "ZeroPadded"


```ts
get bankedProgramNumberFormat(): string;
```

### baseProgramNumber {#module:@toptensoftware/cantabile-js.Application#baseProgramNumber}


The base program number (0 or 1)


```ts
get baseProgramNumber(): number;
```

### build {#module:@toptensoftware/cantabile-js.Application#build}


The application's build number


```ts
get build(): number;
```

### busy {#module:@toptensoftware/cantabile-js.Application#busy}


The application's busy status


```ts
get busy(): boolean;
```

### colors {#module:@toptensoftware/cantabile-js.Application#colors}


An array of {{#crossLink "ColorEntry"}}{{/crossLink}} items for the color index table


```ts
get colors(): ColorEntry[];
```

### companyName {#module:@toptensoftware/cantabile-js.Application#companyName}


The application's company name


```ts
get companyName(): string;
```

### copyright {#module:@toptensoftware/cantabile-js.Application#copyright}


The application's copyright message


```ts
get copyright(): string;
```

### edition {#module:@toptensoftware/cantabile-js.Application#edition}


The application edition string


```ts
get edition(): string;
```

### name {#module:@toptensoftware/cantabile-js.Application#name}


The application name


```ts
get name(): string;
```

### version {#module:@toptensoftware/cantabile-js.Application#version}


The application version string


```ts
get version(): string;
```

