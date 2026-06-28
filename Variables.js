import _debug from 'debug';
import EndPoint from './EndPoint.js';
import EventEmitter from 'events';

const debug = _debug('Cantabile');

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
			this.owner.send("POST", "/unwatch", { patternId: this._patternId})
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
		if (this.watchers.length == 0)
			this.close();
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



export default Variables;