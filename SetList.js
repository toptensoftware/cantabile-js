'use strict';

const debug = require('debug')('Cantabile');
const EndPoint = require('./EndPoint');

/**
 * Used to access and control Cantabile's set list functionality.
 * 
 * Access this object via the {{#crossLink "Cantabile/setList:property"}}{{/crossLink}} property.
 *
 * @class SetList
 * @extends EndPoint
 */
class SetList extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/setlist");
		this._currentSong = null;
	}

	_onOpen()
	{
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');
		this.emit('preLoadedChanged');
	}

	_onClose()
	{
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');
		this.emit('preLoadedChanged');
	}

	/**
	 * An array of items in the set list
	 * @property items
	 * @type {SetListItem[]}
	 */
	get items() { return this._data ? this._data.items : null; }

	/**
	 * The display name of the current set list (ie: its file name with path and extension removed)
	 * @property name
	 * @type {String} 
	 */
	get name() { return this._data ? this._data.name : null; }

	/**
	 * Indicates if the set list is currently pre-loaded
	 * @property preLoaded
	 * @type {Boolean}
	 */
	get preLoaded() { return this._data ? this._data.preLoaded : false; }

	/**
	 * The index of the currently loaded song (or -1 if the current song isn't in the set list)
	 * @property currentSongIndex
	 * @type {Number}
	 */
	get currentSongIndex() 
	{ 
		if (!this._currentSong)
			return -1;
		if (!this._data)
			return -1;
		return this._data.items.indexOf(this._currentSong); 
	}

	/**
	 * The currently loaded item (or null if the current song isn't in the set list)
	 * @property currentSong
	 * @type {SetListItem}
	 */
	get currentSong() { return this._currentSong; }

	/**
	 * Load the song at a given index position
	 * @method loadSongByIndex
	 * @param {Number} index The zero based index of the song to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadSongByIndex(index, delayed)
	{
		this.post("/loadSongByIndex", {
			index: index,
			delayed: delayed,
		})
	}

	/**
	 * Load the song with a given program number
	 * @method loadSongByProgram
	 * @param {Number} index The zero based program number of the song to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadSongByProgram(pr, delayed)
	{
		this.post("/loadSongByProgram", {
			pr: pr,
			delayed: delayed,
		})
	}

	/**
	 * Load the first song in the set list
	 * @method loadFirstSong
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadFirstSong(delayed)
	{
		this.post("/loadFirstSong", {
			delayed: delayed,
		})
	}

	/**
	 * Load the last song in the set list
	 * @method loadLastSong
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadLastSong(delayed)
	{
		this.post("/loadLastSong", {
			delayed: delayed,
		})
	}

	/**
	 * Load the next or previous song in the set list
	 * @method loadNextSong
	 * @param {Number} direction Direction to move (1 = next, -1 = previous)
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 * @param {Boolean} [wrap=false] Whether to wrap around at the start/end of the list
	 */
	loadNextSong(direction, delayed, wrap)
	{
		this.post("/loadNextSong", {
			direction: direction,
			delayed: delayed,
			wrap: wrap,
		})
	}


	_resolveCurrentSong()
	{
		// Check have data and current index is in range and record the current song
		if (this._data && this._data.current>=0 && this._data.current < this._data.items.length)
		{
			this._currentSong = this._data.items[this._data.current];
		}
		else
		{
			this._currentSong = null;
		}
	}

	_onEvent_setListChanged(data)
	{
		this._data = data;
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');
		this.emit('preLoadedChanged');
	}

	_onEvent_itemAdded(data)
	{
		this._data.items.splice(data.index, 0, data.item);
		this.emit('itemAdded', data.index);
		this.emit('changed');

		/**
		 * Fired after a new item has been added to the set list
		 *
		 * @event itemAdded
		 * @param {Number} index The zero based index of the newly added item 
		 */

		/**
		 * Fired when anything about the contents of the set list changes
		 *
		 * @event changed
		 */

	}
	_onEvent_itemRemoved(data)
	{
		this._data.items.splice(data.index, 1);		
		this.emit('itemRemoved', data.index);
		this.emit('changed');

		/**
		 * Fired after an item has been removed from the set list
		 *
		 * @event itemRemoved
		 * @param {Number} index The zero based index of the removed item 
		 */

	}
	_onEvent_itemMoved(data)
	{
		var item = this._data.items[data.from];
		this._data.items.splice(data.from, 1);		
		this._data.items.splice(data.to, 0, item);
		this.emit('itemMoved', data.from, data.to);
		this.emit('changed');

		/**
		 * Fired when an item in the set list has been moved
		 *
		 * @event itemMoved
		 * @param {Number} from The zero based index of the item before being moved
		 * @param {Number} to The zero based index of the item's new position
		 */
	}

	_onEvent_itemChanged(data)
	{
		if (this.currentSongIndex == data.index)
			this._currentSong = data.item;

		this._data.items.splice(data.index, 1, data.item);		// Don't use [] so Vue can handle it

		this.emit('itemChanged', data.index);
		this.emit('changed');

		/**
		 * Fired when something about an item has changed
		 *
		 * @event itemChanged
		 * @param {Number} index The zero based index of the item that changed
		 */

	}
	_onEvent_itemsReload(data)
	{
		this._data.items = data.items;
		this._data.current = data.current;
		this._resolveCurrentSong();
		this.emit('reload');
		this.emit('changed');

		/**
		 * Fired when the entire set list has changed (eg: after a sort operation, or loading a new set list)
		 * 
		 * @event reload
		 */
	}

	_onEvent_preLoadedChanged(data)
	{
		this._data.preLoaded = data.preLoaded;
		this.emit('preLoadedChanged');

		/**
		 * Fired when the pre-loaded state of the list has changed
		 * 
		 * @event preLoadedChanged
		 */
	}

	_onEvent_currentSongChanged(data)
	{
		this._data.current = data.current;
		this._resolveCurrentSong();
		this.emit('currentSongChanged');

		/**
		 * Fired when the currently loaded song changes
		 * 
		 * @event currentSongChanged
		 */
	}

	_onEvent_currentSongPartChanged(data)
	{
		this.emit('currentSongPartChanged', data.part, data.partCount);

		/**
		 * Fired when the part of the currently loaded song changes
		 * 
		 * @event currentSongPartChanged
		 * @param {Number} part The zero-based current song part index (can be -1)
		 * @param {Number} partCount The number of parts in the current song
		 */
	}

	_onEvent_nameChanged(data)
	{
		if (this._data)
			this._data.name = data ? data.name : null;
		this.emit('nameChanged');
		this.emit('changed');

		/**
		 * Fired when the name of the currently loaded set list changes
		 * 
		 * @event nameChanged
		 */
	}
}



module.exports = SetList;