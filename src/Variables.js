import { EndPoint } from './EndPoint.js';
import EventEmitter from 'events';

/**
 * Represents a monitored pattern string.

 * Returned from the {{#crossLink "Variables/watch:method"}}{{/crossLink}} method.
 *
 * @class PatternWatcher
 * @extends EventEmitter
 */
export class PatternWatcher extends EventEmitter
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
			this.#owner.send("POST", "/unwatch", { patternId: this.#patternId})
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
export class Variables extends EndPoint
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

