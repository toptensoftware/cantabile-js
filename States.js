'use strict';

const debug = require('debug')('Cantabile');
const EndPoint = require('./EndPoint');

/**
 * Base states functionality for State and racks
 * 
 * @class States
 * @extends EndPoint
 */
class States extends EndPoint
{
	constructor(owner, endPoint)
	{
		super(owner, endPoint);
		this._currentState = null;
	}

	_onOpen()
	{
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
	}

	_onClose()
	{
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
	}

	/**
	 * An array of states
	 * @property items
	 * @type {State[]}
	 */
	get items() { return this._data ? this._data.items : null; }

	/**
	 * The display name of the containing song or rack
	 * @property name
	 * @type {String} 
	 */
	get name() { return this._data ? this._data.name : null; }

	/**
	 * The index of the currently loaded State (or -1 if no active state)
	 * @property currentStateIndex
	 * @type {Number}
	 */
	get currentStateIndex() { return this._data.items.indexOf(this._currentState); }

	/**
	 * The currently loaded item (or null if no active state)
	 * @property currentState
	 * @type {State}
	 */
	get currentState() { return this._currentState; }

	/**
	 * Load the State at a given index position
	 * @method loadStateByIndex
	 * @param {Number} index The zero based index of the State to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadStateByIndex(index, delayed)
	{
		this.post("/loadStateByIndex", {
			index: index,
			delayed: delayed,
		})
	}

	/**
	 * Load the State with a given program number
	 * @method loadStateByProgram
	 * @param {Number} index The zero based program number of the State to load
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadStateByProgram(pr, delayed)
	{
		this.post("/loadStateByProgram", {
			pr: pr,
			delayed: delayed,
		})
	}

	/**
	 * Load the first state
	 * @method loadFirstState
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadFirstState(delayed)
	{
		this.post("/loadFirstState", {
			delayed: delayed,
		})
	}

	/**
	 * Load the last state
	 * @method loadLastState
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 */
	loadLastState(delayed)
	{
		this.post("/loadLastState", {
			delayed: delayed,
		})
	}

	/**
	 * Load the next or previous state
	 * @method loadNextState
	 * @param {Number} direction Direction to move (1 = next, -1 = previous)
	 * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
	 * @param {Boolean} [wrap=false] Whether to wrap around at the start/end
	 */
	loadNextState(direction, delayed, wrap)
	{
		this.post("/loadNextState", {
			direction: direction,
			delayed: delayed,
			wrap: wrap,
		})
	}


	_resolveCurrentState()
	{
		// Check have data and current index is in range and record the current State
		if (this._data && this._data.current>=0 && this._data.current < this._data.items.length)
		{
			this._currentState = this._data.items[this._data.current];
		}
		else
		{
			this._currentState = null;
		}
	}

	_onEvent_songChanged(data)
	{
		this._data = data;
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');
	}

	_onEvent_itemAdded(data)
	{
		this._data.items.splice(data.index, 0, data.item);
		this.emit('itemAdded', data.index);
		this.emit('changed');

		/**
		 * Fired after a new state has been added
		 *
		 * @event itemAdded
		 * @param {Number} index The zero based index of the newly added item 
		 */

		/**
		 * Fired when anything about the contents of state list changes
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
		 * Fired after a state has been removed
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
		 * Fired when an item has been moved
		 *
		 * @event itemMoved
		 * @param {Number} from The zero based index of the item before being moved
		 * @param {Number} to The zero based index of the item's new position
		 */
	}

	_onEvent_itemChanged(data)
	{
		if (this.currentStateIndex == data.index)
			this._currentState = data.item;

		this._data.items.splice(data.index, 1, data.item);		// Don't use [] so Vue can handle it

		this.emit('itemChanged', data.index);
		this.emit('changed');

		/**
		 * Fired when something about an state has changed
		 *
		 * @event itemChanged
		 * @param {Number} index The zero based index of the item that changed
		 */

	}
	_onEvent_itemsReload(data)
	{
		this._data.items = data.items;
		this._data.current = data.current;
		this._resolveCurrentState();
		this.emit('reload');
		this.emit('changed');

		/**
		 * Fired when the entire set of states has changed (eg: after a sort operation, or loading a new song/rack)
		 * 
		 * @event reload
		 */
	}

	_onEvent_currentStateChanged(data)
	{
		this._data.current = data.current;
		this._resolveCurrentState();
		this.emit('currentStateChanged');

		/**
		 * Fired when the current state changes
		 * 
		 * @event currentStateChanged
		 */
	}

	_onEvent_nameChanged(data)
	{
		if (this._data)
			this._data.name = data ? data.name : null;
		this.emit('nameChanged');
		this.emit('changed');

		/**
		 * Fired when the name of the containing song or rack changes
		 * 
		 * @event nameChanged
		 */
	}
}



module.exports = States;