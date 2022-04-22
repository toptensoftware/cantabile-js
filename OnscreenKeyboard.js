'use strict';

const debug = require('debug')('Cantabile');
const EndPoint = require('./EndPoint');
const EventEmitter = require('events');

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
			this.owner.send("/unwatch", { id: this._id})
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
		 * Fired after a new show note has been added
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
	 *     let C = new CantabileApi();
	 *     console.log(await C.onscreenKeyboard.queryController(1, "controller", 64));
	 * 
	 * @example
	 * 
	 *     let C = new CantabileApi();
	 *     C.onscreenKeyboard.queryController(1, "controller", 64).then(r => console.log(r)));
	 *
	 * @method queryController
	 * @param {Number} channel 		The MIDI channel number of the controller
	 * @param {String} kind 		The MIDI controller kind
	 * @param {Number} controller	The number of the controller
	 * @return {Promise|String} A promise to provide the controller value
	 */
	async queryController(channel, kind, controller)
	{
		await this.owner.untilConnected();

		return (await this.post("/queryController", {
			channel: channel,
			kind: kind,
			controller: controller || 0,
		})).data.value;
	}

	_onOpen()
	{
		for (let i=0; i<this.watchers.length; i++)
		{
			this.watchers[i]._start();
		}
	}

	_onClose()
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
	 *     let C = new CantabileApi();
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
	 *     let C = new CantabileApi();
	 *     let watcher = C.onscreenKeyboard.watchController(1, "controller", 64);
	 *     watcher.on('changed', function(value) {
	 *         console.log(value);
	 *     });
	 *     
	 * 	   // The "onscreenKeyboard" end point must be opened before callbacks will happen
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
	 * is the ControllerWatcher instance.
	 * 
	 * @return {ControllerWatcher}
	 */
	watch(channel, kind, controller, listener)
	{
		let w = new ControllerWatcher(this, channel, kind, controller, listener);
		this.watchers.push(w);

		this.open();

		if (this.isOpen)
			w._start();

		return w;
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
		this.close();
	}

	_onEvent_controllerChanged(data)
	{
		// Get the watcher
		let w = this.ids[data.id];
		if (w)
		{
			w._update(data.value);
		}
	}
}



module.exports = OnscreenKeyboard;