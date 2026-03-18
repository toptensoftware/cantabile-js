import WebSocket from 'isomorphic-ws';
import _debug from 'debug';
import EventEmitter from 'events';
import SetList from './SetList';
import SongStates from './SongStates';
import KeyRanges from './KeyRanges';
import ShowNotes from './ShowNotes';
import Variables from './Variables';
import OnscreenKeyboard from './OnscreenKeyboard';
import Bindings from './Bindings';
import Bindings4 from './Bindings4';
import Commands from './Commands';
import Song from './Song';
import Transport from './Transport';
import Application from './Application';
import Engine from './Engine';

const debug = _debug('Cantabile');

/**
* Represents a connection to Cantabile.
* 
* @class Cantabile
* @extends EventEmitter
* @constructor
* @param {String} [host] The host to connect to. This can be either <baseaddress> or http://<baseaddress> or ws://<baseaddress>
* When running in a browser, the defaults to `${window.location.host}`.  In other environments it defaults to 
`localhost:35007`.  
*/
class Cantabile extends EventEmitter
{
	constructor(host)
	{
		super();

		this.setMaxListeners(30);

		this.host = host;

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
		this.setList = new SetList(this);

		/**
		 * Gets the states of the current song
		 *
		 * @property songStates
		 * @type {SongStates}
		 */
		this.songStates = new SongStates(this);

		/**
		 * Gets the currently active key ranges
		 *
		 * @property keyRanges
		 * @type {KeyRanges}
		 */
		this.keyRanges = new KeyRanges(this);

		/**
		 * Gets the current set of show notes
		 *
		 * @property showNotes
		 * @type {ShowNotes}
		 */
		this.showNotes = new ShowNotes(this);

		/**
		 * Provides access to variable expansion facilities
		 *
		 * @property variables
		 * @type {Variables}
		 */
		 this.variables = new Variables(this);

		/**
		 * Provides access to controllers managed by Cantabile's onscreen keyboard device
		 *
		 * @property onscreenKeyboard
		 * @type {OnscreenKeyboard}
		 */
		 this.onscreenKeyboard = new OnscreenKeyboard(this);

		 /**
		 * Provides access to global binding points
		 *
		 * @property bindings
		 * @type {Bindings}
		 */
		  this.bindings = new Bindings(this);

		 /**
		 * Provides access to global binding v4 points
		 *
		 * @property bindings4
		 * @type {Bindings4}
		 */
		  this.bindings4 = new Bindings4(this);

		  /**
		 * Provides access to global commands
		 *
		 * @property commands
		 * @type {Commands}
		 */
		 this.commands = new Commands(this);

		 /**
		 * Provides access to information about the current song
		 *
		 * @property song
		 * @type {Song}
		 */
		this.song = new Song(this);

		/**
		 * Provides access to master transport controls
		 *
		 * @property transport
		 * @type {Transport}
		 */
		this.transport = new Transport(this);

		/**
		 * Provides access to the application object
		 *
		 * @property application
		 * @type {Application}
		 */
		this.application = new Application(this);

		/**
		 * Provides access to the engine object
		 *
		 * @property engine
		 * @type {Engine}
		 */
		 this.engine = new Engine(this);
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

	/**
	 * The current host
	 *
	 * @property host
	 * @type {String} 
	 */
    get host()
	{
		return this._host;
	}

	set host(value)
	{
		if (!value && process.browser)
			value = window.location.host
		if (!value)
			value = "localhost"

		// Crack protocol
		let secure = false;
		if (value.startsWith("https://"))
		{
			secure = true;
			value = value.substring(8);
		}
		else if (value.startsWith("wss://"))
		{
			secure = true;
			value = value.substring(6);
		}
		else if (value.startsWith("http://"))
		{
			value = value.substring(7);
		}
		else if (value.startsWith("ws://"))
		{
			value = value.substring(5);
		}

		// Remove trailing slashes
		while (value.endsWith('/'))
			value = value.substring(0, value.length - 1);

		// Remove socket url
		if (value.endsWith("/api/socket"))
			value = value.substring(0, value.length - 11);

		// Ensure port
		if (value.indexOf(':') < 0)
		{
			let slashPos = value.indexOf('/');
			if (slashPos < 0)
				value += ":35007";
			else
				value = value.substring(0, slashPos) + ':35007' + value.substring(slashPos);
		}

		// Build final http and ws url
		this._host = (secure ? "https://" : "http://") + value;
		this._socketUrl = (secure ? "wss://" : "ws://") + value + "/api/socket/";
	}

	/**
	 * The base socket url
	 *
	 * @property socketUrl
	 * @type {String}
	 */
	 get socketUrl()
	{
		return this._socketUrl;
	}

	/**
	 * The base host url
	 *
	 * @property hostUrl
	 * @type {String}
	 */
	 get hostUrl()
	{
		return this._host;
	}
	set hostUrl(value)
	{
		throw new Error("The `hostUrl` property is read-only, use `host` instead");
	}

	set socketUrl(value)
	{
		throw new Error("The `socketUrl` property has been deprecated, use `host` instead");
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




export default Cantabile;