'use strict';

const debug = require('debug')('Cantabile');
const EndPoint = require('./EndPoint');

/**
 * Used to access the current set of show notes
 * 
 * Access this object via the {{#crossLink "Cantabile/showNotes:property"}}{{/crossLink}} property.
 *
 * @class ShowNotes
 * @extends EndPoint
 */
class ShowNotes extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/shownotes");
	}

	_onOpen()
	{
		this.emit('reload');
		this.emit('changed');
	}

	_onClose()
	{
		this.emit('reload');
		this.emit('changed');
	}

	/**
	 * An array of show note items
	 * @property items
	 * @type {ShowNote[]}
	 */
	get items() { return this._data ? this._data.items : null; }

	_onEvent_itemAdded(data)
	{
		this._data.items.splice(data.index, 0, data.item);
		this.emit('itemAdded', data.index);
		this.emit('changed');

		/**
		 * Fired after a new show note has been added
		 *
		 * @event itemAdded
		 * @param {Number} index The zero based index of the newly added item 
		 */

		/**
		 * Fired when anything about the current set of show notes changes
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
		 * Fired after a show note has been removed
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
		 * Fired when an show note has been moved
		 *
		 * @event itemMoved
		 * @param {Number} from The zero based index of the item before being moved
		 * @param {Number} to The zero based index of the item's new position
		 */
	}

	_onEvent_itemChanged(data)
	{
		this._data.items.splice(data.index, 1, data.item);		// Don't use [] so Vue can handle it

		this.emit('itemChanged', data.index);
		this.emit('changed');

		/**
		 * Fired when something about an show note has changed
		 *
		 * @event itemChanged
		 * @param {Number} index The zero based index of the item that changed
		 */

	}
	_onEvent_itemsReload(data)
	{
		this._data.items = data.items;
		this.emit('reload');
		this.emit('changed');

		/**
		 * Fired when the entire set of show notes has changed (eg: after  loading a new song)
		 * 
		 * @event reload
		 */
	}
}



module.exports = ShowNotes;