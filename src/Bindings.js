import { EndPoint } from './EndPoint.js';
import EventEmitter from 'events';


/**
 * Represents an watched binding point for changes/invocations

 * Returned from the {@linkcode Bindings#watch} method.
 * 
 * @class BindingWatcher
 * @extends EventEmitter
 */
export class BindingWatcher extends EventEmitter
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
			this.#owner.send("POST", "/unwatch", { watchId: this.#watchId})
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

 * Returned from the {@linkcode Bindings#prepare} method.
 * 
 * @class PreparedBindingPoint
 */
export class PreparedBindingPoint
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
				this.#connectPromiseReject(err)
			})
	}

	_stop()
	{
		if (this.#owner._epid && this.#prepId)
		{
			this.#owner.send("POST", "/unprepare", { prepId: this.#prepId })
			this.#prepId = 0;
			this.#prepareConnectPromise();
		}
	}

	/**
	 * Returns a promise that will resolve once this prepared binding has connected
	 * @method waitForConnected
	 * @returns {Promise<void>}}
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
     * @returns {Promise<void>} A promise that resolves once the target binding point has been invoked
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
 * Access this object via the {@linkcode Cantabile#bindings} property.
 *
 * @class Bindings
 * @extends EndPoint
 */
export class Bindings extends EndPoint
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
	 * directly at <http://localhost:35007/api/bindings/availableBindingPoints>
     * 
     * @example
     * 
     * console.log(await C.bindings.getAvailableBindingPoints());
     * 
     * @method getAvailableBindingPoints
     * @returns {Promise<BindingPointEntry[]>} A promise to return an array of {@linkcode BindingPointEntry} objects
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
     * console.log(await C.bindings.getBindingPointInfo("setList", "loadSongByProgram", false, {}, {}));
     * 
     * @method getBindingPointInfo
	 * @param {BindingPoint} bindingPoint the binding point to be queried
	 * @param {Boolean} source whether to return information about the source or target version of the binding point
     * @returns {Promise<BindingPointInfo>} A promise to return a {@linkcode BindingPointInfo} object
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
     * // Set the master output level gain
     * C.bindings.invoke({ 
	 *     bindableId: "masterLevels", 
	 *     bindingPointId: "outputGain"
	 * }, 0.5);
     * 
     * @example
     * 
     * // Suspend the 2nd plugin in the song
	 * C.bindings.invoke({ 
	 *     bindableId: "indexedPlugin", 
	 *     bindableParams: { 
	 *         rackIndex: 0, 			// 0 = song, 1 = first rack, 2 = second etc...
	 *         pluginIndex: 1, 		// 1 = second plugin (zero based)
	 *     }
	 *     bindingPointId: "suspend"
	 * }, true);
     * 
	 * 
	 * @example
	 * 
	 * // Sending a MIDI Controller Event
	 * C.bindings.invoke({
	 *     bindableId: "midiPorts", 
	 *     bindingPointId: "out.Main Keyboard",
	 *     bindingPointParams: {
	 *         kind: "Controller",
	 *         controller: 10,
	 *         channel: 0
	 *     }
	 * }, 65);
	 *
	 * @example
	 * 
	 * // Sending MIDI Data directly
	 * C.bindings.invoke({
	 *    bindiableId: "midiPorts", 
	 *    bindingPointId: "out.Main Keyboard"
	 * }, [ 0xb0, 23, 99 ]);
	 * 
	 * @example
	 * 
	 * // Sending MIDI Sysex Data directly
	 * C.bindings.invoke({
	 *     bindiableId: "midiPorts", 
	 *     bindingPointId: "out.Main Keyboard"
	 * }, [ 0xF7, 0x00, 0x00, 0x00, 0xF0 ]);
	 * 
     * @method invoke
     * @param {BindingPoint} bindingPoint The binding point to invoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Promise<void>} A promise that resolves once the target binding point has been invoked
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
     * console.log("Current Output Gain:", await C.bindings.query({ 
	 *     bindableId: "masterLevels", 
	 *     bindingPointId: "outputGain"
     * }));
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
	 * // Using a callback function:
	 * C.bindings.watch({
	 *     bindableId: "masterLevels", 
	 *     bindingPointId: "outputGain",
	 * }, (value) => console.log("Master output gain changed to:", value));
	 *     
	 * @example
	 * 
	 * // Using the BindingWatcher class and events:
	 * let watcher = C.bindings.watch({
	 *     bindableId: "masterLevels", 
	 *     bindingPointId: "outputGain",
	 * });
	 * watcher.on('invoked', function(value) {
	 *     console.log("Master output gain changed to:", value);
	 * });
	 * 
	 * /// later, stop listening
	 * watcher.unwatch();
	 * 
	 * @example
	 * 
	 * // Watching for a MIDI event:
     * C.bindings.watch({
	 *     bindableId: "midiPorts", 
	 *     bindingPointId: "in.Onscreen Keyboard", 
	 *     bindingPointParams: {
     *         channel: 0,
     *         kind: "ProgramChange",
     *         controller: -1,
     * }, (value) => console.log("Program Change: ", value));
	 * 
	 * @example
	 * 
	 * // Watching for a keystroke:
	 * C.bindings.watch({
	 *     bindableId: "pckeyboard", 
	 *     bindingPointId: "keyPress", 
	 *     bindingPointParams:  {
	 *         key: "Ctrl+Alt+M"
	 *     },
	 * }, () => console.log("Key press!"));
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


