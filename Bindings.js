import _debug from 'debug';
import EndPoint from './EndPoint';
import EventEmitter from 'events';

const debug = _debug('Cantabile');

/**
 * Represents an active connection watching a source binding point for changes/invocations

 * Returned from the {{#crossLink "Bindings/watch:method"}}{{/crossLink}} method.
 * 
 * @class BindingWatcher
 * @extends EventEmitter
 */
class BindingWatcher extends EventEmitter
{
	constructor(owner, name, indicies, condition, listener)
	{
		super();
		this.owner = owner;
		this._name = name;
		this._indicies = indicies;
		this._condition = condition;
        this._listener = listener;
        this._value = null;
	}

	/**
	 * Returns the name of the binding point being listened to
	 *
	 * @property name
	 * @type {String} 
	 */
	get name() { return this._name; }

	/**
	 * Returns the indicies of the binding point being listened to
	 *
	 * @property indicies
	 * @type {Number[]} 
	 */
    get indicies() { return this._indicies; }
    
	/**
	 * Returns the condition of the binding point being listened to
	 *
	 * @property condition
	 * @type {Object} 
	 */
    get condition() { return this._condition; }

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
            name: this._name,
            indicies: this._indicies,
            condition: this._condition
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
		if (this._listener)
			this._listener(this._value, this);

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
        super(owner, "/api/bindings");
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
     *     console.log(await C.bindings.availableBindingPoints());
     * 
     * @method availableBindingPoints
     * @return {Promise|BindingPointInfo[]} A promise to return an array of BindingPointInfo
     */
    async availableBindingPoints()
    {
        await this.owner.untilConnected();
        return (await this.request("GET", "/availableBindingPoints")).data;
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
     *     C.bindings.invoke("global.masterLevels.outputGain", 0.5);
     * 
     * @example
     * 
     * Suspend the 2nd plugin in the song
	 * 
     *     C.bindings.invoke("global.indexedPlugin.suspend", true, [
     * 	        0,     // Rack index (zero = song)
     *          1      // Plugin index (zero based, 1 = the second plugin)
     * 		]);
     * 
	 * 
	 * @example
	 * 
	 * Sending a MIDI Controller Event
	 * 
	 *     C.bindings.invoke("midiInputPort.Main Keyboard", new {
	 *         kind: "FineController",
	 *         controller: 10,
	 *         value: 1000,
	 * 	   });
	 *
	 * @example
	 * 
	 * Sending MIDI Data directly
	 * 
	 *     C.bindings.invoke("midiInputPort.Main Keyboard", [ 0xb0, 23, 99 ]);
	 * 
	 * @example
	 * 
	 * Sending MIDI Sysex Data directly
	 * 
	 *     C.bindings.invoke("midiInputPort.Main Keyboard", [ 0xF7, 0x00, 0x00, 0x00, 0xF0 ]);
	 * 
     * @example
     * 
     * Some binding points expect a "parameter" value.  Parameter values are similar to the `value` parameter
     * in that they specify a value to invoke on the target of the binding.  The difference is related to the
     * way they're managed internally for user created bindings.  The `value` comes from the source of the binding 
     * whereas a `parameter` value is stored with the binding itself.
     * 
     * eg: Load the song with program number 12
	 * 
     *     C.bindings.invoke("global.setList.loadSpecificSongByProgramInstant", null, null, 12);
     * 
     * @param {String} name The name of the binding point to invoke
     * @param {Object} [value] The value to pass to the binding point
     * @param {Number[]} [indicies] The integer indicies of the target binding point
     * @param {Object} [parameter] The parameter value to invoke the target with
     * @method invoke
     * @return {Promise} A promise that resolves once the target binding point has been invoked
     */
    async invoke(name, value, indicies, parameter)
    {
        return (await this.request("POST", "/invoke", {
            name: name,
            value: value,
            indicies: indicies,
            parameter: parameter,
        }));
    }

    /**
     * Queries a source binding point for it's current value.
     *
     * If Cantabile is running on your local machine a full list of available binding
     * points is [available here](http://localhost:35007/api/bindings/availableBindingPoints)
     * 
     * @example
     * 
     *     console.log("Current Output Gain:", await C.bindings.query("global.masterLevels.outputGain"));
     * 
	 * @method query
     * @param {String} name The name of the binding point to query
     * @param {Number[]} [indicies] The integer indicies of the binding point
	 * @return {Object} The current value of the binding source
     */
    async query(name, indicies)
    {
        return (await this.request("POST", "/query", {
            name: name,
            indicies: indicies,
        })).data.value;
    }

	/**
	 * Starts watching a source binding point for changes (or invocations)
	 * 
     * If Cantabile is running on your local machine a full list of available binding
     * points is [available here](http://localhost:35007/api/bindings/availableBindingPoints)
     *
	 * @example
	 * 
	 * Using a callback function:
	 * 
	 *     let C = new CantabileApi();
	 *     
	 *     // Watch a source binding point using a callback function
	 *     C.bindings.watch("global.masterLevels.outputGain", null, null, function(value) {
	 *         console.log("Master output gain changed to:", value);
	 *     })
	 *     
	 * 	   // The "bindings" end point must be opened before callbacks will happen
	 *     C.bindings.open();
	 * 
	 * @example
	 * 
	 * Using the BindingWatcher class and events:
	 * 
	 *     let C = new CantabileApi();
	 *     let watcher = C.bindings.watch("global.masterLevels.outputGain");
	 *     watcher.on('invoked', function(value) {
	 *         console.log("Master output gain changed to:", value);
	 *     });
	 *     
	 * 	   // The "bindings" end point must be opened before callbacks will happen
	 *     C.bindings.open();
	 *     
	 *     /// later, stop listening
	 *     watcher.unwatch();
	 * 
	 * @example
	 * 
	 * Watching for a MIDI event:
	 * 
     *     C.bindings.watch("midiInputPort.Onscreen Keyboard", null, {
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
	 *     C.bindings.watch("global.pckeyboard.keyPress", null, "Ctrl+Alt+M", function() {
     *         console.log("Key press!");
     *     })
	 * 
	 * 
	 * 
	 *
	 * @method watch
     * @param {String} name The name of the binding point to query
     * @param {Number[]} [indicies] The integer indicies of the binding point
     * @param {Object} [condition] The condition for triggering the binding
	 * @param {Function} [callback] Optional callback function to be called when the source binding triggers
	 * 
	 * The callback function has the form function(resolved, source) where resolved is the resolved display string and source
	 * is the BindingWatcher instance.
	 * 
	 * @return {BindingWatcher}
	 */
	watch(name, indicies, condition, listener)
	{
		let w = new BindingWatcher(this, name, indicies, condition, listener);
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



export default Bindings;