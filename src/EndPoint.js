import EventEmitter from 'eventemitter3';


/**
 * @type {EventEmitter}
 * @internal
 */
const _unused = undefined;

/**
 * Common functionality for all end point handlers
 *
 * @class EndPoint
 * @extends {EventEmitter}
 */
export class EndPoint extends EventEmitter
{
	// Private constructor
	/** @internal */
	constructor(owner, endPoint)
	{
		super();
		if (this.setMaxListeners)
			this.setMaxListeners(owner.options.maxListeners);
		this.#owner = owner;
		this.#endPoint = endPoint;
		this.#owner.on('connected', () => this.#onSessionConnected());
		this.#owner.on('disconnected', () => this.#onSessionDisconnected());
		this.#prepareConnectPromise();
	}

	#owner;
	#connectCount = 0;
	#connectPromise;
	#connectPromiseResolve;
	#connectPromiseReject;
	#endPoint;
	#epid = null;
	#data = null;

	/**
	 * Gets the owning session of this end point
	 * @property owner
	 * @type {Cantabile}
	 */
	get owner() { return this.#owner; }

	/**
	 * Gets the end point url for this endpoint
	 * @property endPoint
	 * @type {string}
	 */
	get endPoint() { return this.#endPoint; }

	/**
	 * Gets the last received raw data for this end point
	 * @property endPoint
	 * @type {string}
	 */
	get data() { return this.#data; }

	// internal setter
	_setData(value) { this.#data = value; }

	// Prepares a new promise that will be resolved
	// when this end point has initially connected
	#prepareConnectPromise()
	{
		this.#connectPromise = new Promise((resolve, reject) => {
			this.#connectPromiseResolve = resolve;
			this.#connectPromiseReject = reject;
		});
	}

	/**
	 * Connects this end point and starts listening for events. 
	 * 
	 * Usually this method doesn't need to be called since the session
	 * object normally automatically connects end point objects when
	 * first accessed
	 * 
	 * @method connect
	 * @returns {Promise} A promise that resolves when connected
	 */
	connect()
	{
		this.#connectCount++;

		if (this.#connectCount == 1 && this.owner.state == "connected")
		{
			this.#onSessionConnected();
		}

		return this.#connectPromise;
	}

	/**
	 * Disconnect this end point and stops listening for events.
	 *
	 * Usually this method should never be used
	 * 
	 * @method disconnect
	 */
	disconnect()
	{
		// Reduce the connected reference count
		this.#connectCount--;
		if (this.#connectCount > 0)
			return;

		if (this.#epid)
		{
			// Send the close message
			this.owner.send({
				method: "close",
				epid: this.#epid,
			});

			// Remove end point event handler
			this.owner._revokeEndPointEventHandler(this.#epid);

			// Prepare the next connection promise
			this.#prepareConnectPromise();
		}

		this._onDisconnected();

		this.#epid = null;
		this.#data = null;
	}

	/** @internal */
	send(method, endPoint, data)
	{
		if (this.#epid)
		{
			// If connected, pass the epid and just the sub-url path
			return this.owner.send({
				ep: endPoint,
				epid: this.#epid,
				method: method,
				data: data,
			});
		}
		else
		{
			// If not connected, need to specify the full end point url
			return this.owner.send({
				ep: EndPoint.joinPath(this.endPoint, endPoint),
				method: method,
				data: data,
			});
		}
	}

	/** @internal */
	request(method, endPoint, data)
	{
		if (this.#epid)
		{
			// If connected, pass the epid and just the sub-url path
			return this.owner.request({
				ep: endPoint,
				epid: this.#epid,
				method: method,
				data: data,
			});
		}
		else
		{
			// If not connected, need to specify the full end point url
			return this.owner.request({
				ep: EndPoint.joinPath(this.endPoint, endPoint),
				method: method,
				data: data,
			});
		}
	}

	/** @internal */
	post(endPoint, data)
	{
		return this.request('post', endPoint, data);
	}

	/** @internal */
	get(endPoint)
	{
		return this.request('get', endPoint);
	}

	/**
	 * Checks if this end point is current connected
     * @property isConnected
	 * @type {Boolean}
	 */
	get isConnected() { return !!this.#epid }

	/**
	 * Checks if this end point will connect when the session connects
     * @property willConnect
	 * @type {Boolean}
	 */
	get willConnect() { return this.#connectCount > 0 }

	/**
	 * Returns a promise that will be resolved when this end point is opened
	 * 
	 * @example
	 * 
	 *     let C = new Cantabile();
	 *     await C.application.waitForConnected();
	 *
	 * @method waitForConnected
	 * @returns {Promise}
	 */
	waitForConnected()
	{
		return this.#connectPromise;
	}


	async #onSessionConnected()
	{
		try
		{
			if (this.#connectCount == 0)
				return;
				
			var msg = await this.owner.request(
			{ 
				method: "open",
				ep: this.endPoint,
			});

			this.#epid = msg.epid;
			this.#data = msg.data;
			this.owner._registerEndPointEventHandler(this.#epid, this);

			this._onConnected();

			// Resolve connect promise
			this.#connectPromiseResolve(this);
		}
		catch (err)
		{
			this.#connectPromiseReject(err);
		}
	}

	#onSessionDisconnected()
	{
		if (this.#epid)
		{
			this.owner._revokeEndPointEventHandler(this.#epid);
			this.#prepareConnectPromise();
		}
		this.#epid = null;
		this.#data = null;
		this._onDisconnected();
	}

	_onConnected()
	{
	}

	_onDisconnected()
	{
	}

	_dispatchEventMessage(eventName, data)
	{
		if (this["_onEvent_" + eventName])
		{
			this["_onEvent_" + eventName](data);
		}
	}

	// Helper to correctly join two paths ensuring only a single slash between them
	/** @internal */
	static joinPath(a,b)
	{
		while (a.endsWith('/'))
			a = a.substr(0, a.length - 1);
		while (b.startsWith('/'))
			b = b.substr(1);
		return `${a}/${b}`;
	}


}
