---
title: PatternWatcher
description: PatternWatcher Reference
---

# PatternWatcher

## PatternWatcher Class {#module:@toptensoftware/cantabile-js.PatternWatcher}


Represents a monitored pattern string.
Returned from the {{#crossLink "Variables/watch:method"}}{{/crossLink}} method.



```ts
class PatternWatcher extends EventEmitter<any> {
    get pattern(): string;
    get resolved(): string;
    unwatch(): void;
}
```

### pattern {#module:@toptensoftware/cantabile-js.PatternWatcher#pattern}


Returns the pattern string being watched



```ts
get pattern(): string;
```

### resolved {#module:@toptensoftware/cantabile-js.PatternWatcher#resolved}


Returns the current resolved display string



```ts
get resolved(): string;
```

### unwatch() {#module:@toptensoftware/cantabile-js.PatternWatcher#unwatch}


Stops monitoring this pattern string for changes



```ts
unwatch(): void;
```

