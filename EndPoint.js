'use strict';

const debug = require('debug')('Cantabile');
const EventEmitter = require('events');


// Helper to correctly join two paths ensuring only a single slash between them
function joinPath(a,b)
{
	while (a.endsWith('/'))
		a = a.substr(0, a.length - 1);
	while (b.startsWith('/'))
		b = b.substr(1);
	return `${a}/${b}`;
}

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
		this.owner = owner;
		this.endPoint = endPoint;
		this.openCount = 0;
		this.owner.on('connected', this._onConnected.bind(this));
		this.owner.on('disconnected', this._onDisconnected.bind(this));
	}

	/**
	 * Opens this end point and starts listening for events
	 * @method open
	 */
	open()
	{
		this.openCount++;

		if (this.openCount == 1 && this.owner.state == "connected")
		{
			this._onConnected();
		}
	}

	/**
	 * Closes the end point and stops listening for events
	 * @method close
	 */
	close()
	{
		// Reduce the open reference count
		this.openCount--;
		if (this.openCount > 0)
			return;

		// Send the close message
		this.owner.send({
			method: "close",
			epid: this._epid,
		});

		// Remove end point event handler
		this.owner._revokeEndPointEventHandler(this._epid);

		this._onClose();

		delete this._epid;
		delete this._data;
	}

	send(method, endPoint, data)
	{
		if (this._epid)
		{
			// If connection is open, pass the epid and just the sub-url path
			return this.owner.send({
				ep: endPoint,
				epid: this._epid,
				method: method,
				data: data,
			});
		}
		else
		{
			// If connection isn't open, need to specify the full end point url
			return this.owner.send({
				ep: joinPath(this.endPoint, endPoint),
				method: method,
				data: data,
			});
		}
	}

	request(method, endPoint, data)
	{
		if (this._epid)
		{
			// If connection is open, pass the epid and just the sub-url path
			return this.owner.request({
				ep: endPoint,
				epid: this._epid,
				method: method,
				data: data,
			});
		}
		else
		{
			// If connection isn't open, need to specify the full end point url
			return this.owner.request({
				ep: joinPath(this.endPoint, endPoint),
				method: method,
				data: data,
			});
		}
	}

	post(endPoint, data)
	{
		return this.request('post', endPoint, data);
	}

	get isOpen() { return !!this._epid }

	/**
	 * Returns a promise that will be resolved when this end point is opened
	 * 
	 * @example
	 * 
	 *     let C = new CantabileApi();
	 * 	   C.application.open();
	 *     await C.application.untilOpen();
	 *
	 * @method untilOpen
	 * @return {Promise}
	 */
	untilOpen()
	{
		if (this.isOpen)
		{
			return Promise.resolve();		
		}
		else
		{
			return new Promise((resolve, reject) => {
				if (!this._pendingOpenPromises)
					 this._pendingOpenPromises = [resolve];
				else
					this._pendingOpenPromises.push(resolve);
			});
		}
	}


	async _onConnected()
	{
		try
		{
			if (this.openCount == 0)
				return;
				
			var msg = await this.owner.request(
			{ 
				method: "open",
				ep: this.endPoint,
			});

			this._epid = msg.epid;
			this._data = msg.data;
			this.owner._registerEndPointEventHandler(this._epid, this);

			this._onOpen();

			// Resolve open promises
			if (this._pendingOpenPromises)
			{
				for (let i=0; i<this._pendingOpenPromises.length; i++)
				{
					this._pendingOpenPromises[i]();
				}
				this._pendingOpenPromises = null;
			}
		}
		catch (err)
		{
			debug(err);
			throw err;
			// What to do?
		}
	}

	_onDisconnected()
	{
		if (this._epid)
			this.owner._revokeEndPointEventHandler(this._epid);
		delete this._epid;
		delete this._data;
		this._onClose();
	}

	_onOpen()
	{
	}

	_onClose()
	{
	}

	_dispatchEventMessage(eventName, data)
	{
		if (this["_onEvent_" + eventName])
		{
			this["_onEvent_" + eventName](data);
		}
	}

}

module.exports = EndPoint;