var WebSocket = globalThis.WebSocket;

var domain;

// This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).
function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}

// nodejs oddity
// require('events') === require('events').EventEmitter
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  domain = this.domain;

  // If there is no 'error' event listener then throw.
  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er)
        er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] :
                                          [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + type + ' listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || (list.listener && list.listener === listener)) {
        if (--this._eventsCount === 0)
          this._events = new EventHandlers();
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (list.length === 1) {
          list[0] = undefined;
          if (--this._eventsCount === 0) {
            this._events = new EventHandlers();
            return this;
          } else {
            delete events[type];
          }
        } else {
          spliceOne(list, position);
        }

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };
    
// Alias for removeListener added in NodeJS 10.0
// https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
EventEmitter.prototype.off = function(type, listener){
    return this.removeListener(type, listener);
};

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        do {
          this.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

/**
 * Common functionality for all end point handlers
 *
 * @class EndPoint
 * @extends EventEmitter
 */
class EndPoint extends EventEmitter
{
	// Private constructor
	/** @internal */
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

	/** @internal */
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

	/** @internal */
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

	/** @internal */
	post(endPoint, data)
	{
		return this.request('post', endPoint, data);
	}

	/** @internal */
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
	/** @internal */
	static joinPath(a,b)
	{
		while (a.endsWith('/'))
			a = a.substr(0, a.length - 1);
		while (b.startsWith('/'))
			b = b.substr(1);
		return `${a}/${b}`;
	}


}

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
	/** @internal */
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
	 * @param {Number} program The zero based program number of the song to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadSongByProgram(program, delayed)
	{
		this.post("/loadSongByProgram", {
			pr: program,
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
		this.#resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
		this.emit('currentStateChanged');
	}

	_onDisconnected()
	{
		this.#resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
		this.emit('currentStateChanged');
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
	 * @param {Number} program The zero based program number of the State to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadStateByProgram(program, delayed)
	{
		this.post("/loadStateByProgram", {
			pr: program,
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


	#resolveCurrentState()
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
		this.#resolveCurrentState();
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
		this.#resolveCurrentState();
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
		this.#resolveCurrentState();
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
	/** @internal */
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
	/** @internal */
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
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/shownotes");
	}

	_onConnected()
	{
		this.emit('reload');
		this.emit('changed');
		this.emit('markdownChanged');
	}

	_onDisconnected()
	{
		this.emit('reload');
		this.emit('changed');
		this.emit('markdownChanged');
	}

	/**
	 * Get's the original v1 show notes in raw json format
	 * @returns {Promise<object>} Returns a promise for the JSON data
	 */
	async getV1Raw()
	{
		return (await this.get("/v1raw")).data;
	}

	/**
	 * An array of {{#crossLink "ShowNote"}}{{/crossLink}} items
	 * @property items
	 * @type {ShowNote[]}
	 */
	get items() { return this.data ? this.data.items : null; }

	/**
	 * The markdown show notes
	 */
	get markdown() { return this.data?.markdown}

	/**
	 * Stores the markdown notes		 for the current song
	 * 
	 * @param {string} markdown 
	 * @returns {Promise} A promise that resolves when the markdown has been stored with the song
	 */
	storeMarkdown(markdown)
	{
		return this.post("/markdown", { markdown });
	}

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
		this.data.markdown = data.markdown;
		this.emit('reload');
		this.emit('changed');
		this.emit('markdownChanged');

		/**
		 * Fired when the entire set of show notes has changed (eg: after  loading a new song)
		 * 
		 * @event reload
		 */
	}
	_onEvent_markdownChanged(data)
	{
		this.data.markdown = data.markdown;
		this.emit('changed');
		this.emit('markdownChanged');
	}
}

/**
 * Represents a monitored pattern string.

 * Returned from the {{#crossLink "Variables/watch:method"}}{{/crossLink}} method.
 *
 * @class PatternWatcher
 * @extends EventEmitter
 */
class PatternWatcher extends EventEmitter
{
	/** @internal */
	constructor(owner, pattern, callback)
	{
		super();
		this.#owner = owner;
		this.#pattern = pattern;	
		this.#patternId = 0;
		this.#resolved = "";
		this.#callback = callback;
	}

	#owner;
	#pattern;
	#patternId;
	#resolved;
	#callback;

	/**
	 * Returns the pattern string being watched
	 *
	 * @property pattern
	 * @type {String} 
	 */
	get pattern() { return this.#pattern; }

	/**
	 * Returns the current resolved display string
	 *
	 * @property resolved
	 * @type {String} 
	 */
	get resolved() { return this.#resolved; }

	_start()
	{
		this.#owner.post("/watch", {
			pattern: this.#pattern,
		}).then(r => {
			if (r.data.patternId)
			{
				this.#owner._registerPatternId(r.data.patternId, this);
				this.#patternId = r.data.patternId;
			}
			this.#resolved = r.data.resolved;
			this._fireChanged();
		});
	}

	_stop()
	{
		if (this.#owner._epid && this.#patternId)
		{
			this.#owner.send("POST", "/unwatch", { patternId: this.#patternId});
			this.#owner._revokePatternId(this.#patternId);
			this.#patternId = 0;
			this.#resolved = "";
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
		this.#owner._revokeWatcher(this);
	}

	_update(data)
	{
		this.#resolved = data.resolved;
		this._fireChanged();
	}

	_fireChanged()
	{
		// Callback?
		if (this.#callback)
			this.#callback(this.resolved, this);

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
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/variables");
	}

	#watchers = [];
	#patternIds = {};

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
	 * @param {string} pattern The string variable pattern to resolve
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
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._start();
		}
	}

	_onDisconnected()
	{
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._stop();
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
	 *     /// later, stop listening
	 *     watcher.unwatch();
	 *
	 * @method watch
	 * @param {String} pattern The string pattern to watch
	 * @param {PatternWatcherCallback} [callback] Optional callback function to be called when the resolved display string changes.
	 * @returns {PatternWatcher}
	 */
	watch(pattern, callback)
	{
		let w = new PatternWatcher(this, pattern, callback);
		this.#watchers.push(w);
		if (this.isConnected)
			w._start();

		return w;
	}

	_registerPatternId(patternId, watcher)
	{
		this.#patternIds[patternId] = watcher;
	}

	_revokePatternId(patternId)
	{
		delete this.#patternIds[patternId];
	}

	_revokeWatcher(w)
	{
		this.#watchers = this.#watchers.filter(x=>x != w);
	}

	_onEvent_patternChanged(data)
	{
		// Get the watcher
		let w = this.#patternIds[data.patternId];
		if (w)
		{
			w._update(data);
		}
	}
}

/**
 * Represents a monitored controller

 * Returned from the {{#crossLink "OnscreenKeyboard/watch:method"}}{{/crossLink}} method.
 *
 * @class ControllerWatcher
 * @extends EventEmitter
 */
class ControllerWatcher extends EventEmitter
{
	/** @internal */
	constructor(owner, channel, kind, controller, listener)
	{
		super();
		this.#owner = owner;
		this.#channel = channel;	
		this.#kind = kind;
		this.#controller = controller;
		this.#value = null;
		this.#listener = listener;
	}

	#owner;
	#channel;
	#kind;
	#controller;
	#value;
	#listener;

	/**
	 * Returns the MIDI channel number of controller being watched
	 *
	 * @property channel
	 * @type {Number} 
	 */
	 get channel() { return this.#channel; }

	/**
	 * Returns the kind of controller being watched
	 *
	 * @property kind
	 * @type {MidiControllerKind} 
	 */
	 get kind() { return this.#kind; }

	/**
	 * Returns the number of the controller being watched
	 *
	 * @property controller
	 * @type {Number} 
	 */
	 get controller() { return this.#controller; }

	 /**
	 * Returns the current value of the controller
	 *
	 * @property value
	 * @type {Number} 
	 */
	get value() { return this.#value; }

	_start()
	{
		this.#owner.post("/watchController", {
			channel: this.#channel,
			kind: this.#kind,
			controller: this.#controller,
		}).then(r => {
			if (r.data.id)
			{
				this.#owner._registerWatcher(r.data.id, this);
				this._id = r.data.id;
			}
			this.#value = r.data.value;
			this._fireChanged();
		});
	}

	_stop()
	{
		if (this.#owner._epid && this._id)
		{
			this.#owner.send("POST", "/unwatch", { id: this._id});
			this.#owner._revokeWatcher(this._id);
			this._id = 0;
			this.#value = null;
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
		this.#owner._revokeWatcher(this);
	}

	_update(data)
	{
		this.#value = data.value;
		this._fireChanged();
	}

	_fireChanged()
	{
		// Function listener?
		if (this.#listener)
			this.#listener(this.#value, this);

		/**
		 * Fired when the controller value has changed
		 *
		 * @event controllerChanged
		 * @param {Number} value The new value of the controller
		 * @param {ControllerWatcher} source This object
		 */
		this.emit('controllerChanged', this.#value, this);
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
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/onscreenKeyboard");
	}

	#watchers = [];
	#ids = {};

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
	 * @param {MidiControllerKind} kind 		The MIDI controller kind
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
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._start();
		}
	}

	_onDisconnected()
	{
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._stop();
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
	 *     /// later, stop listening
	 *     watcher.unwatch();
	 *
	 * @method watch
	 * @param {Number} channel 		The MIDI channel number of the controller
	 * @param {MidiControllerKind} kind 		The MIDI controller kind
	 * @param {Number} controller	The number of the controller
	 * @param {ControllerWatcherCallback} [callback] Optional callback function to be called when the controller value changes.
	 * @returns {ControllerWatcher}
	 */
	watch(channel, kind, controller, callback)
	{
		let w = new ControllerWatcher(this, channel, kind, controller, callback);
		this.#watchers.push(w);

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
		this.#ids[id] = watcher;
	}

	_revokeWatcher(id)
	{
		delete this.#ids[id];
	}

	_revokeWatcher(w)
	{
		this.#watchers = this.#watchers.filter(x=>x != w);
	}

	_onEvent_controllerChanged(data)
	{
		// Get the watcher
		let w = this.#ids[data.id];
		if (w)
		{
			w._update(data);
		}
	}
}

/**
 * Represents an watched binding point for changes/invocations

 * Returned from the {{#crossLink "Bindings/watch:method"}}{{/crossLink}} method.
 * 
 * @class BindingWatcher
 * @extends EventEmitter
 */
class BindingWatcher extends EventEmitter
{
	/** @internal */
	constructor(owner, bindingPoint, callback)
	{
		super();
		this.#owner = owner;
		this.#bindingPoint = bindingPoint;
        this.#callback = callback;
        this.#value = null;
	}

	#owner;
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
		this.#owner.post("/watch", this.#bindingPoint).then(r => {
            this.#owner._registerWatchId(r.data.watchId, this);
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
		if (this.#owner._epid && this.#watchId)
		{
			this.#owner.send("POST", "/unwatch", { watchId: this.#watchId});
			this.#owner._revokeWatchId(this.#watchId);
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
		this.#owner._revokeWatcher(this);
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
	/** @internal */
	constructor(owner, bindingPoint)
	{
		this.#owner = owner;
		this.#bindingPoint = bindingPoint;
		this.#prepareConnectPromise();
	}

	#owner;
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
		this.#owner.post("/prepare", this.#bindingPoint)
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
		if (this.#owner._epid && this.#prepId)
		{
			this.#owner.send("POST", "/unprepare", { prepId: this.#prepId });
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
		this.#owner._revokePrepped(this);
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

        return this.#owner.request("POST", "/preparedInvoke", {
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
	/** @internal */
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
	async getBindingPointInfo(bindingPoint, source)
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
     * @param {BindingPoint} bindingPoint The binding point to invoke
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
	 * @param {BindingWatcherCallback} [callback] Optional callback function to be called when the source binding triggers
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
	/** @internal */
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
	/** @internal */
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
    /** @internal */
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
	 * The current transport state.  
	 * @property state
	 * @type {TransportState}
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
	 * Gets or sets the current loopMode 
	 * @property loopMode
	 * @type {TransportLoopMode}
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
	/** @internal */
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

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

/* eslint-disable no-prototype-builtins */
var g =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  // eslint-disable-next-line no-undef
  (typeof global$1 !== 'undefined' && global$1) ||
  {};

var support = {
  searchParams: 'URLSearchParams' in g,
  iterable: 'Symbol' in g && 'iterator' in Symbol,
  blob:
    'FileReader' in g &&
    'Blob' in g &&
    (function() {
      try {
        new Blob();
        return true
      } catch (e) {
        return false
      }
    })(),
  formData: 'FormData' in g,
  arrayBuffer: 'ArrayBuffer' in g
};

function isDataView(obj) {
  return obj && DataView.prototype.isPrototypeOf(obj)
}

if (support.arrayBuffer) {
  var viewClasses = [
    '[object Int8Array]',
    '[object Uint8Array]',
    '[object Uint8ClampedArray]',
    '[object Int16Array]',
    '[object Uint16Array]',
    '[object Int32Array]',
    '[object Uint32Array]',
    '[object Float32Array]',
    '[object Float64Array]'
  ];

  var isArrayBufferView =
    ArrayBuffer.isView ||
    function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    };
}

function normalizeName(name) {
  if (typeof name !== 'string') {
    name = String(name);
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
    throw new TypeError('Invalid character in header field name: "' + name + '"')
  }
  return name.toLowerCase()
}

function normalizeValue(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  return value
}

// Build a destructive iterator for the value list
function iteratorFor(items) {
  var iterator = {
    next: function() {
      var value = items.shift();
      return {done: value === undefined, value: value}
    }
  };

  if (support.iterable) {
    iterator[Symbol.iterator] = function() {
      return iterator
    };
  }

  return iterator
}

function Headers(headers) {
  this.map = {};

  if (headers instanceof Headers) {
    headers.forEach(function(value, name) {
      this.append(name, value);
    }, this);
  } else if (Array.isArray(headers)) {
    headers.forEach(function(header) {
      if (header.length != 2) {
        throw new TypeError('Headers constructor: expected name/value pair to be length 2, found' + header.length)
      }
      this.append(header[0], header[1]);
    }, this);
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function(name) {
      this.append(name, headers[name]);
    }, this);
  }
}

Headers.prototype.append = function(name, value) {
  name = normalizeName(name);
  value = normalizeValue(value);
  var oldValue = this.map[name];
  this.map[name] = oldValue ? oldValue + ', ' + value : value;
};

Headers.prototype['delete'] = function(name) {
  delete this.map[normalizeName(name)];
};

Headers.prototype.get = function(name) {
  name = normalizeName(name);
  return this.has(name) ? this.map[name] : null
};

Headers.prototype.has = function(name) {
  return this.map.hasOwnProperty(normalizeName(name))
};

Headers.prototype.set = function(name, value) {
  this.map[normalizeName(name)] = normalizeValue(value);
};

Headers.prototype.forEach = function(callback, thisArg) {
  for (var name in this.map) {
    if (this.map.hasOwnProperty(name)) {
      callback.call(thisArg, this.map[name], name, this);
    }
  }
};

Headers.prototype.keys = function() {
  var items = [];
  this.forEach(function(value, name) {
    items.push(name);
  });
  return iteratorFor(items)
};

Headers.prototype.values = function() {
  var items = [];
  this.forEach(function(value) {
    items.push(value);
  });
  return iteratorFor(items)
};

Headers.prototype.entries = function() {
  var items = [];
  this.forEach(function(value, name) {
    items.push([name, value]);
  });
  return iteratorFor(items)
};

if (support.iterable) {
  Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
}

function consumed(body) {
  if (body._noBody) return
  if (body.bodyUsed) {
    return Promise.reject(new TypeError('Already read'))
  }
  body.bodyUsed = true;
}

function fileReaderReady(reader) {
  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result);
    };
    reader.onerror = function() {
      reject(reader.error);
    };
  })
}

function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader();
  var promise = fileReaderReady(reader);
  reader.readAsArrayBuffer(blob);
  return promise
}

function readBlobAsText(blob) {
  var reader = new FileReader();
  var promise = fileReaderReady(reader);
  var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
  var encoding = match ? match[1] : 'utf-8';
  reader.readAsText(blob, encoding);
  return promise
}

function readArrayBufferAsText(buf) {
  var view = new Uint8Array(buf);
  var chars = new Array(view.length);

  for (var i = 0; i < view.length; i++) {
    chars[i] = String.fromCharCode(view[i]);
  }
  return chars.join('')
}

function bufferClone(buf) {
  if (buf.slice) {
    return buf.slice(0)
  } else {
    var view = new Uint8Array(buf.byteLength);
    view.set(new Uint8Array(buf));
    return view.buffer
  }
}

function Body() {
  this.bodyUsed = false;

  this._initBody = function(body) {
    /*
      fetch-mock wraps the Response object in an ES6 Proxy to
      provide useful test harness features such as flush. However, on
      ES5 browsers without fetch or Proxy support pollyfills must be used;
      the proxy-pollyfill is unable to proxy an attribute unless it exists
      on the object before the Proxy is created. This change ensures
      Response.bodyUsed exists on the instance, while maintaining the
      semantic of setting Request.bodyUsed in the constructor before
      _initBody is called.
    */
    // eslint-disable-next-line no-self-assign
    this.bodyUsed = this.bodyUsed;
    this._bodyInit = body;
    if (!body) {
      this._noBody = true;
      this._bodyText = '';
    } else if (typeof body === 'string') {
      this._bodyText = body;
    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
      this._bodyBlob = body;
    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
      this._bodyFormData = body;
    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
      this._bodyText = body.toString();
    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
      this._bodyArrayBuffer = bufferClone(body.buffer);
      // IE 10-11 can't handle a DataView body.
      this._bodyInit = new Blob([this._bodyArrayBuffer]);
    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
      this._bodyArrayBuffer = bufferClone(body);
    } else {
      this._bodyText = body = Object.prototype.toString.call(body);
    }

    if (!this.headers.get('content-type')) {
      if (typeof body === 'string') {
        this.headers.set('content-type', 'text/plain;charset=UTF-8');
      } else if (this._bodyBlob && this._bodyBlob.type) {
        this.headers.set('content-type', this._bodyBlob.type);
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      }
    }
  };

  if (support.blob) {
    this.blob = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return Promise.resolve(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as blob')
      } else {
        return Promise.resolve(new Blob([this._bodyText]))
      }
    };
  }

  this.arrayBuffer = function() {
    if (this._bodyArrayBuffer) {
      var isConsumed = consumed(this);
      if (isConsumed) {
        return isConsumed
      } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
        return Promise.resolve(
          this._bodyArrayBuffer.buffer.slice(
            this._bodyArrayBuffer.byteOffset,
            this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
          )
        )
      } else {
        return Promise.resolve(this._bodyArrayBuffer)
      }
    } else if (support.blob) {
      return this.blob().then(readBlobAsArrayBuffer)
    } else {
      throw new Error('could not read as ArrayBuffer')
    }
  };

  this.text = function() {
    var rejected = consumed(this);
    if (rejected) {
      return rejected
    }

    if (this._bodyBlob) {
      return readBlobAsText(this._bodyBlob)
    } else if (this._bodyArrayBuffer) {
      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
    } else if (this._bodyFormData) {
      throw new Error('could not read FormData body as text')
    } else {
      return Promise.resolve(this._bodyText)
    }
  };

  if (support.formData) {
    this.formData = function() {
      return this.text().then(decode)
    };
  }

  this.json = function() {
    return this.text().then(JSON.parse)
  };

  return this
}

// HTTP methods whose capitalization should be normalized
var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

function normalizeMethod(method) {
  var upcased = method.toUpperCase();
  return methods.indexOf(upcased) > -1 ? upcased : method
}

function Request(input, options) {
  if (!(this instanceof Request)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }

  options = options || {};
  var body = options.body;

  if (input instanceof Request) {
    if (input.bodyUsed) {
      throw new TypeError('Already read')
    }
    this.url = input.url;
    this.credentials = input.credentials;
    if (!options.headers) {
      this.headers = new Headers(input.headers);
    }
    this.method = input.method;
    this.mode = input.mode;
    this.signal = input.signal;
    if (!body && input._bodyInit != null) {
      body = input._bodyInit;
      input.bodyUsed = true;
    }
  } else {
    this.url = String(input);
  }

  this.credentials = options.credentials || this.credentials || 'same-origin';
  if (options.headers || !this.headers) {
    this.headers = new Headers(options.headers);
  }
  this.method = normalizeMethod(options.method || this.method || 'GET');
  this.mode = options.mode || this.mode || null;
  this.signal = options.signal || this.signal || (function () {
    if ('AbortController' in g) {
      var ctrl = new AbortController();
      return ctrl.signal;
    }
  }());
  this.referrer = null;

  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
    throw new TypeError('Body not allowed for GET or HEAD requests')
  }
  this._initBody(body);

  if (this.method === 'GET' || this.method === 'HEAD') {
    if (options.cache === 'no-store' || options.cache === 'no-cache') {
      // Search for a '_' parameter in the query string
      var reParamSearch = /([?&])_=[^&]*/;
      if (reParamSearch.test(this.url)) {
        // If it already exists then set the value with the current time
        this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
      } else {
        // Otherwise add a new '_' parameter to the end with the current time
        var reQueryString = /\?/;
        this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
      }
    }
  }
}

Request.prototype.clone = function() {
  return new Request(this, {body: this._bodyInit})
};

function decode(body) {
  var form = new FormData();
  body
    .trim()
    .split('&')
    .forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
  return form
}

function parseHeaders(rawHeaders) {
  var headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
  // https://github.com/github/fetch/issues/748
  // https://github.com/zloirock/core-js/issues/751
  preProcessedHeaders
    .split('\r')
    .map(function(header) {
      return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
    })
    .forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        try {
          headers.append(key, value);
        } catch (error) {
          console.warn('Response ' + error.message);
        }
      }
    });
  return headers
}

Body.call(Request.prototype);

function Response(bodyInit, options) {
  if (!(this instanceof Response)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }
  if (!options) {
    options = {};
  }

  this.type = 'default';
  this.status = options.status === undefined ? 200 : options.status;
  if (this.status < 200 || this.status > 599) {
    throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].")
  }
  this.ok = this.status >= 200 && this.status < 300;
  this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
  this.headers = new Headers(options.headers);
  this.url = options.url || '';
  this._initBody(bodyInit);
}

Body.call(Response.prototype);

Response.prototype.clone = function() {
  return new Response(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new Headers(this.headers),
    url: this.url
  })
};

Response.error = function() {
  var response = new Response(null, {status: 200, statusText: ''});
  response.ok = false;
  response.status = 0;
  response.type = 'error';
  return response
};

var redirectStatuses = [301, 302, 303, 307, 308];

Response.redirect = function(url, status) {
  if (redirectStatuses.indexOf(status) === -1) {
    throw new RangeError('Invalid status code')
  }

  return new Response(null, {status: status, headers: {location: url}})
};

var DOMException = g.DOMException;
try {
  new DOMException();
} catch (err) {
  DOMException = function(message, name) {
    this.message = message;
    this.name = name;
    var error = Error(message);
    this.stack = error.stack;
  };
  DOMException.prototype = Object.create(Error.prototype);
  DOMException.prototype.constructor = DOMException;
}

function fetch$1(input, init) {
  return new Promise(function(resolve, reject) {
    var request = new Request(input, init);

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }

    var xhr = new XMLHttpRequest();

    function abortXhr() {
      xhr.abort();
    }

    xhr.onload = function() {
      var options = {
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
      };
      // This check if specifically for when a user fetches a file locally from the file system
      // Only if the status is out of a normal range
      if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
        options.status = 200;
      } else {
        options.status = xhr.status;
      }
      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
      var body = 'response' in xhr ? xhr.response : xhr.responseText;
      setTimeout(function() {
        resolve(new Response(body, options));
      }, 0);
    };

    xhr.onerror = function() {
      setTimeout(function() {
        reject(new TypeError('Network request failed'));
      }, 0);
    };

    xhr.ontimeout = function() {
      setTimeout(function() {
        reject(new TypeError('Network request timed out'));
      }, 0);
    };

    xhr.onabort = function() {
      setTimeout(function() {
        reject(new DOMException('Aborted', 'AbortError'));
      }, 0);
    };

    function fixUrl(url) {
      try {
        return url === '' && g.location.href ? g.location.href : url
      } catch (e) {
        return url
      }
    }

    xhr.open(request.method, fixUrl(request.url), true);

    if (request.credentials === 'include') {
      xhr.withCredentials = true;
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false;
    }

    if ('responseType' in xhr) {
      if (support.blob) {
        xhr.responseType = 'blob';
      } else if (
        support.arrayBuffer
      ) {
        xhr.responseType = 'arraybuffer';
      }
    }

    if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
      var names = [];
      Object.getOwnPropertyNames(init.headers).forEach(function(name) {
        names.push(normalizeName(name));
        xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
      });
      request.headers.forEach(function(value, name) {
        if (names.indexOf(name) === -1) {
          xhr.setRequestHeader(name, value);
        }
      });
    } else {
      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });
    }

    if (request.signal) {
      request.signal.addEventListener('abort', abortXhr);

      xhr.onreadystatechange = function() {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', abortXhr);
        }
      };
    }

    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
  })
}

fetch$1.polyfill = true;

if (!g.fetch) {
  g.fetch = fetch$1;
  g.Headers = Headers;
  g.Request = Request;
  g.Response = Response;
}

var fetchNpmBrowserify;
var hasRequiredFetchNpmBrowserify;

function requireFetchNpmBrowserify () {
	if (hasRequiredFetchNpmBrowserify) return fetchNpmBrowserify;
	hasRequiredFetchNpmBrowserify = 1;
	// the whatwg-fetch polyfill installs the fetch() function
	// on the global object (window or self)
	//
	// Return that as the export for use in Webpack, Browserify etc.

	fetchNpmBrowserify = self.fetch.bind(self);
	return fetchNpmBrowserify;
}

requireFetchNpmBrowserify();

/**
 * Provides access to Cantabile's engine object for start/stop control
 *
 * Access this object via the {{#crossLink "Cantabile/engine:property"}}{{/crossLink}} property.
 *
 * @class Engine
 */
class Engine
{
	/** @internal */
    constructor(owner)
    {
		this.#owner = owner;
    }

	#owner;

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
		let f = await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/")).then(r => r.json());
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
		await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/start"), { method: "POST" });
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
		await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/stop"), { method: "POST" });
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
		 await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/restart"), { method: "POST" });
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
		  await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/startStop"), { method: "POST" });
	  }

  }

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
	 * @param {string|Object} options A string host, or configuration options
	 * @param {string} [options.host] the host to connect to (defaults to browser url, or localhost:35007)
	 * @param {boolean} [options.autoConnect=true] if true automatically initiates connection
	 * @param {boolean} [options.autoConnectEndPoints=true] if true automatically connects end point objects when accessed
	 * @param {number} [options.maxListeners=30] set the max event listeners for this object (if supported)
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
		this.#shouldConnect = false;
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
	#shouldConnect;
	#timeoutPending;

	// Resolve host string to host url and socket url
	#setHost(value)
	{
		if (!value && typeof window !== 'undefined')
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
		this.#shouldConnect = true;
		this.#internalConnect();
		return this.#connectPromise;
	}

	/**
	 * Disconnect and stop retries
	 * @method disconnect
	 */
	disconnect()
	{
		this.#shouldConnect = false;
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
		this.#ws.send(JSON.stringify(obj));
	}

	/**
	 * Stringify an object as a JSON message, send it to the server and returns 
	 * a promise which will resolve to the result.
	 *
	 * @method request
	 * @param {object} message The message object to send
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
		if (!this.#shouldConnect)
			return;

		// Already connected?
		if (this.#ws)
			return;

		this.#setState("connecting");

		// Work out socket url
		let socketUrl = this.socketUrl;

		// Create the socket and hook up handlers
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
		if (this.#shouldConnect && !this.#timeoutPending)
		{
			this.#timeoutPending = true;
			this.#setState("connecting");
			setTimeout(() => {
				this.#timeoutPending = false;
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

		// Request response?
		if (msg.rid)
		{
			// Find the handler
			let handlerInfo = this.#pendingResponseHandlers[msg.rid];
			if (!handlerInfo)
			{
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

	/**
	 * Controls whether the sub-object end points are automatically
	 * connected when first accessed.
	 *
	 * @property autoConnectEndPoints
	 * @type {Boolean}
	 */
	get autoConnectEndPoints()
	{
		return this.#autoConnectEndPoints;
	}
	set autoConnectEndPoints(value)
	{
		this.#autoConnectEndPoints = value;
	}

	#endPoints = new Map();
	#getEndPoint(type)
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
	get song() { return this.#getEndPoint(Song) };

	/**
	 * Gets the {{#crossLink "SetList"}}{{/crossLink}} object
	 *
	 * @property setList
	 * @type {SetList}
	 */
	get setList() { return this.#getEndPoint(SetList) };

	/**
	 * Gets the {{#crossLink "SongStates"}}{{/crossLink}} object
	 *
	 * @property songStates
	 * @type {SongStates}
	 */
	get songStates() { return this.#getEndPoint(SongStates) };

	/**
	 * Gets the {{#crossLink "KeyRanges"}}{{/crossLink}} object
	 *
	 * @property keyRanges
	 * @type {KeyRanges}
	 */
	get keyRanges() { return this.#getEndPoint(KeyRanges) };

	/**
	 * Gets the {{#crossLink "ShowNotes"}}{{/crossLink}} object
	 *
	 * @property showNotes
	 * @type {ShowNotes}
	 */
	get showNotes() { return this.#getEndPoint(ShowNotes) };

	/**
	 * Gets the {{#crossLink "Variables"}}{{/crossLink}} object
	 *
	 * @property variables
	 * @type {Variables}
	 */
	get variables() { return this.#getEndPoint(Variables) };

	/**
	 * Gets the {{#crossLink "OnscreenKeyboard"}}{{/crossLink}} object
	 *
	 * @property onscreenKeyboard
	 * @type {OnscreenKeyboard}
	 */
	get onscreenKeyboard() { return this.#getEndPoint(OnscreenKeyboard) };

	/**
	 * Gets the {{#crossLink "Commands"}}{{/crossLink}} object
	 *
	 * @property commands
	 * @type {Commands}
	 */
	get commands() { return this.#getEndPoint(Commands) };

	/**
	 * Gets the {{#crossLink "Transport"}}{{/crossLink}} object
	 *
	 * @property transport
	 * @type {Transport}
	 */
	get transport() { return this.#getEndPoint(Transport) };

	/**
	 * Gets the {{#crossLink "Application"}}{{/crossLink}} object
	 *
	 * @property application
	 * @type {Application}
	 */
	get application() { return this.#getEndPoint(Application) };

	/**
	 * Gets the {{#crossLink "Engine"}}{{/crossLink}} object
	 *
	 * @property engine
	 * @type {Engine}
	 */
	get engine() { return this.#getEndPoint(Engine) };

	/**
	 * Gets the {{#crossLink "Bindings"}}{{/crossLink}} object
	 *
	 * @property bindings
	 * @type {Bindings}
	 */
	get bindings() { return this.#getEndPoint(Bindings) };
}

export { Cantabile };
//# sourceMappingURL=cantabile.js.map
