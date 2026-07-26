---
title: Getting Started
site:
    name: Cantabile JavaScript API
    logo: CantabileIcon.svg
---

# Cantabile-js

Welcome to Cantabile-js.

This library supports connecting to Cantabile's built-in network server providing
control and monitoring of Cantabile from NodeJS or a browser.

This is v0.3 of this library and is not backwards compatibile with previous versions.
Documentation for the old version is [available here](https://www.cantabilesoftware.com/jsapi-0.1).

For details on the underlying network api and protocol used by this library, 
[see here](https://www.cantabilesoftware.com/netapi).



## Installation

Cantabile-js is available available as an NPM package, or as a pre-built browser package.

The NPM packages are recommended for most projects.  For quick one off tests or browser
usage that needs to run from the file system, the browser packages can be used.


### NPM Package

Install the NPM package:

```bash
npm install toptensoftware/cantabile-js
```

To import

```js
import { Cantabile } from '@toptensoftware/cantabile-js';
```

To create a session instance:

```js
let C = new Cantabile("http://localhost:35007");
```



### Browser Package

Browser packages are [available here](https://github.com/toptensoftware/cantabile-js/releases).

To import: 

```html
<script src="https://github.com/toptensoftware/cantabile-js/releases/download/v0.3.4/cantabile.js"></script>
```

Note: the above will grab the library directly from the GitHub release.  It's recommended however
to download a copy of this file and keep it with your project.

To create a session instance:

```js
let C = new Cantabile("http://localhost:35007");
```


## Examples

Examples can be found in the [examples](https://github.com/toptensoftware/cantabile-js/tree/main/examples) folder.