import { EndPoint } from './EndPoint.js';

/**
 * Provides access to information about the currently active set of key ranges
 * 
 * Access this object via the {@linkcode Cantabile#keyRanges} property.
 *
 * @class KeyRanges
 * @extends EndPoint
 */
export class KeyRanges extends EndPoint
{
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/keyranges");
	}

	_onConnected()
	{
		/**
		 * Fired when the active set of key ranges has changed
		 *
		 * @event changed
		 */
		this.emit('changed');
	}

	_onDisconnected()
	{
		this.emit('changed');
	}

	/**
	 * An array of {@linkcode KeyRange} items
	 * @property items
	 * @type {KeyRange[]}
	 */
	get items() { return this.data ? this.data.items : null; }

	_onEvent_keyRangesChanged(data)
	{
		this._setData(data);
		this.emit('changed');
	}
}
