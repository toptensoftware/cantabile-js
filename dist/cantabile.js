var WebSocket = globalThis.WebSocket;

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;

	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */
	function setup(env) {
	  createDebug.debug = createDebug;
	  createDebug.default = createDebug;
	  createDebug.coerce = coerce;
	  createDebug.disable = disable;
	  createDebug.enable = enable;
	  createDebug.enabled = enabled;
	  createDebug.humanize = requireMs();
	  Object.keys(env).forEach(function (key) {
	    createDebug[key] = env[key];
	  });
	  /**
	  * Active `debug` instances.
	  */

	  createDebug.instances = [];
	  /**
	  * The currently active debug mode names, and names to skip.
	  */

	  createDebug.names = [];
	  createDebug.skips = [];
	  /**
	  * Map of special "%n" handling functions, for the debug "format" argument.
	  *
	  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	  */

	  createDebug.formatters = {};
	  /**
	  * Selects a color for a debug namespace
	  * @param {String} namespace The namespace string for the for the debug instance to be colored
	  * @return {Number|String} An ANSI color code for the given namespace
	  * @api private
	  */

	  function selectColor(namespace) {
	    var hash = 0;

	    for (var i = 0; i < namespace.length; i++) {
	      hash = (hash << 5) - hash + namespace.charCodeAt(i);
	      hash |= 0; // Convert to 32bit integer
	    }

	    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	  }

	  createDebug.selectColor = selectColor;
	  /**
	  * Create a debugger with the given `namespace`.
	  *
	  * @param {String} namespace
	  * @return {Function}
	  * @api public
	  */

	  function createDebug(namespace) {
	    var prevTime;

	    function debug() {
	      // Disabled?
	      if (!debug.enabled) {
	        return;
	      }

	      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      var self = debug; // Set `diff` timestamp

	      var curr = Number(new Date());
	      var ms = curr - (prevTime || curr);
	      self.diff = ms;
	      self.prev = prevTime;
	      self.curr = curr;
	      prevTime = curr;
	      args[0] = createDebug.coerce(args[0]);

	      if (typeof args[0] !== 'string') {
	        // Anything else let's inspect with %O
	        args.unshift('%O');
	      } // Apply any `formatters` transformations


	      var index = 0;
	      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
	        // If we encounter an escaped % then don't increase the array index
	        if (match === '%%') {
	          return match;
	        }

	        index++;
	        var formatter = createDebug.formatters[format];

	        if (typeof formatter === 'function') {
	          var val = args[index];
	          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

	          args.splice(index, 1);
	          index--;
	        }

	        return match;
	      }); // Apply env-specific formatting (colors, etc.)

	      createDebug.formatArgs.call(self, args);
	      var logFn = self.log || createDebug.log;
	      logFn.apply(self, args);
	    }

	    debug.namespace = namespace;
	    debug.enabled = createDebug.enabled(namespace);
	    debug.useColors = createDebug.useColors();
	    debug.color = selectColor(namespace);
	    debug.destroy = destroy;
	    debug.extend = extend; // Debug.formatArgs = formatArgs;
	    // debug.rawLog = rawLog;
	    // env-specific initialization logic for debug instances

	    if (typeof createDebug.init === 'function') {
	      createDebug.init(debug);
	    }

	    createDebug.instances.push(debug);
	    return debug;
	  }

	  function destroy() {
	    var index = createDebug.instances.indexOf(this);

	    if (index !== -1) {
	      createDebug.instances.splice(index, 1);
	      return true;
	    }

	    return false;
	  }

	  function extend(namespace, delimiter) {
	    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
	  }
	  /**
	  * Enables a debug mode by namespaces. This can include modes
	  * separated by a colon and wildcards.
	  *
	  * @param {String} namespaces
	  * @api public
	  */


	  function enable(namespaces) {
	    createDebug.save(namespaces);
	    createDebug.names = [];
	    createDebug.skips = [];
	    var i;
	    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
	    var len = split.length;

	    for (i = 0; i < len; i++) {
	      if (!split[i]) {
	        // ignore empty strings
	        continue;
	      }

	      namespaces = split[i].replace(/\*/g, '.*?');

	      if (namespaces[0] === '-') {
	        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	      } else {
	        createDebug.names.push(new RegExp('^' + namespaces + '$'));
	      }
	    }

	    for (i = 0; i < createDebug.instances.length; i++) {
	      var instance = createDebug.instances[i];
	      instance.enabled = createDebug.enabled(instance.namespace);
	    }
	  }
	  /**
	  * Disable debug output.
	  *
	  * @api public
	  */


	  function disable() {
	    createDebug.enable('');
	  }
	  /**
	  * Returns true if the given mode name is enabled, false otherwise.
	  *
	  * @param {String} name
	  * @return {Boolean}
	  * @api public
	  */


	  function enabled(name) {
	    if (name[name.length - 1] === '*') {
	      return true;
	    }

	    var i;
	    var len;

	    for (i = 0, len = createDebug.skips.length; i < len; i++) {
	      if (createDebug.skips[i].test(name)) {
	        return false;
	      }
	    }

	    for (i = 0, len = createDebug.names.length; i < len; i++) {
	      if (createDebug.names[i].test(name)) {
	        return true;
	      }
	    }

	    return false;
	  }
	  /**
	  * Coerce `val`.
	  *
	  * @param {Mixed} val
	  * @return {Mixed}
	  * @api private
	  */


	  function coerce(val) {
	    if (val instanceof Error) {
	      return val.stack || val.message;
	    }

	    return val;
	  }

	  createDebug.enable(createDebug.load());
	  return createDebug;
	}

	common = setup;
	return common;
}

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {

		function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

		/* eslint-env browser */

		/**
		 * This is the web browser implementation of `debug()`.
		 */
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		/**
		 * Colors.
		 */

		exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */
		// eslint-disable-next-line complexity

		function useColors() {
		  // NB: In an Electron preload script, document will be defined but not fully
		  // initialized. Since we know we're in Chrome, we'll just detect this case
		  // explicitly
		  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		    return true;
		  } // Internet Explorer and Edge do not support colors.


		  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		    return false;
		  } // Is webkit? http://stackoverflow.com/a/16459606/376773
		  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


		  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
		  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
		  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
		  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
		}
		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */


		function formatArgs(args) {
		  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

		  if (!this.useColors) {
		    return;
		  }

		  var c = 'color: ' + this.color;
		  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
		  // arguments passed either before or after the %c, so we need to
		  // figure out the correct index to insert the CSS into

		  var index = 0;
		  var lastC = 0;
		  args[0].replace(/%[a-zA-Z%]/g, function (match) {
		    if (match === '%%') {
		      return;
		    }

		    index++;

		    if (match === '%c') {
		      // We only are interested in the *last* %c
		      // (the user may have provided their own)
		      lastC = index;
		    }
		  });
		  args.splice(lastC, 0, c);
		}
		/**
		 * Invokes `console.log()` when available.
		 * No-op when `console.log` is not a "function".
		 *
		 * @api public
		 */


		function log() {
		  var _console;

		  // This hackery is required for IE8/9, where
		  // the `console.log` function doesn't have 'apply'
		  return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
		}
		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */


		function save(namespaces) {
		  try {
		    if (namespaces) {
		      exports.storage.setItem('debug', namespaces);
		    } else {
		      exports.storage.removeItem('debug');
		    }
		  } catch (error) {// Swallow
		    // XXX (@Qix-) should we be logging these?
		  }
		}
		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */


		function load() {
		  var r;

		  try {
		    r = exports.storage.getItem('debug');
		  } catch (error) {} // Swallow
		  // XXX (@Qix-) should we be logging these?
		  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


		  if (!r && typeof process !== 'undefined' && 'env' in process) {
		    r = process.env.DEBUG;
		  }

		  return r;
		}
		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */


		function localstorage() {
		  try {
		    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		    // The Browser also has localStorage in the global context.
		    return localStorage;
		  } catch (error) {// Swallow
		    // XXX (@Qix-) should we be logging these?
		  }
		}

		module.exports = requireCommon()(exports);
		var formatters = module.exports.formatters;
		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
		  try {
		    return JSON.stringify(v);
		  } catch (error) {
		    return '[UnexpectedJSONParseError]: ' + error.message;
		  }
		}; 
	} (browser, browser.exports));
	return browser.exports;
}

var browserExports = requireBrowser();
var _debug = /*@__PURE__*/getDefaultExportFromCjs(browserExports);

var eventemitter3 = {exports: {}};

var hasRequiredEventemitter3;

function requireEventemitter3 () {
	if (hasRequiredEventemitter3) return eventemitter3.exports;
	hasRequiredEventemitter3 = 1;
	(function (module) {

		var has = Object.prototype.hasOwnProperty
		  , prefix = '~';

		/**
		 * Constructor to create a storage for our `EE` objects.
		 * An `Events` instance is a plain object whose properties are event names.
		 *
		 * @constructor
		 * @private
		 */
		function Events() {}

		//
		// We try to not inherit from `Object.prototype`. In some engines creating an
		// instance in this way is faster than calling `Object.create(null)` directly.
		// If `Object.create(null)` is not supported we prefix the event names with a
		// character to make sure that the built-in object properties are not
		// overridden or used as an attack vector.
		//
		if (Object.create) {
		  Events.prototype = Object.create(null);

		  //
		  // This hack is needed because the `__proto__` property is still inherited in
		  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
		  //
		  if (!new Events().__proto__) prefix = false;
		}

		/**
		 * Representation of a single event listener.
		 *
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
		 * @constructor
		 * @private
		 */
		function EE(fn, context, once) {
		  this.fn = fn;
		  this.context = context;
		  this.once = once || false;
		}

		/**
		 * Add a listener for a given event.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} once Specify if the listener is a one-time listener.
		 * @returns {EventEmitter}
		 * @private
		 */
		function addListener(emitter, event, fn, context, once) {
		  if (typeof fn !== 'function') {
		    throw new TypeError('The listener must be a function');
		  }

		  var listener = new EE(fn, context || emitter, once)
		    , evt = prefix ? prefix + event : event;

		  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
		  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
		  else emitter._events[evt] = [emitter._events[evt], listener];

		  return emitter;
		}

		/**
		 * Clear event by name.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} evt The Event name.
		 * @private
		 */
		function clearEvent(emitter, evt) {
		  if (--emitter._eventsCount === 0) emitter._events = new Events();
		  else delete emitter._events[evt];
		}

		/**
		 * Minimal `EventEmitter` interface that is molded against the Node.js
		 * `EventEmitter` interface.
		 *
		 * @constructor
		 * @public
		 */
		function EventEmitter() {
		  this._events = new Events();
		  this._eventsCount = 0;
		}

		/**
		 * Return an array listing the events for which the emitter has registered
		 * listeners.
		 *
		 * @returns {Array}
		 * @public
		 */
		EventEmitter.prototype.eventNames = function eventNames() {
		  var names = []
		    , events
		    , name;

		  if (this._eventsCount === 0) return names;

		  for (name in (events = this._events)) {
		    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
		  }

		  if (Object.getOwnPropertySymbols) {
		    return names.concat(Object.getOwnPropertySymbols(events));
		  }

		  return names;
		};

		/**
		 * Return the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Array} The registered listeners.
		 * @public
		 */
		EventEmitter.prototype.listeners = function listeners(event) {
		  var evt = prefix ? prefix + event : event
		    , handlers = this._events[evt];

		  if (!handlers) return [];
		  if (handlers.fn) return [handlers.fn];

		  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
		    ee[i] = handlers[i].fn;
		  }

		  return ee;
		};

		/**
		 * Return the number of listeners listening to a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Number} The number of listeners.
		 * @public
		 */
		EventEmitter.prototype.listenerCount = function listenerCount(event) {
		  var evt = prefix ? prefix + event : event
		    , listeners = this._events[evt];

		  if (!listeners) return 0;
		  if (listeners.fn) return 1;
		  return listeners.length;
		};

		/**
		 * Calls each of the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Boolean} `true` if the event had listeners, else `false`.
		 * @public
		 */
		EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return false;

		  var listeners = this._events[evt]
		    , len = arguments.length
		    , args
		    , i;

		  if (listeners.fn) {
		    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

		    switch (len) {
		      case 1: return listeners.fn.call(listeners.context), true;
		      case 2: return listeners.fn.call(listeners.context, a1), true;
		      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
		      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
		      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
		      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
		    }

		    for (i = 1, args = new Array(len -1); i < len; i++) {
		      args[i - 1] = arguments[i];
		    }

		    listeners.fn.apply(listeners.context, args);
		  } else {
		    var length = listeners.length
		      , j;

		    for (i = 0; i < length; i++) {
		      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

		      switch (len) {
		        case 1: listeners[i].fn.call(listeners[i].context); break;
		        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
		        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
		        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
		        default:
		          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
		            args[j - 1] = arguments[j];
		          }

		          listeners[i].fn.apply(listeners[i].context, args);
		      }
		    }
		  }

		  return true;
		};

		/**
		 * Add a listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.on = function on(event, fn, context) {
		  return addListener(this, event, fn, context, false);
		};

		/**
		 * Add a one-time listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.once = function once(event, fn, context) {
		  return addListener(this, event, fn, context, true);
		};

		/**
		 * Remove the listeners of a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn Only remove the listeners that match this function.
		 * @param {*} context Only remove the listeners that have this context.
		 * @param {Boolean} once Only remove one-time listeners.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return this;
		  if (!fn) {
		    clearEvent(this, evt);
		    return this;
		  }

		  var listeners = this._events[evt];

		  if (listeners.fn) {
		    if (
		      listeners.fn === fn &&
		      (!once || listeners.once) &&
		      (!context || listeners.context === context)
		    ) {
		      clearEvent(this, evt);
		    }
		  } else {
		    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
		      if (
		        listeners[i].fn !== fn ||
		        (once && !listeners[i].once) ||
		        (context && listeners[i].context !== context)
		      ) {
		        events.push(listeners[i]);
		      }
		    }

		    //
		    // Reset the array, or remove it completely if we have no more listeners.
		    //
		    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
		    else clearEvent(this, evt);
		  }

		  return this;
		};

		/**
		 * Remove all listeners, or those of the specified event.
		 *
		 * @param {(String|Symbol)} [event] The event name.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
		  var evt;

		  if (event) {
		    evt = prefix ? prefix + event : event;
		    if (this._events[evt]) clearEvent(this, evt);
		  } else {
		    this._events = new Events();
		    this._eventsCount = 0;
		  }

		  return this;
		};

		//
		// Alias methods names because people roll like that.
		//
		EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
		EventEmitter.prototype.addListener = EventEmitter.prototype.on;

		//
		// Expose the prefix.
		//
		EventEmitter.prefixed = prefix;

		//
		// Allow `EventEmitter` to be imported as module namespace.
		//
		EventEmitter.EventEmitter = EventEmitter;

		//
		// Expose the module.
		//
		{
		  module.exports = EventEmitter;
		} 
	} (eventemitter3));
	return eventemitter3.exports;
}

var eventemitter3Exports = requireEventemitter3();
var EventEmitter = /*@__PURE__*/getDefaultExportFromCjs(eventemitter3Exports);

const debug$1 = _debug('Cantabile');


/**
 * Common functionality for all end point handlers
 *
 * @class EndPoint
 * @extends EventEmitter
 */
class EndPoint extends EventEmitter
{
	// Private constructor
	constructor(owner, endPoint)
	{
		super();
		if (this.setMaxListeners)
			this.setMaxListeners(owner.options.maxListeners);
		this.#owner = owner;
		this.#endPoint = endPoint;
		this.#owner.on('connected', () => this.#onSessionConnected());
		this.#owner.on('disconnected', () => this.#onSessionDisconnected());
		this.#prepareConnectPromise();
	}

	#owner;
	#connectCount = 0;
	#connectPromise;
	#connectPromiseResolve;
	#connectPromiseReject;
	#endPoint;
	#epid = null;
	#data = null;

	/**
	 * Gets the owning session of this end point
	 * @property owner
	 * @type {Cantabile}
	 */
	get owner() { return this.#owner; }

	/**
	 * Gets the end point url for this endpoint
	 * @property endPoint
	 * @type {string}
	 */
	get endPoint() { return this.#endPoint; }

	/**
	 * Gets the last received raw data for this end point
	 * @property endPoint
	 * @type {string}
	 */
	get data() { return this.#data; }

	// internal setter
	_setData(value) { this.#data = value; }

	// Prepares a new promise that will be resolved
	// when this end point has initially connected
	#prepareConnectPromise()
	{
		this.#connectPromise = new Promise((resolve, reject) => {
			this.#connectPromiseResolve = resolve;
			this.#connectPromiseReject = reject;
		});
	}

	/**
	 * Connects this end point and starts listening for events. 
	 * 
	 * Usually this method doesn't need to be called since the session
	 * object normally automatically connects end point objects when
	 * first accessed
	 * 
	 * @method connect
	 * @returns {Promise} A promise that resolves when connected
	 */
	connect()
	{
		this.#connectCount++;

		if (this.#connectCount == 1 && this.owner.state == "connected")
		{
			this.#onSessionConnected();
		}

		return this.#connectPromise;
	}

	/**
	 * Disconnect this end point and stops listening for events.
	 *
	 * Usually this method should never be used
	 * 
	 * @method disconnect
	 */
	disconnect()
	{
		// Reduce the connected reference count
		this.#connectCount--;
		if (this.#connectCount > 0)
			return;

		if (this.#epid)
		{
			// Send the close message
			this.owner.send({
				method: "close",
				epid: this.#epid,
			});

			// Remove end point event handler
			this.owner._revokeEndPointEventHandler(this.#epid);

			// Prepare the next connection promise
			this.#prepareConnectPromise();
		}

		this._onDisconnected();

		this.#epid = null;
		this.#data = null;
	}

	send(method, endPoint, data)
	{
		if (this.#epid)
		{
			// If connected, pass the epid and just the sub-url path
			return this.owner.send({
				ep: endPoint,
				epid: this.#epid,
				method: method,
				data: data,
			});
		}
		else
		{
			// If not connected, need to specify the full end point url
			return this.owner.send({
				ep: EndPoint.joinPath(this.endPoint, endPoint),
				method: method,
				data: data,
			});
		}
	}

	request(method, endPoint, data)
	{
		if (this.#epid)
		{
			// If connected, pass the epid and just the sub-url path
			return this.owner.request({
				ep: endPoint,
				epid: this.#epid,
				method: method,
				data: data,
			});
		}
		else
		{
			// If not connected, need to specify the full end point url
			return this.owner.request({
				ep: EndPoint.joinPath(this.endPoint, endPoint),
				method: method,
				data: data,
			});
		}
	}

	post(endPoint, data)
	{
		return this.request('post', endPoint, data);
	}

	get(endPoint)
	{
		return this.request('get', endPoint);
	}

	/**
	 * Checks if this end point is current connected
     * @property isConnected
	 * @type {Boolean}
	 */
	get isConnected() { return !!this.#epid }

	/**
	 * Checks if this end point will connect when the session connects
     * @property willConnect
	 * @type {Boolean}
	 */
	get willConnect() { return this.#connectCount > 0 }

	/**
	 * Returns a promise that will be resolved when this end point is opened
	 * 
	 * @example
	 * 
	 *     let C = new Cantabile();
	 *     await C.application.waitForConnected();
	 *
	 * @method waitForConnected
	 * @returns {Promise}
	 */
	waitForConnected()
	{
		return this.#connectPromise;
	}


	async #onSessionConnected()
	{
		try
		{
			if (this.#connectCount == 0)
				return;
				
			var msg = await this.owner.request(
			{ 
				method: "open",
				ep: this.endPoint,
			});

			this.#epid = msg.epid;
			this.#data = msg.data;
			this.owner._registerEndPointEventHandler(this.#epid, this);

			this._onConnected();

			// Resolve connect promise
			this.#connectPromiseResolve(this);
		}
		catch (err)
		{
			this.#connectPromiseReject(err);
			debug$1(err);
		}
	}

	#onSessionDisconnected()
	{
		if (this.#epid)
		{
			this.owner._revokeEndPointEventHandler(this.#epid);
			this.#prepareConnectPromise();
		}
		this.#epid = null;
		this.#data = null;
		this._onDisconnected();
	}

	_onConnected()
	{
	}

	_onDisconnected()
	{
	}

	_dispatchEventMessage(eventName, data)
	{
		if (this["_onEvent_" + eventName])
		{
			this["_onEvent_" + eventName](data);
		}
	}

	// Helper to correctly join two paths ensuring only a single slash between them
	static joinPath(a,b)
	{
		while (a.endsWith('/'))
			a = a.substr(0, a.length - 1);
		while (b.startsWith('/'))
			b = b.substr(1);
		return `${a}/${b}`;
	}


}

_debug('Cantabile');

/**
 * Used to access and control Cantabile's set list functionality.
 * 
 * Access this object via the {{#crossLink "Cantabile/setList:property"}}{{/crossLink}} property.
 *
 * @class SetList
 * @extends EndPoint
 */
class SetList extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/setlist");
		this._currentSong = null;
	}

	_onConnected()
	{
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');
		this.emit('preLoadedChanged');
	}

	_onDisconnected()
	{
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');
		this.emit('preLoadedChanged');
	}

	/**
	 * An array of {{#crossLink "SetListItem"}}{{/crossLink}} items in the set list
	 * @property items
	 * @type {SetListItem[]}
	 */
	get items() { return this.data ? this.data.items : null; }

	/**
	 * The display name of the current set list (ie: its file name with path and extension removed)
	 * @property name
	 * @type {String} 
	 */
	get name() { return this.data ? this.data.name : null; }

	/**
	 * Indicates if the set list is currently pre-loaded
	 * @property preLoaded
	 * @type {Boolean}
	 */
	get preLoaded() { return this.data ? this.data.preLoaded : false; }

	/**
	 * The index of the currently loaded song (or -1 if the current song isn't in the set list).
	 * See also {{#crossLink "SetList/currentSong:property"}}{{/crossLink}}.
	 * @property currentSongIndex
	 * @type {Number}
	 */
	get currentSongIndex() 
	{ 
		if (!this._currentSong)
			return -1;
		if (!this.data)
			return -1;
		return this.data.items.indexOf(this._currentSong); 
	}

	/**
	 * The currently loaded {{#crossLink "SetListItem"}}{{/crossLink}} (or null if the current song isn't in the set list).
	 * See also {{#crossLink "SetList/currentSongIndex:property"}}{{/crossLink}}.
	 * @property currentSong
	 * @type {SetListItem}
	 */
	get currentSong() { return this._currentSong; }

	/**
	 * Load the song at a given index position
	 * @method loadSongByIndex
	 * @param {Number} index The zero based index of the song to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadSongByIndex(index, delayed)
	{
		this.post("/loadSongByIndex", {
			index: index,
			delayed: delayed,
		});
	}

	/**
	 * Load the song with a given program number
	 * @method loadSongByProgram
	 * @param {Number} index The zero based program number of the song to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadSongByProgram(pr, delayed)
	{
		this.post("/loadSongByProgram", {
			pr: pr,
			delayed: delayed,
		});
	}

	/**
	 * Load the first song in the set list
	 * @method loadFirstSong
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadFirstSong(delayed)
	{
		this.post("/loadFirstSong", {
			delayed: delayed,
		});
	}

	/**
	 * Load the last song in the set list
	 * @method loadLastSong
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadLastSong(delayed)
	{
		this.post("/loadLastSong", {
			delayed: delayed,
		});
	}

	/**
	 * Load the next or previous song in the set list
	 * @method loadNextSong
	 * @param {Number} direction Direction to move (1 = next, -1 = previous)
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 * @param {Boolean} [wrap=false] Whether to wrap around at the start/end of the list
	 */
	loadNextSong(direction, delayed, wrap)
	{
		this.post("/loadNextSong", {
			direction: direction,
			delayed: delayed,
			wrap: wrap,
		});
	}

	/**
	 * Gets a list of available set lists in the user's set list folder
	 * @method available
	 * @returns {String[]} An array of set list names (relative to user's set list folder, extension removed)
	 */
	async available()
	{
		return (await this.get("/available")).data.setLists;
	}

	/**
	 * Loads the specified set list from the user's set list folder
	 * @method loadSetList
	 * @param {String} name Name of the set to load (relative to user's set list folder, without extension)
	 * @param {Boolean} loadFirst True to load the first song in the set list (default = true)
	 */
	loadSetList(name, loadFirst = true)
	{
		this.post("/loadSetList", {
			name, 
			loadFirst
		});
	}


	_resolveCurrentSong()
	{
		// Check have data and current index is in range and record the current song
		if (this.data && this.data.current>=0 && this.data.current < this.data.items.length)
		{
			this._currentSong = this.data.items[this.data.current];
		}
		else
		{
			this._currentSong = null;
		}
	}

	_onEvent_setListChanged(data)
	{
		this._setData(data);
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');
		this.emit('preLoadedChanged');
	}

	_onEvent_itemAdded(data)
	{
		this.data.items.splice(data.index, 0, data.item);
		this.emit('itemAdded', data.index);
		this.emit('changed');

		/**
		 * Fired after a new item has been added to the set list
		 *
		 * @event itemAdded
		 * @param {Number} index The zero based index of the newly added item 
		 */

		/**
		 * Fired when anything about the contents of the set list changes
		 *
		 * @event changed
		 */

	}
	_onEvent_itemRemoved(data)
	{
		this.data.items.splice(data.index, 1);		
		this.emit('itemRemoved', data.index);
		this.emit('changed');

		/**
		 * Fired after an item has been removed from the set list
		 *
		 * @event itemRemoved
		 * @param {Number} index The zero based index of the removed item 
		 */

	}
	_onEvent_itemMoved(data)
	{
		var item = this.data.items[data.from];
		this.data.items.splice(data.from, 1);		
		this.data.items.splice(data.to, 0, item);
		this.emit('itemMoved', data.from, data.to);
		this.emit('changed');

		/**
		 * Fired when an item in the set list has been moved
		 *
		 * @event itemMoved
		 * @param {Number} from The zero based index of the item before being moved
		 * @param {Number} to The zero based index of the item's new position
		 */
	}

	_onEvent_itemChanged(data)
	{
		if (this.currentSongIndex == data.index)
			this._currentSong = data.item;

		this.data.items.splice(data.index, 1, data.item);		// Don't use [] so Vue can handle it

		this.emit('itemChanged', data.index);
		this.emit('changed');

		/**
		 * Fired when something about an item has changed
		 *
		 * @event itemChanged
		 * @param {Number} index The zero based index of the item that changed
		 */

	}
	_onEvent_itemsReload(data)
	{
		this.data.items = data.items;
		this.data.current = data.current;
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');

		/**
		 * Fired when the entire set list has changed (eg: after a sort operation, or loading a new set list)
		 * 
		 * @event reload
		 */
	}

	_onEvent_preLoadedChanged(data)
	{
		this.data.preLoaded = data.preLoaded;
		this.emit('preLoadedChanged');

		/**
		 * Fired when the pre-loaded state of the list has changed
		 * 
		 * @event preLoadedChanged
		 */
	}

	_onEvent_currentSongChanged(data)
	{
		this.data.current = data.current;
		this._resolveCurrentSong();
		this.emit('currentSongChanged');

		/**
		 * Fired when the currently loaded song changes
		 * 
		 * @event currentSongChanged
		 */
	}

	_onEvent_currentSongPartChanged(data)
	{
		this.emit('currentSongPartChanged', data.part, data.partCount);

		/**
		 * Fired when the part of the currently loaded song changes
		 * 
		 * @event currentSongPartChanged
		 * @param {Number} part The zero-based current song part index (can be -1)
		 * @param {Number} partCount The number of parts in the current song
		 */
	}

	_onEvent_nameChanged(data)
	{
		if (this.data)
			this.data.name = data ? data.name : null;
		this.emit('nameChanged');
		this.emit('changed');

		/**
		 * Fired when the name of the currently loaded set list changes
		 * 
		 * @event nameChanged
		 */
	}
}

_debug('Cantabile');

/**
 * Base states functionality for State and racks
 * 
 * @class States
 * @extends EndPoint
 */
class States extends EndPoint
{
	constructor(owner, endPoint)
	{
		super(owner, endPoint);
		this._currentState = null;
	}

	_onConnected()
	{
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
	}

	_onDisconnected()
	{
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
	}

	/**
	 * An array of {{#crossLink "State"}}{{/crossLink}} items
	 * @property items
	 * @type {State[]}
	 */
	get items() { return this.data ? this.data.items : null; }

	/**
	 * The display name of the containing song or rack
	 * @property name
	 * @type {String} 
	 */
	get name() { return this.data ? this.data.name : null; }

	/**
	 * The index of the currently loaded State (or -1 if no active state).
	 * See also {{#crossLink "States/currentState:property"}}{{/crossLink}}.
	 * @property currentStateIndex
	 * @type {Number}
	 */
	get currentStateIndex() 
	{ 
		if (!this._currentState)
			return -1;
		if (!this.data)
			return -1;
		return this.data.items.indexOf(this._currentState); 
	}

	/**
	 * The currently loaded {{#crossLink "State"}}{{/crossLink}} (or null if no active state).
	 * See also {{#crossLink "States/currentStateIndex:property"}}{{/crossLink}}.
	 * @property currentState
	 * @type {State}
	 */
	get currentState() { return this._currentState; }

	/**
	 * Load the State at a given index position
	 * @method loadStateByIndex
	 * @param {Number} index The zero based index of the State to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadStateByIndex(index, delayed)
	{
		this.post("/loadStateByIndex", {
			index: index,
			delayed: delayed,
		});
	}

	/**
	 * Load the State with a given program number
	 * @method loadStateByProgram
	 * @param {Number} index The zero based program number of the State to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadStateByProgram(pr, delayed)
	{
		this.post("/loadStateByProgram", {
			pr: pr,
			delayed: delayed,
		});
	}

	/**
	 * Load the first state
	 * @method loadFirstState
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadFirstState(delayed)
	{
		this.post("/loadFirstState", {
			delayed: delayed,
		});
	}

	/**
	 * Load the last state
	 * @method loadLastState
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadLastState(delayed)
	{
		this.post("/loadLastState", {
			delayed: delayed,
		});
	}

	/**
	 * Load the next or previous state
	 * @method loadNextState
	 * @param {Number} direction Direction to move (1 = next, -1 = previous)
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 * @param {Boolean} [wrap=false] Whether to wrap around at the start/end
	 */
	loadNextState(direction, delayed, wrap)
	{
		this.post("/loadNextState", {
			direction: direction,
			delayed: delayed,
			wrap: wrap,
		});
	}


	_resolveCurrentState()
	{
		// Check have data and current index is in range and record the current State
		if (this.data && this.data.current>=0 && this.data.current < this.data.items.length)
		{
			this._currentState = this.data.items[this.data.current];
		}
		else
		{
			this._currentState = null;
		}
	}

	_onEvent_songChanged(data)
	{
		this._setData(data);
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
	}

	_onEvent_itemAdded(data)
	{
		this.data.items.splice(data.index, 0, data.item);
		this.emit('itemAdded', data.index);
		this.emit('changed');

		/**
		 * Fired after a new state has been added
		 *
		 * @event itemAdded
		 * @param {Number} index The zero based index of the newly added item 
		 */

		/**
		 * Fired when anything about the contents of state list changes
		 *
		 * @event changed
		 */

	}
	_onEvent_itemRemoved(data)
	{
		this.data.items.splice(data.index, 1);		
		this.emit('itemRemoved', data.index);
		this.emit('changed');

		/**
		 * Fired after a state has been removed
		 *
		 * @event itemRemoved
		 * @param {Number} index The zero based index of the removed item 
		 */

	}
	_onEvent_itemMoved(data)
	{
		var item = this.data.items[data.from];
		this.data.items.splice(data.from, 1);		
		this.data.items.splice(data.to, 0, item);
		this.emit('itemMoved', data.from, data.to);
		this.emit('changed');

		/**
		 * Fired when an item has been moved
		 *
		 * @event itemMoved
		 * @param {Number} from The zero based index of the item before being moved
		 * @param {Number} to The zero based index of the item's new position
		 */
	}

	_onEvent_itemChanged(data)
	{
		if (this.currentStateIndex == data.index)
			this._currentState = data.item;

		this.data.items.splice(data.index, 1, data.item);		// Don't use [] so Vue can handle it

		this.emit('itemChanged', data.index);
		this.emit('changed');

		/**
		 * Fired when something about an state has changed
		 *
		 * @event itemChanged
		 * @param {Number} index The zero based index of the item that changed
		 */

	}
	_onEvent_itemsReload(data)
	{
		this.data.items = data.items;
		this.data.current = data.current;
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');

		/**
		 * Fired when the entire set of states has changed (eg: after a sort operation, or loading a new song/rack)
		 * 
		 * @event reload
		 */
	}

	_onEvent_currentStateChanged(data)
	{
		this.data.current = data.current;
		this._resolveCurrentState();
		this.emit('currentStateChanged');

		/**
		 * Fired when the current state changes
		 * 
		 * @event currentStateChanged
		 */
	}

	_onEvent_nameChanged(data)
	{
		if (this.data)
			this.data.name = data ? data.name : null;
		this.emit('nameChanged');
		this.emit('changed');

		/**
		 * Fired when the name of the containing song or rack changes
		 * 
		 * @event nameChanged
		 */
	}
}

/**
 * Interface to the states of the current song
 * 
 * Access this object via the {{#crossLink "Cantabile/songStates:property"}}{{/crossLink}} property.
 *
 * @class SongStates
 * @extends States
 */
class SongStates extends States
{
	constructor(owner)
	{
		super(owner, "/api/songStates");
	}
}

/**
 * Provides access to information about the currently active set of key ranges
 * 
 * Access this object via the {{#crossLink "Cantabile/keyRanges:property"}}{{/crossLink}} property.
 *
 * @class KeyRanges
 * @extends EndPoint
 */
class KeyRanges extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/keyranges");
	}

	_onConnected()
	{
		/**
		 * Fired when the active set of key ranges has changed
		 *
		 * @event changed
		 */
		this.emit('changed');
	}

	_onDisconnected()
	{
		this.emit('changed');
	}

	/**
	 * An array of {{#crossLink "KeyRange"}}{{/crossLink}} items
	 * @property items
	 * @type {KeyRange[]}
	 */
	get items() { return this.data ? this.data.items : null; }

	_onEvent_keyRangesChanged(data)
	{
		this._setData(data);
		this.emit('changed');
	}
}

/**
 * Used to access the current set of show notes
 * 
 * Access this object via the {{#crossLink "Cantabile/showNotes:property"}}{{/crossLink}} property.
 *
 * @class ShowNotes
 * @extends EndPoint
 */
class ShowNotes extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/shownotes");
	}

	_onConnected()
	{
		this.emit('reload');
		this.emit('changed');
	}

	_onDisconnected()
	{
		this.emit('reload');
		this.emit('changed');
	}

	/**
	 * An array of {{#crossLink "ShowNote"}}{{/crossLink}} items
	 * @property items
	 * @type {ShowNote[]}
	 */
	get items() { return this.data ? this.data.items : null; }

	_onEvent_itemAdded(data)
	{
		this.data.items.splice(data.index, 0, data.item);
		this.emit('itemAdded', data.index);
		this.emit('changed');

		/**
		 * Fired after a new show note has been added
		 *
		 * @event itemAdded
		 * @param {Number} index The zero based index of the newly added item 
		 */

		/**
		 * Fired when anything about the current set of show notes changes
		 *
		 * @event changed
		 */

	}
	_onEvent_itemRemoved(data)
	{
		this.data.items.splice(data.index, 1);		
		this.emit('itemRemoved', data.index);
		this.emit('changed');

		/**
		 * Fired after a show note has been removed
		 *
		 * @event itemRemoved
		 * @param {Number} index The zero based index of the removed item 
		 */

	}
	_onEvent_itemMoved(data)
	{
		var item = this.data.items[data.from];
		this.data.items.splice(data.from, 1);		
		this.data.items.splice(data.to, 0, item);
		this.emit('itemMoved', data.from, data.to);
		this.emit('changed');

		/**
		 * Fired when an show note has been moved
		 *
		 * @event itemMoved
		 * @param {Number} from The zero based index of the item before being moved
		 * @param {Number} to The zero based index of the item's new position
		 */
	}

	_onEvent_itemChanged(data)
	{
		this.data.items.splice(data.index, 1, data.item);		// Don't use [] so Vue can handle it

		this.emit('itemChanged', data.index);
		this.emit('changed');

		/**
		 * Fired when something about an show note has changed
		 *
		 * @event itemChanged
		 * @param {Number} index The zero based index of the item that changed
		 */

	}
	_onEvent_itemsReload(data)
	{
		this.data.items = data.items;
		this.emit('reload');
		this.emit('changed');

		/**
		 * Fired when the entire set of show notes has changed (eg: after  loading a new song)
		 * 
		 * @event reload
		 */
	}
}

_debug('Cantabile');

/**
 * Represents a monitored pattern string.

 * Returned from the {{#crossLink "Variables/watch:method"}}{{/crossLink}} method.
 *
 * @class PatternWatcher
 * @extends EventEmitter
 */
class PatternWatcher extends EventEmitter
{
	constructor(owner, pattern, listener)
	{
		super();
		this.owner = owner;
		this._pattern = pattern;	
		this._patternId = 0;
		this._resolved = "";
		this._listener = listener;
	}

	/**
	 * Returns the pattern string being watched
	 *
	 * @property pattern
	 * @type {String} 
	 */
	get pattern() { return this._pattern; }

	/**
	 * Returns the current resolved display string
	 *
	 * @property resolved
	 * @type {String} 
	 */
	get resolved() { return this._resolved; }

	_start()
	{
		this.owner.post("/watch", {
			pattern: this._pattern,
		}).then(r => {
			if (r.data.patternId)
			{
				this.owner._registerPatternId(r.data.patternId, this);
				this._patternId = r.data.patternId;
			}
			this._resolved = r.data.resolved;
			this._fireChanged();
		});
	}

	_stop()
	{
		if (this.owner._epid && this._patternId)
		{
			this.owner.send("POST", "/unwatch", { patternId: this._patternId});
			this.owner._revokePatternId(this._patternId);
			this._patternId = 0;
			this._resolved = "";
			this._fireChanged();
		}
	}

	/**
	 * Stops monitoring this pattern string for changes
	 *
	 * @method unwatch
	 */
	unwatch()
	{
		this._stop();
		this.owner._revokeWatcher(this);
	}

	_update(data)
	{
		this._resolved = data.resolved;
		this._fireChanged();
	}

	_fireChanged()
	{
		// Function listener?
		if (this._listener)
			this._listener(this.resolved, this);

		/**
		 * Fired when the resolved display string has changed
		 *
		 * @event changed
		 * @param {String} resolved The new resolved display string
		 * @param {PatternWatcher} source This object
		 */
		this.emit('changed', this.resolved, this);
	}
}



/**
 * Provides access to Cantabile's internal variables by allowing a pattern string to be
 * expanded into a final display string.
 * 
 * Access this object via the {{#crossLink "Cantabile/variables:property"}}{{/crossLink}} property.
 *
 * @class Variables
 * @extends EndPoint
 */
class Variables extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/variables");
		this.watchers = [];
		this.patternIds = {};
	}


	/**
	 * Resolves a variable pattern string into a final display string
	 * 
	 * @example
	 * 
	 *     let C = new Cantabile();
	 *     console.log(await C.variables.resolve("Song: $(SongTitle)"));
	 * 
	 * @example
	 * 
	 *     let C = new Cantabile();
	 *     C.variables.resolve("Song: $(SongTitle)").then(r => console.log(r)));
	 *
	 * @method resolve
	 * @returns {Promise<String>} A promise to provide the resolved string
	 */
	async resolve(pattern)
	{
		await this.owner.waitForConnected();

		return (await this.post("/resolve", {
			pattern: pattern
		})).data.resolved;
	}

	_onConnected()
	{
		for (let i=0; i<this.watchers.length; i++)
		{
			this.watchers[i]._start();
		}
	}

	_onDisconnected()
	{
		for (let i=0; i<this.watchers.length; i++)
		{
			this.watchers[i]._stop();
		}
	}

	/**
	 * Starts watching a pattern string for changes
	 * 
	 * @example
	 * 
	 * Using a callback function:
	 * 
	 *     let C = new Cantabile();
	 *     
	 *     // Watch a string pattern using a callback function
	 *     C.variables.watch("Song: $(SongTitle)", function(resolved) {
	 *         console.log(resolved);
	 *     })
	 *     
	 * 	   // The "variables" end point must be opened before callbacks will happen
	 *     C.variables.open();
	 * 
	 * @example
	 * 
	 * Using the PatternWatcher class and events:
	 * 
	 *     let C = new Cantabile();
	 *     let watcher = C.variables.watch("Song: $(SongTitle)");
	 *     watcher.on('changed', function(resolved) {
	 *         console.log(resolved);
	 *     });
	 *     
	 * 	   // The "variables" end point must be opened before callbacks will happen
	 *     C.variables.open();
	 *     
	 *     /// later, stop listening
	 *     watcher.unwatch();
	 *
	 * @method watch
	 * @param {String} pattern The string pattern to watch
	 * @param {Function} [callback] Optional callback function to be called when the resolved display string changes.
	 * 
	 * The callback function has the form function(resolved, source) where resolved is the resolved display string and source
	 * is the {{#crossLink "PatternWatcher"}}{{/crossLink}} instance.
	 *
	 * @returns {PatternWatcher}
	 */
	watch(pattern, listener)
	{
		let w = new PatternWatcher(this, pattern, listener);
		this.watchers.push(w);
		if (this.isConnected)
			w._start();

		return w;
	}

	_registerPatternId(patternId, watcher)
	{
		this.patternIds[patternId] = watcher;
	}

	_revokePatternId(patternId)
	{
		delete this.patternIds[patternId];
	}

	_revokeWatcher(w)
	{
		this.watchers = this.watchers.filter(x=>x != w);
	}

	_onEvent_patternChanged(data)
	{
		// Get the watcher
		let w = this.patternIds[data.patternId];
		if (w)
		{
			w._update(data);
		}
	}
}

_debug('Cantabile');

/**
 * Represents a monitored controller

 * Returned from the {{#crossLink "OnscreenKeyboard/watch:method"}}{{/crossLink}} method.
 *
 * @class ControllerWatcher
 * @extends EventEmitter
 */
class ControllerWatcher extends EventEmitter
{
	constructor(owner, channel, kind, controller, listener)
	{
		super();
		this.owner = owner;
		this._channel = channel;	
		this._kind = kind;
		this._controller = controller;
		this._value = null;
		this._listener = listener;
	}

	/**
	 * Returns the MIDI channel number of controller being watched
	 *
	 * @property channel
	 * @type {Number} 
	 */
	 get channel() { return this._channel; }

	/**
	 * Returns the kind of controller being watched
	 *
	 * @property kind
	 * @type {String} 
	 */
	 get kind() { return this._kind; }

	/**
	 * Returns the number of the controller being watched
	 *
	 * @property controller
	 * @type {Number} 
	 */
	 get controller() { return this._controller; }

	 /**
	 * Returns the current value of the controller
	 *
	 * @property value
	 * @type {Number} 
	 */
	get value() { return this._value; }

	_start()
	{
		this.owner.post("/watchController", {
			channel: this._channel,
			kind: this._kind,
			controller: this._controller,
		}).then(r => {
			if (r.data.id)
			{
				this.owner._registerWatcher(r.data.id, this);
				this._id = r.data.id;
			}
			this._value = r.data.value;
			this._fireChanged();
		});
	}

	_stop()
	{
		if (this.owner._epid && this._id)
		{
			this.owner.send("POST", "/unwatch", { id: this._id});
			this.owner._revokeWatcher(this._id);
			this._id = 0;
			this._value = null;
			this._fireChanged();
		}
	}

	/**
	 * Stops monitoring this controller for changes
	 *
	 * @method unwatch
	 */
	unwatch()
	{
		this._stop();
		this.owner._revokeWatcher(this);
	}

	_update(data)
	{
		this._value = data.value;
		this._fireChanged();
	}

	_fireChanged()
	{
		// Function listener?
		if (this._listener)
			this._listener(this._value, this);

		/**
		 * Fired when the controller value has changed
		 *
		 * @event controllerChanged
		 * @param {Number} value The new value of the controller
		 * @param {ControllerWatcher} source This object
		 */
		this.emit('controllerChanged', this._value, this);
	}
}



/**
 * Provides access to controllers managed by Cantabile's on-screen keyboard device
 * 
 * Access this object via the {{#crossLink "Cantabile/onscreenKeyboard:property"}}{{/crossLink}} property.
 *
 * @class OnscreenKeyboard
 * @extends EndPoint
 */
class OnscreenKeyboard extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/onscreenKeyboard");
		this.watchers = [];
		this.ids = {};
	}


	/**
	 * Queries the on-screen keyboard for the current value of a controller
	 * 
	 * @example
	 * 
	 * 	   // Get the value of cc 64 on channel 1
	 *     let C = new Cantabile();
	 *     console.log(await C.onscreenKeyboard.queryController(1, "controller", 64));
	 * 
	 * @example
	 * 
	 *     let C = new Cantabile();
	 *     C.onscreenKeyboard.queryController(1, "controller", 64).then(r => console.log(r)));
	 *
	 * @method queryController
	 * @param {Number} channel 		The MIDI channel number of the controller
	 * @param {String} kind 		The MIDI controller kind
	 * @param {Number} controller	The number of the controller
	 * @returns {Promise<Number>} A promise to provide the controller value
	 */
	async queryController(channel, kind, controller)
	{
		await this.owner.waitForConnected();

		return (await this.post("/queryController", {
			channel: channel,
			kind: kind,
			controller: controller || 0,
		})).data.value;
	}

	_onConnected()
	{
		for (let i=0; i<this.watchers.length; i++)
		{
			this.watchers[i]._start();
		}
	}

	_onDisconnected()
	{
		for (let i=0; i<this.watchers.length; i++)
		{
			this.watchers[i]._stop();
		}
	}

	/**
	 * Starts watching a controller for changes
	 * 
	 * @example
	 * 
	 * Using a callback function:
	 * 
	 *     let C = new Cantabile();
	 *     
	 *     // Watch a controller using a callback function
	 *     C.onscreenKeyboard.watchController(1, "controller", 64, function(value) {
	 *         console.log(value);
	 *     })
	 *     
	 * 	   // The "onscreenKeyboard" end point must be opened before callbacks will happen
	 *     C.onscreenKeyboard.open();
	 * 
	 * @example
	 * 
	 * Using the ControllerWatcher class and events:
	 * 
	 *     let C = new Cantabile();
	 *     let watcher = C.onscreenKeyboard.watchController(1, "controller", 64);
	 *     watcher.on('changed', function(value) {
	 *         console.log(value);
	 *     });
	 *     
	 *     // The "onscreenKeyboard" end point must be opened before callbacks will happen
	 *     C.onscreenKeyboard.open();
	 *     
	 *     /// later, stop listening
	 *     watcher.unwatch();
	 *
	 * @method watch
	 * @param {Number} channel 		The MIDI channel number of the controller
	 * @param {String} kind 		The MIDI controller kind
	 * @param {Number} controller	The number of the controller
	 * @param {Function} [callback] Optional callback function to be called when the controller value changes.
	 * 
	 * The callback function has the form function(value, source) where value is the controller value and source
	 * is the {{#crossLink "ControllerWatcher"}}{{/crossLink}} instance.
	 *
	 * @returns {ControllerWatcher}
	 */
	watch(channel, kind, controller, listener)
	{
		let w = new ControllerWatcher(this, channel, kind, controller, listener);
		this.watchers.push(w);

		if (this.isConnected)
			w._start();

		return w;
	}

	/**
	 * Inject MIDI from the on-screen keyboard device
	 * 
	 * @method injectMidi
	 * @param {object} data		An array of bytes or a MidiControllerEvent
	 * 
	 * @example
	 * 
	 * Using a callback function:
	 * 
	 *     // Send a note on event
	 *     C.onscreenKeyboard.inject([0x90, 64, 64]);
	 * 
	 * @example
	 * 
	 * Using the MidiControllerEvent
	 * 
	 *     // Send Midi CC 23 = 127
	 *     let watcher = C.onscreenKeyboard.inject({
	 *          channel: 0,
	 *          kind: "controller",
	 *          controller: 23,
	 *          value: 127,
	 *     });
	 *
	 */
	 injectMidi(data)
	 {
		this.post("/injectMidi", {
			value: data
		});		 
	 }

	_registerWatcher(id, watcher)
	{
		this.ids[id] = watcher;
	}

	_revokeWatcher(id)
	{
		delete this.ids[id];
	}

	_revokeWatcher(w)
	{
		this.watchers = this.watchers.filter(x=>x != w);
	}

	_onEvent_controllerChanged(data)
	{
		// Get the watcher
		let w = this.ids[data.id];
		if (w)
		{
			w._update(data);
		}
	}
}

_debug('Cantabile');

/**
 * Represents an watched binding point for changes/invocations

 * Returned from the {{#crossLink "Bindings/watch:method"}}{{/crossLink}} method.
 * 
 * @class BindingWatcher
 * @extends EventEmitter
 */
class BindingWatcher extends EventEmitter
{
	constructor(owner, bindingPoint, callback)
	{
		super();
		this.owner = owner;
		this.#bindingPoint = bindingPoint;
        this.#callback = callback;
        this.#value = null;
	}

	#bindingPoint;
	#callback;
	#value;
	#watchId;

	/**
	 * Returns the binding point being listened to
	 *
	 * @property bindingPoint
	 * @type {BindingPoint} 
	 */
	get bindablePoint() { return this.#bindingPoint; }

	/**
	 * Returns the last received value for the source binding point
	 *
	 * @property value
	 * @type {Object} 
	 */
    get value() { return this.#value; }
    
	_start()
	{
		this.owner.post("/watch", this.#bindingPoint).then(r => {
            this.owner._registerWatchId(r.data.watchId, this);
			this.#watchId = r.data.watchId;
			if (r.data.value !== null && r.data.value !== undefined)
			{
				this.#value = r.data.value;
				this.#fireInvoked();
			}
		});
	}

	_stop()
	{
		if (this.owner._epid && this.#watchId)
		{
			this.owner.send("POST", "/unwatch", { watchId: this.#watchId});
			this.owner._revokeWatchId(this.#watchId);
			this.#watchId = 0;
			if (this.#value !== null && this.#value !== undefined)
			{
				this.#value = null;
				this.#fireInvoked();
			}
		}
	}

	/**
	 * Stops monitoring this binding source
	 *
	 * @method unwatch
	 */
	unwatch()
	{
		this._stop();
		this.owner._revokeWatcher(this);
	}

	_update(data)
	{
		this.#value = data.value;
		this.#fireInvoked();
	}

	#fireInvoked()
	{
		// Function listener?
		if (this.#callback)
			this.#callback(this.#value, this);

		/**
		 * Fired when the source binding point is triggered
		 *
		 * @event invoked
		 * @param {Object} value The value supplied from the source binding
		 * @param {BindingWatcher} source This object
		 */
		this.emit('invoked', this.value, this);
	}
}


/**
 * Represents a target binding point prepared for multiple invocations

 * Returned from the {{#crossLink "Bindings/prepare:method"}}{{/crossLink}} method.
 * 
 * @class PreparedBindingPoint
 */
class PreparedBindingPoint
{
	constructor(owner, bindingPoint)
	{
		this.owner = owner;
		this.#bindingPoint = bindingPoint;
		this.#prepareConnectPromise();
	}

	#bindingPoint;
	#prepId = 0;
	#connectPromise;
	#connectPromiseResolve;
	#connectPromiseReject;

	// Prepares a new promise that will be resolved
	// when this end point has initially connected
	#prepareConnectPromise()
	{
		this.#connectPromise = new Promise((resolve, reject) => {
			this.#connectPromiseResolve = resolve;
			this.#connectPromiseReject = reject;
		});
	}

	_start()
	{
		this.owner.post("/prepare", this.#bindingPoint)
			.then(r => {
				this.#prepId = r.data.prepId;
				this.#connectPromiseResolve();
			})
			.catch((err) => {
				this.#connectPromiseReject(err);
			});
	}

	_stop()
	{
		if (this.owner._epid && this.#prepId)
		{
			this.owner.send("POST", "/unprepare", { prepId: this.#prepId });
			this.#prepId = 0;
			this.#prepareConnectPromise();
		}
	}

	/**
	 * Returns a promise that will resolve once this prepared binding has connected
	 * @method waitForConnected
	 * @returns {Promise}}
	 */
	waitForConnected()
	{
		return this.#connectPromise;
	}

	/**
	 * Check if this binding point is currently connected and ready to accept invocations
	 * 
	 * @property isConnected
	 * @type {Boolean}
	 */
	get isConnected()
	{
		return this.#prepId != 0;
	}

	/**
	 * Releases this prepared binding point
	 *
	 * @method unprepare
	 */
	unprepare()
	{
		this._stop();
		this.owner._revokePrepped(this);
	}

	/**
	 * Invokes this binding point
	 * @method invoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Promise} A promise that resolves once the target binding point has been invoked
	 */
	invoke(value)
	{
		if (this.#prepId == 0)
			throw new Error("Prepared binding point not (yet?) connected");

        return this.owner.request("POST", "/preparedInvoke", {
			prepId: this.#prepId,
			value
        });
	}

	/**
	 * Tries to invokes this binding point
	 * @method tryInvoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Boolean|Promise} False if not currently connected, or a promise that resolves once the target 
	 *                            binding point has been invoked
	 */
	tryInvoke(value)
	{
		if (!this.isConnected)
			return false;
		return this.invoke(value);
	}

}

let allowedBindingPointProps = new Set([ "bindableId", "bindingPointId", "bindableParams", "bindingPointParams" ]);

function checkBindingPoint(bp)
{
	if (!bp.bindableId)
		throw new Error("Invalid binding point, must have a field `bindableId`");
	if (!bp.bindingPointId)
		throw new Error("Invalid binding point, must have a field `bindingPointId`");

	Object.keys(bp).forEach(key => {
		if (!allowedBindingPointProps.has(key))
			throw new Error(`Invalid binding point, '${key}' is not allowed`);
	});
}

/**
 * Provides access to Cantabile's binding points.
 * 
 * Access this object via the {{#crossLink "Cantabile/bindings:property"}}{{/crossLink}} property.
 *
 * @class Bindings
 * @extends EndPoint
 */
class Bindings extends EndPoint
{
    constructor(owner)
    {
        super(owner, "/api/Bindings4");
    }

	#watchers = [];
	#prepped = [];
	#watchIds = {};

    _onConnected()
    {
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._start();
		}
		for (let i=0; i<this.#prepped.length; i++)
		{
			this.#prepped[i]._start();
		}
    }

    _onDisconnected()
    {
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._stop();
		}
		for (let i=0; i<this.#prepped.length; i++)
		{
			this.#prepped[i]._stop();
		}
    }


    /**
     * Retrieves a list of available binding points
	 * 
	 * If Cantabile is running on your local machine you can view this list
	 * directly at <http://localhost:35007/api/bindings/vailableBindingPoints>
     * 
     * @example
     * 
     *     let C = new Cantabile();
     *     console.log(await C.bindings.getAvailableBindingPoints());
     * 
     * @method getAvailableBindingPoints
     * @returns {Promise<BindingPointEntry[]>} A promise to return an array of {{#crossLink "BindingPointEntry"}}{{/crossLink}} objects
     */
    async getAvailableBindingPoints()
    {
        await this.owner.waitForConnected();
        return (await this.request("GET", "/availableBindingPoints")).data;
    }

    /**
     * Retrieves additional information about a specific binding point
	 * 
     * @example
     * 
     *     let C = new Cantabile();
     *     console.log(await C.bindings.getBindingPointInfo("setList", "loadSongByProgram", false, {}, {}));
     * 
     * @method getBindingPointInfo
	 * @param {BindingPoint} bindingPoint the binding point to be queried
	 * @param {Boolean} source whether to return information about the source or target version of the binding point
     * @returns {Promise<BindingPointInfo>} A promise to return a {{#crossLink "BindingPointInfo"}}{{/crossLink}} object
     */
	async getBindingPointInfo(bindablePoint, source)
	{
		checkBindingPoint();
        await this.owner.waitForConnected();
        return (await this.request("GET", "/bindingPointInfo", {
			...bindingPoint,
			source,
		})).data;
	}

    /**
     * Invokes a target binding point
     * 
     * If Cantabile is running on your local machine a full list of available binding
     * points is [available here](http://localhost:35007/api/bindings/availableBindingPoints)
     * 
     * @example
     * 
     * Set the master output level gain
	 * 
     *     C.bindings.invoke({ 
	 * 			bindableId: "masterLevels", 
	 * 			bindingPointId: "outputGain"
	 * 	   }, 0.5);
     * 
     * @example
     * 
     * Suspend the 2nd plugin in the song
	 * 
     *     C.bindings.invoke({ 
	 * 			bindableId: "indexedPlugin", 
	 * 			bindableParams: { 
	 * 				rackIndex: 0, 			// 0 = song, 1 = first rack, 2 = second etc...
	 * 				pluginIndex: 1, 		// 1 = second plugin (zero based)
	 * 			}
	 * 			bindingPointId: "suspend"
	 *     }, true);
     * 
	 * 
	 * @example
	 * 
	 * Sending a MIDI Controller Event
	 * 
	 *     C.bindings.invoke({
	 * 			bindableId: "midiPorts", 
	 * 			bindingPointId: "out.Main Keyboard",
	 * 			bindingPointParams: {
	 *         		kind: "Controller",
	 *         		controller: 10,
	 * 		   		channel: 0
	 * 	   		}
	 *      }, 65);
	 *
	 * @example
	 * 
	 * Sending MIDI Data directly
	 * 
	 *     C.bindings.invoke({
	 * 			bindiableId: "midiPorts", 
	 *          bindingPointId: "out.Main Keyboard"
	 * 	   }, [ 0xb0, 23, 99 ]);
	 * 
	 * @example
	 * 
	 * Sending MIDI Sysex Data directly
	 * 
	 *     C.bindings.invoke({
	 * 			bindiableId: "midiPorts", 
	 *          bindingPointId: "out.Main Keyboard"
	 * 	   }, [ 0xF7, 0x00, 0x00, 0x00, 0xF0 ]);
	 * 
     * @method invoke
     * @param {BindingPoint} bindablePoint The binding point to invoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Promise} A promise that resolves once the target binding point has been invoked
     */
    invoke(bindingPoint, value)
    {
		checkBindingPoint();
        return this.request("POST", "/invoke", {
			...bindingPoint,
			value
        });
    }

    /**
     * Queries a source binding point for it's current value.
     *
     * @example
     * 
     *     console.log("Current Output Gain:", await C.bindings.query({ 
	 *         bindableId: "masterLevels", 
	 *         bindingPointId: "outputGain"
     *     }));
     * 
	 * @method query
     * @param {BindingPoint} bindingPoint The binding point to query
	 * @returns {Promise<Object>} The current value of the binding source
     */
    async query(bindingPoint)
    {
		checkBindingPoint(bindingPoint);
        return (await this.request("POST", "/query", bindingPoint)).data.value;
    }

	/**
	 * Starts watching a source binding point for changes (or invocations)
	 * 
	 * @example
	 * 
	 * Using a callback function:
	 * 
	 *     let C = new Cantabile();
	 *     
	 *     // Watch a source binding point using a callback function
	 *     C.bindings.watch({
	 *         bindableId: "masterLevels", 
	 *         bindingPointId: "outputGain",
	 *     }, (value) => console.log("Master output gain changed to:", value));
	 *     
	 * @example
	 * 
	 * Using the BindingWatcher class and events:
	 * 
	 *     let C = new Cantabile();
	 *     let watcher = C.bindings.watch({
	 *         bindableId: "masterLevels", 
	 *         bindingPointId: "outputGain",
	 *     });
	 *     watcher.on('invoked', function(value) {
	 *         console.log("Master output gain changed to:", value);
	 *     });
	 *     
	 *     /// later, stop listening
	 *     watcher.unwatch();
	 * 
	 * @example
	 * 
	 * Watching for a MIDI event:
	 * 
     *     C.bindings.watch({
	 *         bindableId: "midiPorts", 
	 *         bindingPointId: "in.Onscreen Keyboard", 
	 *         bindingPointParams: {
     *             channel: 0,
     *             kind: "ProgramChange",
     *             controller: -1,
     *     }, (value) => console.log("Program Change: ", value));
	 * 
	 * @example

	 * Watching for a keystroke:
	 * 
	 *     C.bindings.watch({
	 *         bindableId: "pckeyboard", 
	 *         bindingPointId: "keyPress", 
	 *         bindingPointParams:  {
	 *             key: "Ctrl+Alt+M"
	 * 	       },
	 *     }, () => console.log("Key press!"));
	 * 
	 *
	 * @method watch
     * @param {BindingPoint} bindingPoint The binding point to watch
	 * @param {Function} [callback] Optional callback function to be called when the source binding triggers
	 * 
	 * The callback function has the form function(value, source) where value is the new binding point value and source
	 * is the BindingWatcher instance.
	 * 
	 * @returns {BindingWatcher}
	 */
	watch(bindingPoint, callback)
	{
		checkBindingPoint(bindingPoint);
		let w = new BindingWatcher(this, bindingPoint, callback);
		this.#watchers.push(w);

		if (this.isConnected)
			w._start();

		return w;
	}

	/**
	 * Prepares a target binding point for multiple invocations
	 * 
	 * @method prepare
     * @param {BindingPoint} bindingPoint The binding point to invoke
	 * @returns {PreparedBindingPoint}
	 */
	prepare(bindingPoint)
	{
		checkBindingPoint(bindingPoint);

		var p = new PreparedBindingPoint(this, bindingPoint);
		this.#prepped.push(p);
		if (this.isConnected)
			p._start();
		return p;
	}

	_registerWatchId(watchId, watcher)
	{
		this.#watchIds[watchId] = watcher;
	}

	_revokeWatchId(watchId)
	{
		delete this.#watchIds[watchId];
	}

	_revokeWatcher(w)
	{
		let index = this.#watchers.indexOf(w);
		if (index >= 0)
			this.#watchers.splice(index, 1);
	}

	_revokePrepped(p)
	{
		let index = this.#prepped.indexOf(p);
		if (index >= 0)
			this.#prepped.splice(index, 1);
	}

	_onEvent_invoked(data)
	{
		// Get the watcher
		let w = this.#watchIds[data.watchId];
		if (w)
		{
			w._update(data);
		}
	}
}

/**
 * Provides access to Cantabile's UI commands
 * 
 * Access this object via the {{#crossLink "Cantabile/commands:property"}}{{/crossLink}} property.
 *
 * @class Commands
 * @extends EndPoint
 */
class Commands extends EndPoint
{
    constructor(owner)
    {
        super(owner, "/api/commands");
    }

    _onConnected()
    {
    }

    _onDisconnected()
    {
    }


    /**
     * Retrieves a list of available commands
	 * 
	 * If Cantabile is running on your local machine you can view this list
	 * directly at <http://localhost:35007/api/commands/availableCommands>
     * 
     * @example
     * 
     *     let C = new Cantabile();
     *     console.log(await C.commands.availableCommands());
     * 
     * @method availableCommands
     * @returns {Promise<CommandInfo[]>} A promise to return an array of {{#crossLink "CommandInfo"}}{{/crossLink}} objects
     */
    async availableCommands()
    {
        await this.owner.waitForConnected();
        return (await this.request("GET", "/availableCommands")).data;
    }

    /**
     * Invokes a command
     * 
     * @example
     * 
     * Show the file open dialog
	 * 
     *     C.commands.invoke("file.open");
     * 
     * @param {String} id The id of the command to invoke
     * @method invoke
     * @returns {Promise} A promise that resolves once the target command has been invoked
     */
    async invoke(id)
    {
        return (await this.request("POST", "/invoke", {
            id: id,
        }));
    }
}

/**
 * Interface to the current song
 * 
 * Access this object via the {{#crossLink "Cantabile/song:property"}}{{/crossLink}} property.
 *
 * @class Song
 * @extends EndPoint
 */
class Song extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/song");
	}

	_onConnected()
	{
		/**
		 * Fired when anything about the current song changes
		 *
		 * @event changed
		 */
		this.emit('changed');

		/**
		 * Fired when the name of the current song changes
		 *
		 * @event nameChanged
		 */
		this.emit('nameChanged');

		/**
		 * Fired when the current song state changes
		 *
		 * @event currentStateChanged
		 */
		this.emit('currentStateChanged');
	}

	_onDisconnected()
	{
		this.emit('changed');
		this.emit('nameChanged');
		this.emit('currentStateChanged');
	}

	/**
	 * The name of the current song
	 * @property name
	 * @type {String}
	 */
	get name() { return this.data ? this.data.name : null; }

	/**
	 * The set list program number of the song (or -1 if not in set list, or not set)
	 * @property pr
	 * @type {Number}
	 */
	get pr() { return this.data ? this.data.pr : null; }

	/**
	 * The name of the current song state
	 * @property currentState
	 * @type {String}
	 */
	get currentState() { return this.data ? this.data.currentState : null; }

	/**
	 * Gets a list of available songs in the user's songs folder
	 * @method available
	 * @returns {String[]} An array of song names (relative to user's song folder, extension removed)
	 */
	async available()
	{
		return (await this.get("/available")).data.songs;
	}

	/**
	 * Loads the specified song from the user's song folder
	 * @method loadSong
	 * @param {String} name Name of the song to load (relative to user's song folder, without extension)
	 * @param {String} state Optional name of state to load, or null.
	 */
	loadSong(name, state)
	{
		this.post("/loadSong", {
			name, 
			state
		});
	}



	_onEvent_songChanged(data)
	{
		this._setData(data);
		this.emit('changed');
		this.emit('nameChanged');
		this.emit('currentStateChanged');
	}

	_onEvent_nameChanged(data)
	{
		this.data.name = data.name;
		this.emit('changed');
		this.emit('nameChanged');
	}

	_onEvent_currentStateChanged(data)
	{
		this.data.currentState = data.currentState;
		this.emit('changed');
		this.emit('currentStateChanged');
	}

}

/**
 * Interface to the master transport
 * 
 * Access this object via the {{#crossLink "Cantabile/transport:property"}}{{/crossLink}} property.
 *
 * @class Transport
 * @extends EndPoint
 */
class Transport extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/transport");
	}

	_onConnected()
	{
        this.emit('stateChanged');
        this.emit('loopStateChanged');
        this.emit('timeSignatureChanged');
        this.emit('tempoChanged');
    }

	_onDisconnected()
	{
        this.emit('stateChanged');
        this.emit('loopStateChanged');
        this.emit('timeSignatureChanged');
        this.emit('tempoChanged');
	}

	/**
	 * Gets or sets the current transport state.  Supported values include "playing", "paused" or "stopped".
	 * Setting this property calls {{#crossLink "Transport/play:method"}}{{/crossLink}},
	 * {{#crossLink "Transport/pause:method"}}{{/crossLink}}, or
	 * {{#crossLink "Transport/stop:method"}}{{/crossLink}} accordingly.
	 * @property state
	 * @type {String}
	 */
    get state() { return this.data ? this.data.state : "stopped"; }
    set state(value)
    {
        if (this.state == value)
            return;
        switch (value)
        {
            case "playing": this.play(); break;
            case "paused": this.pause(); break;
            case "stopped": this.stop(); break;
        }
    }

	/**
	 * Gets the current time signature numerator
	 * @property timeSignatureNum
	 * @type {Number}
	 */
    get timeSignatureNum() { return this.data ? this.data.timeSigNum : 0 }

	/**
	 * Gets the current time signature denominator
	 * @property timeSignatureDen
	 * @type {Number}
	 */
    get timeSignatureDen() { return this.data ? this.data.timeSigDen : 0 }

	/**
	 * Gets the current time signature as a string (eg: "3/4")
	 * @property timeSignature
	 * @type {String}
	 */
    get timeSignature() { return this.data ? this.data.timeSigNum + "/" + this.data.timeSigDen : "-" }

	/**
	 * Gets the current tempo
	 * @property tempo
	 * @type {Number}
	 */
    get tempo() { return this.data ? this.data.tempo : 0 }

	/**
	 * Gets or sets the current loopMode ("auto", "break", "loopOnce" or "loop").
	 * Changes fire the {{#crossLink "Transport/loopStateChanged:event"}}{{/crossLink}} event.
	 * @property loopMode
	 * @type {String}
	 */
    get loopMode() { return this.data ? this.data.loopMode : "none" }

    set loopMode(value)
    {
        if (this.loopMode == value)
            return;

        this.post("/setLoopMode", { loopMode: value });
    }

	/**
	 * Gets the current loopCount
	 * @property loopCount
	 * @type {Number}
	 */
    get loopCount() { return this.data ? this.data.loopCount : -1 }

	/**
	 * Gets the current loopIteration
	 * @property loopIteration
	 * @type {Number}
	 */
    get loopIteration() { return this.data ? this.data.loopIteration : -1 }

    _onEvent_stateChanged(data)
	{
		/**
		 * Fired when the current transport state has changed
		 *
		 * @event stateChanged
		 */

        this.data.state = data.state;
		this.emit('stateChanged');
    }

    _onEvent_timeSigChanged(data)
    {
		/**
		 * Fired when the current time signature has changed
		 *
		 * @event timeSignatureChanged
		 */

        this.data.timeSigNum = data.timeSigNum;
        this.data.timeSigDen = data.timeSigDen;
        this.emit('timeSignatureChanged');
    }
    
    _onEvent_tempoChanged(data)
    {
        /**
		 * Fired when the current tempo has changed
		 *
		 * @event tempoChanged
		 */

        this.data.tempo  = data.tempo;
        this.emit('tempoChanged');
    }
    
    _onEvent_loopStateChanged(data)
	{
		/**
		 * Fired when the current loop mode, loop iteration or loop count has changed
		 *
		 * @event loopStateChanged
		 */

        Object.assign(this.data, data);
		this.emit('loopStateChanged');
    }


    /**
	 * Starts transport playback
	 * @method play
	 */
    play()
    {
        if (this.state != "playing")
            this.post("/play", {});
    }

	/**
	 * Toggles between play and pause states
	 * @method togglePlayPause
	 */
    togglePlayPause()
    {
        if (this.state == "playing")
            this.pause();
        else
            this.play();
    }

	/**
	 * Toggles pause and play states (unless stopped)
	 * @method togglePause
	 */
    togglePause()
    {
        if (this.state == "paused")
            this.play();
        else if (this.state == "playing")
            this.pause();
    }

    /**
	 * Toggles play and stopped states
	 * @method togglePlay
	 */
    togglePlay()
    {
        if (this.state == "stopped")
            this.play();
        else
            this.stop();
    }

	/**
	 * Toggles between play and stop states
	 * @method togglePlayStop
	 */
    togglePlayStop()
    {
        if (this.state != "playing")
            this.play();
        else
            this.stop();
    }

	/**
	 * Pauses the master transport
	 * @method pause
	 */
    pause()
    {
        if (this.state != "paused")
            this.post("/pause", {});
    }

	/**
	 * Stops the master transport
	 * @method stop
	 */
    stop()
    {
        if (this.state != "stopped")
            this.post("/stop", {});
    }

	/**
	 * Cycles between the various loop modes
	 * @method cycleLoopMode
	 */
    cycleLoopMode()
    {
        switch (this.loopMode)
        {
            case "auto":
                this.loopMode = "break";
                break;

            case "break":
                this.loopMode = "loopOnce";
                break;

            case "loopOnce":
                this.loopMode = "loop";
                break;

            case "loop":
                this.loopMode = "auto";
                break;
        }
    }

}

/**
 * Interface to the application object
 * 
 * Access this object via the {{#crossLink "Cantabile/application:property"}}{{/crossLink}} property.
 *
 * @class Application
 * @extends EndPoint
 */
class Application extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/application");
	}

	_onConnected()
	{
		/**
		 * Fired when any of the application properties change
		 * 
		 * @event changed
		 */

		/**
		 * Fired when the application object has initially connected
		 * 
		 * @event connected
		 */

		this.emit('connected');
		this.emit('busyChanged', this.busy);
		this.emit('changed');
	}

	_onDisconnected()
	{
		this.emit('busyChanged', this.busy);
		this.emit('changed');
	}

	/**
	 * The application's company name
	 * @property companyName
	 * @type {String}
	 */
	get companyName() { return this.data ? this.data.companyName : null; }

	/**
	 * The application name
	 * @property name
	 * @type {String}
	 */
	get name() { return this.data ? this.data.name : null; }

	/**
	 * The application version string
	 * @property version
	 * @type {String}
	 */
	get version() { return this.data ? this.data.version : null; }

	/**
	 * The application edition string
	 * @property edition
	 * @type {String}
	 */
	get edition() { return this.data ? this.data.edition : null; }

	/**
	 * The application's copyright message
	 * @property copyright
	 * @type {String}
	 */
	get copyright() { return this.data ? this.data.copyright : null; }

	/**
	 * The application's build number
	 * @property build
	 * @type {Number}
	 */
	get build() { return this.data ? this.data.build : null; }

	/**
	 * An array of {{#crossLink "ColorEntry"}}{{/crossLink}} items for the color index table
	 * @property colors
	 * @type {ColorEntry[]}
	 */
	get colors() { return this.data ? this.data.colors : null; }

	 /**
	 * The application's busy status
	 * @property busy
	 * @type {Boolean}
	 */
	get busy() { return this.data ? this.data.busy : false; }


	/**
	 * The base program number (0 or 1)
	 * @property baseProgramNumber
	 * @type {Number}
	 */
	get baseProgramNumber() { return this.data ? this.data.baseProgramNumber : null; }

	/**
	 * The preferred banked program display format - "SeparateBanks","CombinedBanks","Plain" or "ZeroPadded"
	 * @property bankedProgramNumberFormat
	 * @type {String}
	 */
	get bankedProgramNumberFormat() { return this.data ? this.data.bankedProgramNumberFormat : null; }

	 _onEvent_busyChanged(data)
	{
		/**
		 * Fired when the application busy state changes
		 * 
		 * @event busyChanged
		 * @param {Boolean} busy True if the app is currently busy
		 */

		this.data.busy = data.busy;
		this.emit('busyChanged', this.busy);
	}


}

var fetch = globalThis.fetch;

/**
 * Provides access to Cantabile's engine object for start/stop control
 *
 * Access this object via the {{#crossLink "Cantabile/engine:property"}}{{/crossLink}} property.
 *
 * @class Engine
 */
class Engine
{
    constructor(owner)
    {
		this.owner = owner;
    }

	/**
	 * Returns a promise to provide the started state of Cantabile's audio engine.
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method isStarted
	 * @returns {Promise<Boolean>}
	 */
	 async isStarted()
	{
		let f = await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/")).then(r => r.json());
		return f.isStarted;
	}

	/**
	 * Starts Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method start
	 * @returns {Promise}
	 */
	async start()
	{
		await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/start"), { method: "POST" });
	}

	/**
	 * Stops Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method stop
	 * @returns {Promise}
	 */
	async stop()
	{
		await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/stop"), { method: "POST" });
	}

	/**
	 * Restarts Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method restart
	 * @returns {Promise}
	 */
	 async restart()
	 {
		 await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/restart"), { method: "POST" });
	 }

 	/**
	 * Toggles the audio engine between started and stopped
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method startStop
	 * @returns {Promise}
	 */
	  async startStop()
	  {
		  await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/startStop"), { method: "POST" });
	  }

  }

const debug = _debug('Cantabile');

/**
* Represents a connection to Cantabile.
* 
* @class Cantabile
* @extends EventEmitter
* @constructor
* @param {String} [host] The host to connect to. This can be either <baseaddress> or http://<baseaddress> or ws://<baseaddress>
* When running in a browser, the defaults to `${window.location.host}`.  In other environments it defaults to 
`localhost:35007`.  
*/
class Cantabile extends EventEmitter
{
	/**
	 * Creates a new Cantabile network session
	 * @constructor 
	 * @param {Object} options configuration options
	 * @param {string} [host] the host to connect to (defaults to browser url, or localhost:35007)
	 * @param {boolean} [autoConnect=true] if true automatically initiates connection
	 * @param {boolean} [autoConnectEndPoints=true] if true automatically connects end point objects when accessed
	 * @param {number} [maxListeners=30] set the max event listeners for this object (if supported)
	 */
	constructor(options)
	{
		super();

		// Host string as options
		if (typeof(options) === 'string')
		{
			options = { host: options };
		}

		// Resolve defaultl options
		options = Object.assign({
			maxListeners: 30,
			autoConnect: true,
			autoConnectEndPoints: true,
		}, options);

		// Store options
		this.#options = options;

		// Setup max listeners
		if (this.setMaxListeners)
			this.setMaxListeners(options.maxListeners);

		// Initialize host
		this.#setHost(options.host);

		// Connection
		this.shouldConnect = false;
		this.#prepareConnectPromise();
		this.#setState("disconnected");
		this.autoConnectEndPoints = options.autoConnectEndPoints;

		if (options.autoConnect)
			this.connect();
	}

	#options;
	#host;
	#socketUrl;
	#state;
	#ws;
	#nextRid = 1;
	#pendingResponseHandlers = {};
	#endPointEventHandlers = {};
	#connectPromise;
	#connectPromiseResolve;
	#connectPromiseReject;

	// Resolve host string to host url and socket url
	#setHost(value)
	{
		if (!value && true)
			value = window.location.host;
		if (!value)
			value = "localhost";

		// Crack protocol
		let secure = false;
		if (value.startsWith("https://"))
		{
			secure = true;
			value = value.substring(8);
		}
		else if (value.startsWith("wss://"))
		{
			secure = true;
			value = value.substring(6);
		}
		else if (value.startsWith("http://"))
		{
			value = value.substring(7);
		}
		else if (value.startsWith("ws://"))
		{
			value = value.substring(5);
		}

		// Remove trailing slashes
		while (value.endsWith('/'))
			value = value.substring(0, value.length - 1);

		// Remove socket url
		if (value.endsWith("/api/socket"))
			value = value.substring(0, value.length - 11);

		// Ensure port
		if (value.indexOf(':') < 0)
		{
			let slashPos = value.indexOf('/');
			if (slashPos < 0)
				value += ":35007";
			else
				value = value.substring(0, slashPos) + ':35007' + value.substring(slashPos);
		}

		// Build final http and ws url
		this.#host = (secure ? "https://" : "http://") + value;
		this.#socketUrl = (secure ? "wss://" : "ws://") + value + "/api/socket/";
	}

	// Create a promise that will be resolved when connection succeeds
	#prepareConnectPromise()
	{
		this.#connectPromise = new Promise((resolve, reject) => {
			this.#connectPromiseResolve = resolve;
			this.#connectPromiseReject = reject;
		});
	}

	/**
	 * Gets the resolved options object used to construct this object
	 * @property options
	 * @type {Object}
	 */
	get options()
	{
		return this.#options;
	}

	/**
	 * The current connection state, either "connecting", "connected" or "disconnected"
	 *
	 * @property state
	 * @type {String} 
	 */
	get state()
	{
		return this.#state;
	}

	/**
	 * Initiate connection and retry if fails until success
	 * @method connect
	 * @returns {Promise} a promise that resolves when connected
	 */
	connect()
	{
		this.shouldConnect = true;
		this.#internalConnect();
		return this.#connectPromise;
	}

	/**
	 * Disconnect and stop retries
	 * @method disconnect
	 */
	disconnect()
	{
		this.shouldConnect = false;
		this.#internalDisconnect();
	}

	/**
	 * Stringify an object as a JSON message and send it to the server
	 *
	 * @method send
	 * @param {object} obj The object to send
	 */
	send(obj)
	{
		debug('SEND: %j', obj);
		this.#ws.send(JSON.stringify(obj));
	}

	/**
	 * Stringify an object as a JSON message, send it to the server and returns 
	 * a promise which will resolve to the result.
	 *
	 * @method request
	 * @param {object} obj The object to send
	 * @returns {Promise<object>}
	 */
	request(message)
	{
		return new Promise((resolve, reject) => {

			// Tag the message with the request id
			message.rid = this.#nextRid++;

			// Store in the response handler map
			this.#pendingResponseHandlers[message.rid] = {
				message: message,
				resolve: resolve,
				reject: reject,
			};

			// Send the request
			this.send(message);
		});
	}

	/**
	 * Returns a promise that will be resolved when connected
	 * 
	 * @example
	 * 
	 *     let C = new Cantabile();
	 *     await C.waitForConnected();
	 *
	 * @method waitForConnected
	 * @returns {Promise}
	 */
	waitForConnected()
	{
		return this.#connectPromise;
	}

	// PRIVATE:

	// Internal helper to change state, log it and fire event
	#setState(value)
	{
		if (this.#state != value)
		{
			if (this.#state == "connected")
			{
				this.#prepareConnectPromise();
			}

			this.#state = value;
			this.emit('stateChanged', value);
			this.emit(value);
			debug(value);

			if (this.#state == "connected")
			{
				this.#connectPromiseResolve();
			}
		}
	}

	/**
	 * The host URL
	 *
	 * @property host
	 * @type {String} 
	 */
    get host()
	{
		return this.#host;
	}

	/**
	 * The base socket url
	 *
	 * @property socketUrl
	 * @type {String}
	 */
	get socketUrl()
	{
		return this.#socketUrl;
	}



	// Internal helper to actually perform the connection
	#internalConnect()
	{
		if (!this.shouldConnect)
			return;

		// Already connected?
		if (this.#ws)
			return;

		this.#setState("connecting");

		// Work out socket url
		let socketUrl = this.socketUrl;

		// Create the socket and hook up handlers
		debug("Opening web socket '%s'", socketUrl);
		this.#ws =  new WebSocket(socketUrl);
		this.#ws.onerror = (e) => this.#onSocketError(e);
		this.#ws.onopen = () => this.#onSocketOpen();
		this.#ws.onclose = () => this.#onSocketClose();
		this.#ws.onmessage = (m) => this.#onSocketMessage(m);
	}

	// Internal helper to disconnect
	#internalDisconnect()
	{
		if (this.state == "connected")
			this.#setState("disconnected");

		// Already disconnected?
		if (!this.#ws)
			return;

		this.#ws.close();
		this.#ws = null;
	}

	// Internal helper to retry connection every 1 second
	#internalReconnect()
	{
		if (this.shouldConnect && !this.timeoutPending)
		{
			this.timeoutPending = true;
			this.#setState("connecting");
			setTimeout(() => {
				this.timeoutPending = false;
				this.#internalConnect();
			}, 1000);
		}
	}

	// Socket onerror handler
	#onSocketError(evt)
	{
		// Disconnect
		this.#internalDisconnect();

		// Try to reconnect...
		this.#internalReconnect();
	}

	// Socket onopen handler
	#onSocketOpen()
	{
		this.#setState("connected");
	}

	// Socket onclose handler
	#onSocketClose()
	{
		if (this.#ws)
		{
			this.#setState("disconnected");
			this.#ws = null;
		}

		// Try to reconnect...
		this.#internalReconnect();
	}

	// Socket onmessage handler
	#onSocketMessage(msg)
	{
		msg = JSON.parse(msg.data);

		debug('RECV: %j', msg);

		// Request response?
		if (msg.rid)
		{
			// Find the handler
			let handlerInfo = this.#pendingResponseHandlers[msg.rid];
			if (!handlerInfo)
			{
				debug('ERROR: received response for unknown rid:', msg.rid);
				return;
			}

			// Remove from pending map
			delete this.#pendingResponseHandlers[msg.rid];

			// Resolve reject
			if (msg.status >= 200 && msg.status < 300)
				handlerInfo.resolve(msg);
			else
				handlerInfo.reject(new Error(`${msg.status} - ${msg.statusDescription}`));
		}

		// Event message?
		if (msg.epid && msg.eventName)
		{
			var ep = this.#endPointEventHandlers[msg.epid];
			if (ep)
			{
				ep._dispatchEventMessage(msg.eventName, msg.data);
			}
			else
			{
				debug(`ERROR: No event handler found for end point ${msg.epid}`);
			}
		}
	}


	_registerEndPointEventHandler(epid, endPoint)
	{
		this.#endPointEventHandlers[epid] = endPoint;
	}

	_revokeEndPointEventHandler(epid)
	{
		delete this.#endPointEventHandlers[epid];
	}

	#autoConnectEndPoints = true;
	get autoConnectEndPoints()
	{
		return this.#autoConnectEndPoints;
	}
	set autoConnectEndPoints(value)
	{
		this.#autoConnectEndPoints = value;
	}

	#endPoints = new Map();
	getEndPoint(type)
	{
		var ep = this.#endPoints.get(type);
		if (!ep)
		{
			ep = new type(this);
			this.#endPoints.set(type, ep);
			
			if (this.#autoConnectEndPoints)
				ep.connect();
		}

		return ep;
	}

	/**
	 * Gets the {{#crossLink "Song"}}{{/crossLink}} object
	 *
	 * @property song
	 * @type {Song}
	 */
	get song() { return this.getEndPoint(Song) };

	/**
	 * Gets the {{#crossLink "SetList"}}{{/crossLink}} object
	 *
	 * @property setList
	 * @type {SetList}
	 */
	get setList() { return this.getEndPoint(SetList) };

	/**
	 * Gets the {{#crossLink "SongStates"}}{{/crossLink}} object
	 *
	 * @property songStates
	 * @type {SongStates}
	 */
	get songStates() { return this.getEndPoint(SongStates) };

	/**
	 * Gets the {{#crossLink "KeyRanges"}}{{/crossLink}} object
	 *
	 * @property keyRanges
	 * @type {KeyRanges}
	 */
	get keyRanges() { return this.getEndPoint(KeyRanges) };

	/**
	 * Gets the {{#crossLink "ShowNotes"}}{{/crossLink}} object
	 *
	 * @property showNotes
	 * @type {ShowNotes}
	 */
	get showNotes() { return this.getEndPoint(ShowNotes) };

	/**
	 * Gets the {{#crossLink "Variables"}}{{/crossLink}} object
	 *
	 * @property variables
	 * @type {Variables}
	 */
	get variables() { return this.getEndPoint(Variables) };

	/**
	 * Gets the {{#crossLink "OnscreenKeyboard"}}{{/crossLink}} object
	 *
	 * @property onscreenKeyboard
	 * @type {OnscreenKeyboard}
	 */
	get onscreenKeyboard() { return this.getEndPoint(OnscreenKeyboard) };

	/**
	 * Gets the {{#crossLink "Commands"}}{{/crossLink}} object
	 *
	 * @property commands
	 * @type {Commands}
	 */
	get commands() { return this.getEndPoint(Commands) };

	/**
	 * Gets the {{#crossLink "Transport"}}{{/crossLink}} object
	 *
	 * @property transport
	 * @type {Transport}
	 */
	get transport() { return this.getEndPoint(Transport) };

	/**
	 * Gets the {{#crossLink "Application"}}{{/crossLink}} object
	 *
	 * @property application
	 * @type {Application}
	 */
	get application() { return this.getEndPoint(Application) };

	/**
	 * Gets the {{#crossLink "Engine"}}{{/crossLink}} object
	 *
	 * @property engine
	 * @type {Engine}
	 */
	get engine() { return this.getEndPoint(Engine) };

	/**
	 * Gets the {{#crossLink "Bindings"}}{{/crossLink}} object
	 *
	 * @property bindings
	 * @type {Bindings}
	 */
	get bindings() { return this.getEndPoint(Bindings) };
}

export { Cantabile };
//# sourceMappingURL=cantabile.js.map
