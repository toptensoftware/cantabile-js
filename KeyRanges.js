import EndPoint from './EndPoint';

/**
 * Provides access to information about the currently active set of key ranges
 * 
 * Access this object via the {{#crossLink "Cantabile/keyRanges:property"}}{{/crossLink}} property.
 *
 * @class KeyRanges
 * @extends EndPoint
 */
class KeyRanges extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/keyranges");
	}

	_onOpen()
	{
		/**
		 * Fired when the active set of key ranges has changed
		 *
		 * @event changed
		 */
		this.emit('changed');
	}

	_onClose()
	{
		this.emit('changed');
	}

	/**
	 * An array of {{#crossLink "KeyRange"}}{{/crossLink}} items
	 * @property items
	 * @type {KeyRange[]}
	 */
	get items() { return this._data ? this._data.items : null; }

	_onEvent_keyRangesChanged(data)
	{
		this._data = data;
		this.emit('changed');
	}
}



export default KeyRanges;