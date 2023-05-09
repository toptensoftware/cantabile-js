'use strict';

const debug = require('debug')('Cantabile');
const EndPoint = require('./EndPoint');
const EventEmitter = require('events');

/**
 * Represents an active connection watching a source binding point for changes/invocations

 * Returned from the {{#crossLink "Bindings/watch:method"}}{{/crossLink}} method.
 * 
 * @class Binding4Watcher
 * @extends EventEmitter
 */
class Binding4Watcher extends EventEmitter
{
	constructor(owner, bindableId, bindingPointId, bindableParams, bindingPointParams, callback)
	{
		super();
		this.owner = owner;
		this._bindableId = bindableId;
		this._bindingPointId = bindingPointId;
		this._bindableParams = bindableParams;
		this._bindingPointParams = bindingPointParams;
        this._callback = callback;
        this._value = null;
	}

	/**
	 * Returns the id of the bindable object being listened to
	 *
	 * @property bindableId
	 * @type {String} 
	 */
	get bindableId() { return this._bindableId; }

	/**
	 * Returns the id of the binding point being listened to
	 *
	 * @property bindingPointId
	 * @type {String} 
	 */
	 get bindingPointId() { return this._bindingPointId; }

	/**
	 * Returns the parameters of the bindable object
	 *
	 * @property bindableParams
	 * @type {Object} 
	 */
	 get bindableParams() { return this._bindableParams; }
    
	/**
	 * Returns the parameters of the binding point object
	 *
	 * @property bindingPointParams
	 * @type {Object} 
	 */
	 get bindingPointParams() { return this._bindingPointParams; }
    
	/**
	 * Returns the last received value for the source binding point
	 *
	 * @property value
	 * @type {Object} 
	 */
    get value() { return this._value; }
    
	_start()
	{
		this.owner.post("/watch", {
            bindableId: this._bindableId,
			bindingPointId: this._bindingPointId,
            bindableParams: this._bindableParams,
            bindingPointParams: this._bindingPointParams
		}).then(r => {
            this.owner._registerWatchId(r.data.watchId, this);
			this._watchId = r.data.watchId;
			if (r.data.value !== null && r.data.value !== undefined)
			{
				this._value = r.data.value;
				this._fireInvoked();
			}
		});
	}

	_stop()
	{
		if (this.owner._epid && this._watchId)
		{
			this.owner.send("POST", "/unwatch", { watchId: this._watchId})
			this.owner._revokeWatchId(this._watchId);
			this._watchId = 0;
			if (this._value !== null && this._value !== undefined)
			{
				this._value = null;
				this._fireInvoked();
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
		this._value = data.value;
		this._fireInvoked();
	}

	_fireInvoked()
	{
		// Function listener?
		if (this._callback)
			this._callback(this._value, this);

		/**
		 * Fired when the source binding point is triggered
		 *
		 * @event invoked
		 * @param {Object} value The value supplied from the source binding
		 * @param {Binding4Watcher} source This object
		 */
		this.emit('invoked', this.value, this);
	}
}

/**
 * Provides access to Cantabile's binding points.
 * 
 * Access this object via the {{#crossLink "Cantabile/bindings4:property"}}{{/crossLink}} property.
 *
 * @class Bindings4
 * @extends EndPoint
 */
class Bindings4 extends EndPoint
{
    constructor(owner)
    {
        super(owner, "/api/bindings4");
		this._watchers = [];
		this._watchIds = {};
    }

    _onOpen()
    {
		for (let i=0; i<this._watchers.length; i++)
		{
			this._watchers[i]._start();
		}
    }

    _onClose()
    {
		for (let i=0; i<this._watchers.length; i++)
		{
			this._watchers[i]._stop();
		}
    }


    /**
     * Retrieves a list of available binding points
	 * 
	 * If Cantabile is running on your local machine you can view this list
	 * directly at <http://localhost:35007/api/bindings/availableBindingPoints>
     * 
     * @example
     * 
     *     let C = new CantabileApi();
     *     C.connect();
     *     console.log(await C.bindings4.availableBindingPoints());
     * 
     * @method availableBindingPoints
     * @return {Promise|BindingPointEntry4[]} A promise to return an array of BindingPointInfo
     */
    async availableBindingPoints()
    {
        await this.owner.untilConnected();
        return (await this.request("GET", "/availableBindingPoints")).data;
    }

    /**
     * Retrieves additional information about a specific binding point
	 * 
     * @example
     * 
     *     let C = new CantabileApi();
     *     C.connect();
     *     console.log(await C.bindings4.bindingPointInfo("setList", "loadSongByProgram", false, {}, {}));
     * 
     * @method bindingPointInfo
     * @return {Promise|BindingPointInfo4[]} A promise to return an array of BindingPointInfo
     */
	 async bindingPointInfo(bindableId, bindingPointId, source, bindableParams, bindingPointParams)
	{
        await this.owner.untilConnected();
        return (await this.request("GET", "/bindingPointInfo", {
			bindableId: bindableId,
			bindingPointId: bindingPointId,
			source: source,
			bindableParams: bindableParams,
			bindingPointParams: bindingPointParams
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
     *     C.bindings4.invoke("masterLevels", "outputGain", 0.5);
     * 
     * @example
     * 
     * Suspend the 2nd plugin in the song
	 * 
     *     C.bindings4.invoke("indexedPlugin", "suspend", true, { 
	 * 		rackIndex: 0,
	 *      pluginIndex: 1,
	 * 		}
	 *    );
     * 
	 * 
	 * @example
	 * 
	 * Sending a MIDI Controller Event
	 * 
	 *     C.bindings4.invoke("midiPorts", "out.Main Keyboard", 65, {
	 *         kind: "Controller",
	 *         controller: 10,
	 * 		   channel: 0
	 * 	   });
	 *
	 * @example
	 * 
	 * Sending MIDI Data directly
	 * 
	 *     C.bindings4.invoke("midiPorts", "out.Main Keyboard", [ 0xb0, 23, 99 ]);
	 * 
	 * @example
	 * 
	 * Sending MIDI Sysex Data directly
	 * 
	 *     C.bindings4.invoke("midiPorts", "out.Main Keyboard", [ 0xF7, 0x00, 0x00, 0x00, 0xF0 ]);
	 * 
     * @example
     * 
     * Some binding points expect parameters.  Parameter values are similar to the `value` parameter
     * in that they specify a value to invoke on the target of the binding.  The difference is related to the
     * way they're managed internally for user created bindings.  The `value` comes from the source of the binding 
     * whereas parameters are stored with the binding itself.
     * 
     * eg: Load the song with program number 12
	 * 
     *     C.bindings4.invoke("setList", "loadSongWithProgram", null, null, {
	 * 			program: 12
	 *     });
     * 
     * @param {String} bindableId The id of the bindable object
     * @param {String} bindingPointId The id of the binding point to invoke
     * @param {Object} [value] The value to pass to the binding point
     * @param {Object} [bindableParams] Parameters for the bindable object
     * @param {Object} [bindingPointParams] Parameters for the binding point object
     * @method invoke
     * @return {Promise} A promise that resolves once the target binding point has been invoked
     */
    async invoke(bindableId, bindingPointId, value, bindableParams, bindingPointParams)
    {
        return (await this.request("POST", "/invoke", {
            bindableId, bindingPointId, value, bindableParams, bindingPointParams
        }));
    }

    /**
     * Queries a source binding point for it's current value.
     *
     * @example
     * 
     *     console.log("Current Output Gain:", await C.bindings4.query("masterLevels", "outputGain"));
     * 
	 * @method query
     * @param {String} bindableId The id of the bindable object
     * @param {String} bindingPointId The id of the binding point to query
     * @param {Object} [bindableParams] Parameters for the bindable object
     * @param {Object} [bindingPointParams] Parameters for the binding point object
	 * @return {Object} The current value of the binding source
     */
    async query(bindableId, bindingPointId, indicies)
    {
        return (await this.request("POST", "/query", {
            bindableId, bindingPointId, bindableParams, bindingPointParams
        })).data.value;
    }

	/**
	 * Starts watching a source binding point for changes (or invocations)
	 * 
	 * @example
	 * 
	 * Using a callback function:
	 * 
	 *     let C = new CantabileApi();
	 *     
	 *     // Watch a source binding point using a callback function
	 *     C.bindings4.watch("masterLevels", "outputGain", null, null, function(value) {
	 *         console.log("Master output gain changed to:", value);
	 *     })
	 *     
	 * 	   // The "bindings" end point must be opened before callbacks will happen
	 *     C.bindings4.open();
	 * 
	 * @example
	 * 
	 * Using the Binding4Watcher class and events:
	 * 
	 *     let C = new CantabileApi();
	 *     let watcher = C.bindings4.watch("masterLevels", "outputGain");
	 *     watcher.on('invoked', function(value) {
	 *         console.log("Master output gain changed to:", value);
	 *     });
	 *     
	 * 	   // The "bindings" end point must be opened before callbacks will happen
	 *     C.bindings4.open();
	 *     
	 *     /// later, stop listening
	 *     watcher.unwatch();
	 * 
	 * @example
	 * 
	 * Watching for a MIDI event:
	 * 
     *     C.bindings4.watch("midiPorts", "in.Onscreen Keyboard", null, {
     *         channel: 0,
     *         kind: "ProgramChange",
     *         controller: -1,
     *     }, function(value) {
     *         console.log("Program Change: ", value);
     *     })
	 * 
	 * @example

	 * Watching for a keystroke:
	 * 
	 *     C.bindings4.watch("pckeyboard", "keyPress", null, {
	 * 			key: "Ctrl+Alt+M"
	 * 	   }, function() {
     *         console.log("Key press!");
     *     })
	 * 
	 * 
	 * 
	 *
	 * @method watch
     * @param {String} bindableId The id of the bindable object
     * @param {String} bindingPointId The id of the binding point to query
     * @param {Object} [bindableParams] Parameters for the bindable object
     * @param {Object} [bindingPointParams] Parameters for the binding point object
	 * @param {Function} [callback] Optional callback function to be called when the source binding triggers
	 * 
	 * The callback function has the form function(value, source) where value is the new binding point value and source
	 * is the Binding4Watcher instance.
	 * 
	 * @return {Binding4Watcher}
	 */
	watch(bindableId, bindingPointId, bindableParams, bindingPointParams, callback)
	{
		let w = new Binding4Watcher(this, bindableId, bindingPointId, bindableParams, bindingPointParams, callback);
		this._watchers.push(w);

		if (this._watchers.length == 1)
			this.open();

		if (this.isOpen)
			w._start();

		return w;
	}

	_registerWatchId(watchId, watcher)
	{
		this._watchIds[watchId] = watcher;
	}

	_revokeWatchId(watchId)
	{
		delete this._watchIds[watchId];
	}

	_revokeWatcher(w)
	{
		this._watchers = this._watchers.filter(x=>x != w);
		if (this._watchers.length == 0)
			this.close();
	}

	_onEvent_invoked(data)
	{
		// Get the watcher
		let w = this._watchIds[data.watchId];
		if (w)
		{
			w._update(data);
		}
	}
}



module.exports = Bindings4;