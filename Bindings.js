import _debug from 'debug';
import EndPoint from './EndPoint.js';
import EventEmitter from 'events';

const debug = _debug('Cantabile');

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
			this.owner.send("POST", "/unwatch", { watchId: this.#watchId})
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
	#watchIds = {};

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
		this.#watchers = this.#watchers.filter(x=>x != w);
		if (this.#watchers.length == 0)
			this.close();
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



export default Bindings;