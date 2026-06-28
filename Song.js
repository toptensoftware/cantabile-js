import EndPoint from './EndPoint.js';

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
		this.data = data;
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


export default Song;