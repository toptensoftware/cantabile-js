# cantabile-js

`cantabile-js` is a JavaScript library for controlling Cantabile - using either Node.JS or from a browser.

## Node.JS

To install `cantabile-js` using npm...

```bash
$ npm install --save "toptensoftware/cantabile-js"
```

To create an instances:

```JavaScript
const Cantabile = require('cantabile-js');

// Create an instance of the Cantabile object and connect it
let C = new Cantabile();
C.connect();
```

## Browser 

For use in a browser, Cantabile's build-in web server includes a copy of the same library:

```html
<!-- Import the Cantabile Javscript API library -->
<script src="/lib/cantabile-js.min.js"></script>
```

Which makes the `CantabileAPI` class available as the global `Cantabile`:

```JavaScript
<script>

    // Create an instance of the Cantabile object and connect it
    let C = new Cantabile();
    C.connect();

```

(Note the library assumes ES6 support and only works in modern compatible browsers).

## Debug Logging

To enable debug logging, set the `DEBUG` environment variable to Cantabile.

```cmd
set DEBUG=Cantabile
node myProgram.js
```

## API Reference

Please [see here](http://www.cantabilesoftware.com/jsapi) for API documentation.

