---
title: Getting Started
site:
    name: Cantabile JavaScript API
    logo: CantabileIcon.svg
---

# Cantabile-js

Welcome to cantabile-js.

This library supports connecting to Cantabile's built-in network server providing
control and monitoring of Cantabile from NodeJS or a browser.

This is v0.3 of this library and is not backwards compatibile with previous versions.
Documentation for the old version is [available here](https://www.cantabilesoftware.com/jsapi-0.1).

For details on the underlying network api and protocol used by this library, 
[see here](https://www.cantabilesoftware.com/netapi).


## Installation

To install the NPM package:

```bash
npm install toptensoftware/cantabile-js
```

Browser packages are [available here](https://github.com/toptensoftware/cantabile-js/releases).

Note: while browser packages are provided, the recommeded approach for browser development
is to use the NPM packages and bundler (eg: rollup).


## Usage

To import

```js
import { Cantabile } from '@toptensoftware/cantabile-js';
```

To create an instance

```js
// On node this will connect to localhost:35007
// In a browser this will connect to the current URL host
let C = new Cantabile();
```


## Examples

Examples can be found in the [examples](https://github.com/toptensoftware/cantabile-js/tree/main/examples) folder.