---
title: Bindings
description: Bindings Reference
---

# Bindings

## Bindings Class {#module:@toptensoftware/cantabile-js.Bindings}


Provides access to Cantabile's binding points.

Access this object via the {{#crossLink "Cantabile/bindings:property"}}{{/crossLink}} property.



```ts
class Bindings extends EndPoint {
    getAvailableBindingPoints(): Promise<BindingPointEntry[]>;
    getBindingPointInfo(bindingPoint: BindingPoint, source: boolean): Promise<BindingPointInfo>;
    invoke(bindingPoint: BindingPoint, value: Object): Promise<any>;
    query(bindingPoint: BindingPoint): Promise<Object>;
    watch(bindingPoint: BindingPoint, callback?: BindingWatcherCallback): BindingWatcher;
    prepare(bindingPoint: BindingPoint): PreparedBindingPoint;
}
```

### getAvailableBindingPoints() {#module:@toptensoftware/cantabile-js.Bindings#getAvailableBindingPoints}


Retrieves a list of available binding points

If Cantabile is running on your local machine you can view this list
directly at <http://localhost:35007/api/bindings/vailableBindingPoints>



```ts
getAvailableBindingPoints(): Promise<BindingPointEntry[]>;
```

### getBindingPointInfo() {#module:@toptensoftware/cantabile-js.Bindings#getBindingPointInfo}


Retrieves additional information about a specific binding point



```ts
getBindingPointInfo(bindingPoint: BindingPoint, source: boolean): Promise<BindingPointInfo>;
```

* **`bindingPoint`** the binding point to be queried

* **`source`** whether to return information about the source or target version of the binding point

### invoke() {#module:@toptensoftware/cantabile-js.Bindings#invoke}


Invokes a target binding point

If Cantabile is running on your local machine a full list of available binding
points is [available here](http://localhost:35007/api/bindings/availableBindingPoints)



```ts
invoke(bindingPoint: BindingPoint, value: Object): Promise<any>;
```

* **`bindingPoint`** The binding point to invoke

* **`value`** The value to pass to the binding point

### prepare() {#module:@toptensoftware/cantabile-js.Bindings#prepare}


Prepares a target binding point for multiple invocations



```ts
prepare(bindingPoint: BindingPoint): PreparedBindingPoint;
```

* **`bindingPoint`** The binding point to invoke

### query() {#module:@toptensoftware/cantabile-js.Bindings#query}


Queries a source binding point for it's current value.



```ts
query(bindingPoint: BindingPoint): Promise<Object>;
```

* **`bindingPoint`** The binding point to query

### watch() {#module:@toptensoftware/cantabile-js.Bindings#watch}


Starts watching a source binding point for changes (or invocations)



```ts
watch(bindingPoint: BindingPoint, callback?: BindingWatcherCallback): BindingWatcher;
```

* **`bindingPoint`** The binding point to watch

* **`callback`** Optional callback function to be called when the source binding triggers

