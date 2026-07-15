---
title: Getting Started
site:
    name: Cantabile JavaScript API
    logo: CantabileIcon.svg
---

# Cantabile-JS

Welcome to Cantabile-js the Javascript API for connecting to Cantabile's built-in network server providing
control and monitoring of Cantabile from NodeJS or a browser.

## Installation

To install:

```bash
npm install toptensoftware/cantabile-js
```

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


