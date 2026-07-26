import { EndPoint } from './EndPoint.js';

/**
 * Fired when the active set of key ranges has changed
 *
 * @event KeyRanges#changed
 */

/**
 * Provides access to information about the currently active set of key ranges
 * 
 * Access this object via the {@linkcode Cantabile#keyRanges} property.
 * @fires KeyRanges#changed
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
