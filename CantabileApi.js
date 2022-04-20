'use strict';

const WebSocket = require('isomorphic-ws');
const debug = require('debug')('Cantabile');
const EventEmitter = require('events');

/**
* Represents a connection to Cantabile.
* 
* @class Cantabile
* @extends EventEmitter
* @constructor
* @param {String} [socketUrl] The websocket URL of the Cantabile instance to connect to.
* When running in a browser, the defaults to `ws://${window.location.host}/api/socket`.  In other
* environments it defaults to `ws://localhost:35007/api/socket`.
*/
class Cantabile extends EventEmitter
{
	constructor(socketUrl)
	{
		super();

		if (socketUrl)
		{
			this.hostUrl = socketUrl
				.replace("ws://", "http://")
				.replace("wss://", "https://")
				.replace("/api/socket/", "/")
				.replace("/api/socket", "/");
				
			this.socketUrl = socketUrl;
		}
		else
		{
			var defaultHost = process.browser ? window.location.host : "localhost:35007";
			this.hostUrl = `http://${defaultHost}/`;
			this.socketUrl = socketUrl || `ws://${defaultHost}/api/socket/`;
		}

		this.shouldConnect = false;
		this._nextRid = 1;
		this._pendingResponseHandlers = {};
		this._endPointEventHandlers = {};
		this._setState("disconnected");

		/**
		 * Gets the setList object
		 *
		 * @property setList
		 * @type {SetList} 
		 */
		this.setList = new (require('./SetList'))(this);

		/**
		 * Gets the states of the current song
		 *
		 * @property songStates
		 * @type {SongStates} 
		 */
		this.songStates = new (require('./SongStates'))(this);

		/**
		 * Gets the currently active key ranges
		 *
		 * @property keyRanges
		 * @type {KeyRanges} 
		 */
		this.keyRanges = new (require('./KeyRanges'))(this);

		/**
		 * Gets the current set of show notes
		 *
		 * @property showNotes
		 * @type {ShowNotes} 
		 */
		this.showNotes = new (require('./ShowNotes'))(this);

		/**
		 * Provides access to variable expansion facilities
		 *
		 * @property variables
		 * @type {Variables} 
		 */
		this.variables = new (require('./Variables'))(this);

		/**
		 * Provides access to global binding points
		 *
		 * @property bindings
		 * @type {Bindings} 
		 */
		 this.bindings = new (require('./Bindings'))(this);

		/**
		 * Provides access to global commands
		 *
		 * @property commands
		 * @type {Commands} 
		 */
		 this.commands = new (require('./Commands'))(this);

		 /**
		 * Provides access to information about the current song
		 *
		 * @property song
		 * @type {Song} 
		 */
		this.song = new (require('./Song'))(this);

		/**
		 * Provides access to master transport controls
		 *
		 * @property transport
		 * @type {Song} 
		 */
		this.transport = new (require('./Transport'))(this);

		/**
		 * Provides access to the application object
		 *
		 * @property application
		 * @type {Application} 
		 */
		this.application = new (require('./Application'))(this);

		/**
		 * Provides access to the engine object
		 *
		 * @property engine 
		 * @type {Engine} 
		 */
		 this.engine = new (require('./Engine'))(this);
		}

	/**
	 * The current connection state, either "connecting", "connected" or "disconnected"
	 *
	 * @property state
	 * @type {String} 
	 */
	get state()
	{
		return this._state;
	}

	/**
	 * Initiate connection and retry if fails
	 * @method connect
	 */
	connect()
	{
		this.shouldConnect = true;
		this._internalConnect();
	}

	/**
	 * Disconnect and stop retries
	 * @method disconnect
	 */
	disconnect()
	{
		this.shouldConnect = false;
		this._internalDisconnect();
	}

	/**
	 * Stringify an object as a JSON message and send it to the server
	 *
	 * @method send
	 * @param {object} obj The object to send
	 */
	send(obj)
	{
		debug('SEND: %j', obj);
		this._ws.send(JSON.stringify(obj));
	}

	/**
	 * Stringify an object as a JSON message, send it to the server and returns 
	 * a promise which will resolve to the result.
	 *
	 * @method request
	 * @param {object} obj The object to send
	 * @return {Promise|object}
	 */
	request(message)
	{
		return new Promise(function(resolve, reject) {

			// Tag the message with the request id
			message.rid = this._nextRid++;

			// Store in the response handler map
			this._pendingResponseHandlers[message.rid] = {
				message: message,
				resolve: resolve,
				reject: reject,
			};

			// Send the request
			this.send(message);
		}.bind(this));
	}

	/**
	 * Returns a promise that will be resolved when connected
	 * 
	 * @example
	 * 
	 *     let C = new CantabileApi();
	 *     await C.untilConnected();
	 *
	 * @method untilConnected
	 * @return {Promise}
	 */
	untilConnected()
	{
		if (this._state == "connected")
		{
			return Promise.resolve();		
		}
		else
		{
			return new Promise((resolve, reject) => {
				if (!this.pendingConnectPromises)
					 this.pendingConnectPromises = [resolve];
				else
					this.pendingConnectPromises.push(resolve);
			});
		}
	}

	// PRIVATE:

	// Internal helper to change state, log it and fire event
	_setState(value)
	{
		if (this._state != value)
		{
			this._state = value;
			this.emit('stateChanged', value);
			this.emit(value);
			debug(value);

			if (this._state == "connected")
			{
				if (this.pendingConnectPromises)
				{
					for (let i=0; i<this.pendingConnectPromises.length; i++)
					{
						this.pendingConnectPromises[i]();
					}
					this.pendingConnectPromises = null;
				}
			}
		}
	}

	// Internal helper to actually perform the connection
	_internalConnect()
	{
		if (!this.shouldConnect)
			return;

		// Already connected?
		if (this._ws)
			return;

		this._setState("connecting");

		// Work out socket url
		let socketUrl = this.socketUrl;
		if (!socketUrl)
		 	socketUrl = this.hostUrl.replace("http://", "ws://").replace("https://", "wss://");

		// Create the socket and hook up handlers
		debug("Opening web socket '%s'", socketUrl);
		this._ws =  new WebSocket(socketUrl);
		this._ws.onerror = this._onSocketError.bind(this);
		this._ws.onopen = this._onSocketOpen.bind(this);
		this._ws.onclose = this._onSocketClose.bind(this);
		this._ws.onmessage = this._onSocketMessage.bind(this);
	}

	// Internal helper to disconnect
	_internalDisconnect()
	{
		if (this.state == "connected")
			this._setState("disconnected");

		// Already disconnected?
		if (!this._ws)
			return;

		this._ws.close();
		delete this._ws;
	}

	// Internal helper to retry connection every 1 second
	_internalReconnect()
	{
		if (this.shouldConnect && !this.timeoutPending)
		{
			this.timeoutPending = true;
			this._setState("connecting");
			setTimeout(function() {
				this.timeoutPending = false;
				this._internalConnect();
			}.bind(this), 1000);
		}
	}

	// Socket onerror handler
	_onSocketError(evt)
	{
		// Disconnect
		this._internalDisconnect();

		// Try to reconnect...
		this._internalReconnect();
	}

	// Socket onopen handler
	_onSocketOpen()
	{
		this._setState("connected");
	}

	// Socket onclose handler
	_onSocketClose()
	{
		if (this._ws)
		{
			this._setState("disconnected");
			delete this._ws;

			// Reject any pending requests
			/*
			var pending = this._pendingResponseHandlers;
			console.log(pending);
			this._pendingResponseHandlers = {};
			for (let key in pending) 
			{
				debugger;
				console.log("===> disconnecting", key);
			  	pending[key].reject(new Error("Disconnected"));
			}
			*/
		}

		// Try to reconnect...
		this._internalReconnect();
	}

	// Socket onmessage handler
	_onSocketMessage(msg)
	{
		msg = JSON.parse(msg.data);

		debug('RECV: %j', msg);

		// Request response?
		if (msg.rid)
		{
			// Find the handler
			let handlerInfo = this._pendingResponseHandlers[msg.rid];
			if (!handlerInfo)
			{
				debug('ERROR: received response for unknown rid:', msg.rid)
				return;
			}

			// Remove from pending map
			delete this._pendingResponseHandlers[msg.rid];

			// Resolve reject
			if (msg.status >= 200 && msg.status < 300)
				handlerInfo.resolve(msg);
			else
				handlerInfo.reject(new Error(`${msg.status} - ${msg.statusDescription}`));
		}

		// Event message?
		if (msg.epid && msg.eventName)
		{
			var ep = this._endPointEventHandlers[msg.epid];
			if (ep)
			{
				ep._dispatchEventMessage(msg.eventName, msg.data);
			}
			else
			{
				debug(`ERROR: No event handler found for end point ${msg.epid}`)
			}
		}
	}


	_registerEndPointEventHandler(epid, endPoint)
	{
		this._endPointEventHandlers[epid] = endPoint;
	}

	_revokeEndPointEventHandler(epid)
	{
		delete this._endPointEventHandlers[epid];
	}

}

/**
 * Fired when the {{#crossLink "Cantabile/state:property"}}{{/crossLink}} property value changes
 *
 * @event stateChanged
 * @param {String} state The new connection state ("connecting", "connected" or "disconnected")
 */
const eventStateChanged = "stateChanged";

/**
 * Fired when entering the connected state
 *
 * @event connected
 */
const eventConnected = "connected";

/**
 * Fired when entering the connecting state
 *
 * @event connecting
 */
const eventConnecting = "connecting";

/**
 * Fired when entering the disconnected state
 *
 * @event disconnected
 */
const eventDiconnected = "disconnected";




module.exports = Cantabile;