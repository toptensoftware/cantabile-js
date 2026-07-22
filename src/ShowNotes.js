import { EndPoint } from './EndPoint.js';

/**
 * Fired after a new show note has been added
 *
 * @event ShowNotes#itemAdded
 * @property {Number} index The zero based index of the newly added item 
 */

/**
 * Fired when anything about the current set of show notes changes
 *
 * @event ShowNotes#changed
 */

/**
 * Fired after a show note has been removed
 *
 * @event ShowNotes#itemRemoved
 * @property {Number} index The zero based index of the removed item 
 */

/**
 * Fired when an show note has been moved
 *
 * @event ShowNotes#itemMoved
 * @property {Number} from The zero based index of the item before being moved
 * @property {Number} to The zero based index of the item's new position
 */

/**
 * Fired when something about an show note has changed
 *
 * @event ShowNotes#itemChanged
 * @property {Number} index The zero based index of the item that changed
 */

/**
 * Fired when the entire set of show notes has changed (eg: after  loading a new song)
 * 
 * @event ShowNotes#reload
 */


/**
 * Fired when the markdown notes have changed
 *
 * @event ShowNotes#markdownChanged
 */


/** Used to access the current set of show notes
 * 
 * Access this object via the {@linkcode Cantabile#showNotes} property.
 * @fires ShowNotes#itemAdded
 * @fires ShowNotes#changed
 * @fires ShowNotes#itemRemoved
 * @fires ShowNotes#itemMoved
 * @fires ShowNotes#itemChanged
 * @fires ShowNotes#reload
 * @fires ShowNotes#markdownChanged
 *
 */
export class ShowNotes extends EndPoint
{
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/shownotes");
	}

	_onConnected()
	{
		this.emit('reload');
		this.emit('changed');
		this.emit('markdownChanged');
	}

	_onDisconnected()
	{
		this.emit('reload');
		this.emit('changed');
		this.emit('markdownChanged');
	}

	/**
	 * Get's the original v1 show notes in raw json format
	 * @returns {Promise<object>} Returns a promise for the JSON data
	 */
	async getV1Raw()
	{
		return (await this.get("/v1raw")).data;
	}

	/**
	 * An array of {@linkcode ShowNote} items
	 * @property items
	 * @type {ShowNote[]}
	 */
	get items() { return this.data ? this.data.items : null; }

	/**
	 * The markdown show notes
	 */
	get markdown() { return this.data?.markdown}

	/**
	 * Stores the markdown notes		 for the current song
	 * 
	 * @param {string} markdown The markdown to store
	 * @returns {Promise<void>} A promise that resolves when the markdown has been stored with the song
	 */
	storeMarkdown(markdown)
	{
		return this.post("/markdown", { markdown });
	}

	_onEvent_itemAdded(data)
	{
		this.data.items.splice(data.index, 0, data.item);
		this.emit('itemAdded', data.index);
		this.emit('changed');


	}
	_onEvent_itemRemoved(data)
	{
		this.data.items.splice(data.index, 1);		
		this.emit('itemRemoved', data.index);
		this.emit('changed');


	}
	_onEvent_itemMoved(data)
	{
		var item = this.data.items[data.from];
		this.data.items.splice(data.from, 1);		
		this.data.items.splice(data.to, 0, item);
		this.emit('itemMoved', data.from, data.to);
		this.emit('changed');

	}

	_onEvent_itemChanged(data)
	{
		this.data.items.splice(data.index, 1, data.item);		// Don't use [] so Vue can handle it

		this.emit('itemChanged', data.index);
		this.emit('changed');

	}
	_onEvent_itemsReload(data)
	{
		this.data.items = data.items;
		this.data.markdown = data.markdown;
		this.emit('reload');
		this.emit('changed');
		this.emit('markdownChanged');

	}
	_onEvent_markdownChanged(data)
	{
		this.data.markdown = data.markdown;
		this.emit('changed');
		this.emit('markdownChanged');
	}
}
