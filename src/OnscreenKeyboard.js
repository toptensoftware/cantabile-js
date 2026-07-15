import { EndPoint } from './EndPoint.js';
import EventEmitter from 'events';


/**
 * Represents a monitored controller

 * Returned from the {@linkcode OnscreenKeyboard#watch} method.
 *
 * @class ControllerWatcher
 * @extends EventEmitter
 */
export class ControllerWatcher extends EventEmitter
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
			this.#owner.send("POST", "/unwatch", { id: this._id})
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
 * Access this object via the {@linkcode Cantabile#onscreenKeyboard} property.
 *
 * @class OnscreenKeyboard
 * @extends EndPoint
 */
export class OnscreenKeyboard extends EndPoint
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
	 * // Get the value of cc 64 on channel 1
	 * console.log(await C.onscreenKeyboard.queryController(1, "controller", 64));
	 * 
	 * @example
	 * 
	 * C.onscreenKeyboard.queryController(1, "controller", 64).then(r => console.log(r)));
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
	 * // Watch a controller using a callback function
	 * C.onscreenKeyboard.watchController(1, "controller", 64, function(value) {
	 *     console.log(value);
	 * })
	 *     
	 * @example
	 * 
	 * // Using the ControllerWatcher class and events:
	 * let watcher = C.onscreenKeyboard.watchController(1, "controller", 64);
	 * watcher.on('changed', function(value) {
	 *     console.log(value);
	 * });
	 * 
	 * /// later, stop listening
	 * watcher.unwatch();
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
	 * // Send a note on event
	 * C.onscreenKeyboard.inject([0x90, 64, 64]);
	 * 
	 * @example
	 * 
	 * // Send Midi CC 23 = 127
	 * let watcher = C.onscreenKeyboard.inject({
	 *      channel: 0,
	 *      kind: "controller",
	 *      controller: 23,
	 *      value: 127,
	 * });
	 *
	 */
	 injectMidi(data)
	 {
		this.post("/injectMidi", {
			value: data
		})		 
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

