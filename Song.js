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
		this.emit('changed');
		this.emit('nameChanged');
		this.emit('currentStateChanged');
	}

	get name() { return this._data ? this._data.name : null; }
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