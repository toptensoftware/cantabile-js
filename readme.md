# cantabile-js

`cantabile-js` is a JavaScript library for controlling Cantabile - using either Node.JS or from a browser.

## Node.JS

To install `cantabile-js` using npm...

```bash
$ npm install --save toptensoftware/cantabile-js#v0.2
```

To create an instances:

```JavaScript
import { Cantabile } from "@toptensoftware/cantabile-js";

// Create an instance of the Cantabile object and connect it
let C = new Cantabile();
C.connect();
```

## Browser 

For use in a browser

```html
<script type="module">
    import { Cantabile } from "./lib/cantabile.js"
    let C = new Cantabile();
</script>
```

Note:

* assumes ES6 support and only works in modern compatible browsers.
* distribution files are available in the `./dist/` sub-folder of this repository.
* the library files have been renamed to `cantabile.js`/`cantabile.min.js` (previous versions were `cantabile-js.js`/`cantabile-js.min.js`)
* Cantabile's built-in web server includes a copy of the library (typically `http://localhost:35007/lib/cantabile.js`)

## Debug Logging

To enable debug logging, set the `DEBUG` environment variable to Cantabile.

```cmd
set DEBUG=Cantabile
node myProgram.js
```

## API Reference

Please [see here](http://www.cantabilesoftware.com/jsapi) for API documentation.

