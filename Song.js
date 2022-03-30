'use strict';

const EndPoint = require('./EndPoint');

/**
 * Interface to the current song
 * 
 * Access this object via the {{#crossLink "Cantabile/song:property"}}{{/crossLink}} property.
 *
 * @class Song
 * @extends EndPoint
 */
class SongStates extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/song");
	}

	_onOpen()
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
		 * @event changed
		 */
		this.emit('nameChanged');

		/**
		 * Fired when the current song state changes
		 *
		 * @event changed
		 */
		this.emit('currentStateChanged');
	}

	_onClose()
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
	get name() { return this._data ? this._data.name : null; }

	/**
	 * The name of the current song state
	 * @property currentState
	 * @type {String}
	 */
	get currentState() { return this._data ? this._data.currentState : null; }

	_onEvent_songChanged(data)
	{
		this._data = data;
		this.emit('changed');
		this.emit('nameChanged');
		this.emit('currentStateChanged');
	}

	_onEvent_nameChanged(data)
	{
		this._data.name = data.name;
		this.emit('changed');
		this.emit('nameChanged');
	}

	_onEvent_currentStateChanged(data)
	{
		this._data.currentState = data.currentState;
		this.emit('changed');
		this.emit('currentStateChanged');
	}

}


module.exports = SongStates;