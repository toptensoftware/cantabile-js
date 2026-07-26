import { EndPoint } from './EndPoint.js';
import EventEmitter from 'events';

/**
 * Represents a watched document.

 * Returned from the {@linkcode Documents#watch} method.
 *
 * @class DocumentWatcher
 * @extends EventEmitter
 */
export class DocumentWatcher extends EventEmitter
{
	/** @internal */
	constructor(owner, docName, callback)
	{
		super();
		this.#owner = owner;
		this.#docName = docName;	
		this.#watchId = 0;
		this.#content = "";
		this.#callback = callback;
	}

	#owner;
	#docName
	#watchId;
	#content;
	#callback;

	/**
	 * Returns the name of the document being watched
	 *
	 * @property name
	 * @type {String} 
	 */
	get name() { return this.#docName; }

	/**
	 * Returns the current content of the document being watched
	 *
	 * @property content
	 * @type {String} 
	 */
	get content() { return this.#content; }

	/**
	 * Sets the content of the watched document
	 * @param {String} content the new document content
	 * @retursn {Promise<void>} A promise that resolves when the content has been saved
	 */
	async setContent(content)
	{
		return this.#owner.setDocumentContent(this.#docName, content);
	}

	_start()
	{
		this.#owner.post("/watch", {
			docName: this.#docName,
		}).then(r => {
			if (r.data.watchId)
			{
				this.#owner._registerWatchId(r.data.watchId, this);
				this.#watchId = r.data.watchId;
			}
			this.#content = r.data.content;
			this._fireChanged();
		});
	}

	_stop()
	{
		if (this.#owner._epid && this.#watchId)
		{
			this.#owner.send("POST", "/unwatch", { watchId: this.#watchId})
			this.#owner._revokeWatchId(this.#watchId);
			this.#watchId = 0;
			this.#content = "";
			this._fireChanged();
		}
	}

	/**
	 * Stops monitoring this document for changes
	 *
	 * @method unwatch
	 */
	unwatch()
	{
		this._stop();
		this.#owner._revokeWatcher(this);
	}

	_update(data)
	{
		this.#content = data.content;
		this._fireChanged();
	}

	_fireChanged()
	{
		// Callback?
		if (this.#callback)
			this.#callback(this.content, this);

		/**
		 * Fired when the content display string has changed
		 *
		 * @event changed
		 * @param {String} content The new content display string
		 * @param {DocumentWatcher} source This object
		 */
		this.emit('changed', this.content, this);
	}
}



/**
 * Provides access to song's set of documents.
 * 
 * Access this object via the {@linkcode Cantabile#documents} property.
 *
 * @class Documents
 * @extends EndPoint
 */
export class Documents extends EndPoint
{
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/documents");
	}

	#watchers = [];
	#watchIds = {};

	_onConnected()
	{
		this.emit('changed');
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._start();
		}
	}

	_onDisconnected()
	{
		this.emit('changed');
		for (let i=0; i<this.#watchers.length; i++)
		{
			this.#watchers[i]._stop();
		}
	}

	/**
	 * Gets the names of available documents on the current song
	 * @type {string[]}
	 */
	get documentList()
	{
		return this.data?.documents;
	}

	/**
	 * Gets the content of a document.
	 * @param {string} name The document to query
	 * @returns {Promise<string>} A promise that resolves with the document content
	 */
	async getDocumentContent(name)
	{
		await this.waitForConnected();
		return (await this.get(`/document?name=${encodeURIComponent(name)}`)).data.content;
	}

	/**
	 * Sets the content of a document.
	 * Pass `null` to delete a document.
	 * @param {string} name The document to update
	 * @param {string} content The new document content (or `null` to delete)
	 * @returns {Promise<void>} A promise that resolved when the document has been updated
	 */
	async setDocumentContent(name, content)
	{
		return this.post(`/document`, {
			name,
			content,
		});
	}

	/**
	 * Starts watching a document for changes
	 * 
	 * @example
	 * 
	 * // Watch a document using a callback function
	 * C.documents.watch("MainDocument", function(content) {
	 *     console.log(content);
	 * })
	 *     
	 * @example
	 * 
	 * // Using the DocumentWatcher class and events:
	 * let watcher = C.documents.watch("MainDocument");
	 * watcher.on('changed', function(content) {
	 *     console.log(content);
	 * });
	 * 
	 * /// later, stop listening
	 * watcher.unwatch();
	 *
	 * @method watch
	 * @param {String} name The name of the document to watch
	 * @param {DocumentWatcherCallback} [callback] Optional callback function to be called when the content changes.
	 * @returns {DocumentWatcher}
	 */
	watch(name, callback)
	{
		let w = new DocumentWatcher(this, name, callback);
		this.#watchers.push(w);
		if (this.isConnected)
			w._start();

		return w;
	}

	_registerWatchId(watchId, watcher)
	{
		this.#watchIds[watchId] = watcher;
	}

	_revokeWatchId(watchId)
	{
		delete this.#watchIds[watchId];
	}

	_revokeWatcher(w)
	{
		this.#watchers = this.#watchers.filter(x=>x != w);
	}

	_onEvent_changed(data)
	{
		this._setData(data);
		this.emit('changed');
	}

	_onEvent_documentChanged(data)
	{
		// Get the watcher
		let w = this.#watchIds[data.watchId];
		if (w)
		{
			w._update(data);
		}
	}
}

