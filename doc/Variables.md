---
title: Variables
description: Variables Reference
---

# Variables

## Variables Class {#module:@toptensoftware/cantabile-js.Variables}


Provides access to Cantabile's internal variables by allowing a pattern string to be
expanded into a final display string.

Access this object via the {{#crossLink "Cantabile/variables:property"}}{{/crossLink}} property.



```ts
class Variables extends EndPoint {
    resolve(pattern: string): Promise<string>;
    watch(pattern: string, callback?: PatternWatcherCallback): PatternWatcher;
}
```

### resolve() {#module:@toptensoftware/cantabile-js.Variables#resolve}


Resolves a variable pattern string into a final display string



```ts
resolve(pattern: string): Promise<string>;
```

* **`pattern`** The string variable pattern to resolve

### watch() {#module:@toptensoftware/cantabile-js.Variables#watch}


Starts watching a pattern string for changes



```ts
watch(pattern: string, callback?: PatternWatcherCallback): PatternWatcher;
```

* **`pattern`** The string pattern to watch

* **`callback`** Optional callback function to be called when the resolved display string changes.

