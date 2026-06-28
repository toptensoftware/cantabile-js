import _debug from 'debug';
import EventEmitter from 'events';

const debug = _debug('Cantabile');


/**
 * Common functionality for all end point handlers
 *
 * @class EndPoint
 * @extends EventEmitter
 */
class EndPoint extends EventEmitter
{
	// Private constructor
	constructor(owner, endPoint)
	{
		super();
		this.#owner = owner;
		this.#endPoint = endPoint;
		this.#owner.on('connected', () => this._onSessionConnected());
		this.#owner.on('disconnected', () => this._onSessionDisconnected());
		this.#prepareConnectPromise();
	}

	#owner;
	#endPoint;
	#connectCount = 0;
	#connectPromise;
	#connectPromiseResolve;
	#connectPromiseReject;

	get owner() { return this.#owner; }
	get endPoint() { return this.#endPoint;}

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
	 * This method no longer needs to be explicitly called as end points are now
	 * automatically opened when the first event listener is attached.
	 * 
	 * Use this method to keep the end point open even when no event listeners are attached.
	 * 
	 * @method connect
	 * @returns {Promise} A promise that resolves when connected
	 */
	connect()
	{
		this.#connectCount++;

		if (this.#connectCount == 1 && this.owner.state == "connected")
		{
			this._onSessionConnected();
		}

		return this.#connectPromise;
	}

	/**
	 * Disconnect this end point and stops listening for events.
	 * 
	 * This method no longer needs to be explicitly called as end points are now
	 * automatically closed when the last event listener is removed.
	 * @method close
	 */
	disconnect()
	{
		// Reduce the connected reference count
		this.#connectCount--;
		if (this.#connectCount > 0)
			return;

		// Send the close message
		this.owner.send({
			method: "close",
			epid: this._epid,
		});

		// Remove end point event handler
		this.owner._revokeEndPointEventHandler(this._epid);

		this._onDisconnected();

		delete this._epid;
		delete this._data;

		// Prepare the next connection promise
		this.#prepareConnectPromise();
	}

	send(method, endPoint, data)
	{
		if (this._epid)
		{
			// If connected, pass the epid and just the sub-url path
			return this.owner.send({
				ep: endPoint,
				epid: this._epid,
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

	request(method, endPoint, data)
	{
		if (this._epid)
		{
			// If connected, pass the epid and just the sub-url path
			return this.owner.request({
				ep: endPoint,
				epid: this._epid,
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

	post(endPoint, data)
	{
		return this.request('post', endPoint, data);
	}

	get(endPoint)
	{
		return this.request('get', endPoint);
	}

	get isConnected() { return !!this._epid }

	/**
	 * Returns a promise that will be resolved when this end point is opened
	 * 
	 * @example
	 * 
	 *     let C = new CantabileApi();
	 * 	   C.application.open();
	 *     await C.application.waitForConnected();
	 *
	 * @method waitForConnected
	 * @returns {Promise}
	 */
	waitForConnected()
	{
		return this.#connectPromise;
	}


	async _onSessionConnected()
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

			this._epid = msg.epid;
			this._data = msg.data;
			this.owner._registerEndPointEventHandler(this._epid, this);

			this._onConnected();

			// Resolve connect promise
			this.#connectPromiseResolve(this);
		}
		catch (err)
		{
			this.#connectPromiseReject(err);
			debug(err);
		}
	}

	_onSessionDisconnected()
	{
		if (this._epid)
			this.owner._revokeEndPointEventHandler(this._epid);
		delete this._epid;
		delete this._data;
		this._onDisconnected();
		this.#prepareConnectPromise();
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
	static joinPath(a,b)
	{
		while (a.endsWith('/'))
			a = a.substr(0, a.length - 1);
		while (b.startsWith('/'))
			b = b.substr(1);
		return `${a}/${b}`;
	}


}

export default EndPoint;