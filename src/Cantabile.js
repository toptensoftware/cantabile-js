import WebSocket from 'isomorphic-ws';
import EventEmitter from 'events';
import { SetList } from './SetList.js';
import { SongStates } from './SongStates.js';
import { KeyRanges } from './KeyRanges.js';
import { ShowNotes } from './ShowNotes.js';
import { Variables } from './Variables.js';
import { OnscreenKeyboard } from './OnscreenKeyboard.js';
import { Bindings } from './Bindings.js';
import { Commands } from './Commands.js';
import { Song } from './Song.js';
import { Transport } from './Transport.js';
import { Application } from './Application.js';
import { Engine } from './Engine.js';

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
export class Cantabile extends EventEmitter
{
	/**
	 * Creates a new Cantabile network session
	 * @constructor 
	 * @param {string|Object} options A string host, or configuration options
	 * @param {string} [options.host] the host to connect to (defaults to browser url, or localhost:35007)
	 * @param {boolean} [options.autoConnect=true] if true automatically initiates connection
	 * @param {boolean} [options.autoConnectEndPoints=true] if true automatically connects end point objects when accessed
	 * @param {number} [options.maxListeners=30] set the max event listeners for this object (if supported)
	 */
	constructor(options)
	{
		super();

		// Host string as options
		if (typeof(options) === 'string')
		{
			options = { host: options };
		}

		// Resolve defaultl options
		options = Object.assign({
			maxListeners: 30,
			autoConnect: true,
			autoConnectEndPoints: true,
		}, options);

		// Store options
		this.#options = options;

		// Setup max listeners
		if (this.setMaxListeners)
			this.setMaxListeners(options.maxListeners);

		// Initialize host
		this.#setHost(options.host);

		// Connection
		this.#shouldConnect = false;
		this.#prepareConnectPromise();
		this.#setState("disconnected");
		this.autoConnectEndPoints = options.autoConnectEndPoints;

		if (options.autoConnect)
			this.connect();
	}

	#options;
	#host;
	#socketUrl;
	#state;
	#ws;
	#nextRid = 1;
	#pendingResponseHandlers = {};
	#endPointEventHandlers = {};
	#connectPromise;
	#connectPromiseResolve;
	#connectPromiseReject;
	#shouldConnect;
	#timeoutPending;

	// Resolve host string to host url and socket url
	#setHost(value)
	{
		if (!value && typeof window !== 'undefined')
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
		this.#host = (secure ? "https://" : "http://") + value;
		this.#socketUrl = (secure ? "wss://" : "ws://") + value + "/api/socket/";
	}

	// Create a promise that will be resolved when connection succeeds
	#prepareConnectPromise()
	{
		this.#connectPromise = new Promise((resolve, reject) => {
			this.#connectPromiseResolve = resolve;
			this.#connectPromiseReject = reject;
		});
	}

	/**
	 * Gets the resolved options object used to construct this object
	 * @property options
	 * @type {Object}
	 */
	get options()
	{
		return this.#options;
	}

	/**
	 * The current connection state, either "connecting", "connected" or "disconnected"
	 *
	 * @property state
	 * @type {String} 
	 */
	get state()
	{
		return this.#state;
	}

	/**
	 * Initiate connection and retry if fails until success
	 * @method connect
	 * @returns {Promise} a promise that resolves when connected
	 */
	connect()
	{
		this.#shouldConnect = true;
		this.#internalConnect();
		return this.#connectPromise;
	}

	/**
	 * Disconnect and stop retries
	 * @method disconnect
	 */
	disconnect()
	{
		this.#shouldConnect = false;
		this.#internalDisconnect();
	}

	/**
	 * Stringify an object as a JSON message and send it to the server
	 *
	 * @method send
	 * @param {object} obj The object to send
	 */
	send(obj)
	{
		this.#ws.send(JSON.stringify(obj));
	}

	/**
	 * Stringify an object as a JSON message, send it to the server and returns 
	 * a promise which will resolve to the result.
	 *
	 * @method request
	 * @param {object} message The message object to send
	 * @returns {Promise<object>}
	 */
	request(message)
	{
		return new Promise((resolve, reject) => {

			// Tag the message with the request id
			message.rid = this.#nextRid++;

			// Store in the response handler map
			this.#pendingResponseHandlers[message.rid] = {
				message: message,
				resolve: resolve,
				reject: reject,
			};

			// Send the request
			this.send(message);
		});
	}

	/**
	 * Returns a promise that will be resolved when connected
	 * 
	 * @example
	 * 
	 *     let C = new Cantabile();
	 *     await C.waitForConnected();
	 *
	 * @method waitForConnected
	 * @returns {Promise}
	 */
	waitForConnected()
	{
		return this.#connectPromise;
	}

	// PRIVATE:

	// Internal helper to change state, log it and fire event
	#setState(value)
	{
		if (this.#state != value)
		{
			if (this.#state == "connected")
			{
				this.#prepareConnectPromise();
			}

			this.#state = value;
			this.emit('stateChanged', value);
			this.emit(value);

			if (this.#state == "connected")
			{
				this.#connectPromiseResolve();
			}
		}
	}

	/**
	 * The host URL
	 *
	 * @property host
	 * @type {String} 
	 */
    get host()
	{
		return this.#host;
	}

	/**
	 * The base socket url
	 *
	 * @property socketUrl
	 * @type {String}
	 */
	get socketUrl()
	{
		return this.#socketUrl;
	}



	// Internal helper to actually perform the connection
	#internalConnect()
	{
		if (!this.#shouldConnect)
			return;

		// Already connected?
		if (this.#ws)
			return;

		this.#setState("connecting");

		// Work out socket url
		let socketUrl = this.socketUrl;

		// Create the socket and hook up handlers
		this.#ws =  new WebSocket(socketUrl);
		this.#ws.onerror = (e) => this.#onSocketError(e);
		this.#ws.onopen = () => this.#onSocketOpen();
		this.#ws.onclose = () => this.#onSocketClose();
		this.#ws.onmessage = (m) => this.#onSocketMessage(m);
	}

	// Internal helper to disconnect
	#internalDisconnect()
	{
		if (this.state == "connected")
			this.#setState("disconnected");

		// Already disconnected?
		if (!this.#ws)
			return;

		this.#ws.close();
		this.#ws = null;
	}

	// Internal helper to retry connection every 1 second
	#internalReconnect()
	{
		if (this.#shouldConnect && !this.#timeoutPending)
		{
			this.#timeoutPending = true;
			this.#setState("connecting");
			setTimeout(() => {
				this.#timeoutPending = false;
				this.#internalConnect();
			}, 1000);
		}
	}

	// Socket onerror handler
	#onSocketError(evt)
	{
		// Disconnect
		this.#internalDisconnect();

		// Try to reconnect...
		this.#internalReconnect();
	}

	// Socket onopen handler
	#onSocketOpen()
	{
		this.#setState("connected");
	}

	// Socket onclose handler
	#onSocketClose()
	{
		if (this.#ws)
		{
			this.#setState("disconnected");
			this.#ws = null;
		}

		// Try to reconnect...
		this.#internalReconnect();
	}

	// Socket onmessage handler
	#onSocketMessage(msg)
	{
		msg = JSON.parse(msg.data);

		// Request response?
		if (msg.rid)
		{
			// Find the handler
			let handlerInfo = this.#pendingResponseHandlers[msg.rid];
			if (!handlerInfo)
			{
				return;
			}

			// Remove from pending map
			delete this.#pendingResponseHandlers[msg.rid];

			// Resolve reject
			if (msg.status >= 200 && msg.status < 300)
				handlerInfo.resolve(msg);
			else
				handlerInfo.reject(new Error(`${msg.status} - ${msg.statusDescription}`));
		}

		// Event message?
		if (msg.epid && msg.eventName)
		{
			var ep = this.#endPointEventHandlers[msg.epid];
			if (ep)
			{
				ep._dispatchEventMessage(msg.eventName, msg.data);
			}
		}
	}


	_registerEndPointEventHandler(epid, endPoint)
	{
		this.#endPointEventHandlers[epid] = endPoint;
	}

	_revokeEndPointEventHandler(epid)
	{
		delete this.#endPointEventHandlers[epid];
	}

	#autoConnectEndPoints = true;

	/**
	 * Controls whether the sub-object end points are automatically
	 * connected when first accessed.
	 *
	 * @property autoConnectEndPoints
	 * @type {Boolean}
	 */
	get autoConnectEndPoints()
	{
		return this.#autoConnectEndPoints;
	}
	set autoConnectEndPoints(value)
	{
		this.#autoConnectEndPoints = value;
	}

	#endPoints = new Map();
	#getEndPoint(type)
	{
		var ep = this.#endPoints.get(type);
		if (!ep)
		{
			ep = new type(this);
			this.#endPoints.set(type, ep);
			
			if (this.#autoConnectEndPoints)
				ep.connect();
		}

		return ep;
	}

	/**
	 * Gets the {{#crossLink "Song"}}{{/crossLink}} object
	 *
	 * @property song
	 * @type {Song}
	 */
	get song() { return this.#getEndPoint(Song) };

	/**
	 * Gets the {{#crossLink "SetList"}}{{/crossLink}} object
	 *
	 * @property setList
	 * @type {SetList}
	 */
	get setList() { return this.#getEndPoint(SetList) };

	/**
	 * Gets the {{#crossLink "SongStates"}}{{/crossLink}} object
	 *
	 * @property songStates
	 * @type {SongStates}
	 */
	get songStates() { return this.#getEndPoint(SongStates) };

	/**
	 * Gets the {{#crossLink "KeyRanges"}}{{/crossLink}} object
	 *
	 * @property keyRanges
	 * @type {KeyRanges}
	 */
	get keyRanges() { return this.#getEndPoint(KeyRanges) };

	/**
	 * Gets the {{#crossLink "ShowNotes"}}{{/crossLink}} object
	 *
	 * @property showNotes
	 * @type {ShowNotes}
	 */
	get showNotes() { return this.#getEndPoint(ShowNotes) };

	/**
	 * Gets the {{#crossLink "Variables"}}{{/crossLink}} object
	 *
	 * @property variables
	 * @type {Variables}
	 */
	get variables() { return this.#getEndPoint(Variables) };

	/**
	 * Gets the {{#crossLink "OnscreenKeyboard"}}{{/crossLink}} object
	 *
	 * @property onscreenKeyboard
	 * @type {OnscreenKeyboard}
	 */
	get onscreenKeyboard() { return this.#getEndPoint(OnscreenKeyboard) };

	/**
	 * Gets the {{#crossLink "Commands"}}{{/crossLink}} object
	 *
	 * @property commands
	 * @type {Commands}
	 */
	get commands() { return this.#getEndPoint(Commands) };

	/**
	 * Gets the {{#crossLink "Transport"}}{{/crossLink}} object
	 *
	 * @property transport
	 * @type {Transport}
	 */
	get transport() { return this.#getEndPoint(Transport) };

	/**
	 * Gets the {{#crossLink "Application"}}{{/crossLink}} object
	 *
	 * @property application
	 * @type {Application}
	 */
	get application() { return this.#getEndPoint(Application) };

	/**
	 * Gets the {{#crossLink "Engine"}}{{/crossLink}} object
	 *
	 * @property engine
	 * @type {Engine}
	 */
	get engine() { return this.#getEndPoint(Engine) };

	/**
	 * Gets the {{#crossLink "Bindings"}}{{/crossLink}} object
	 *
	 * @property bindings
	 * @type {Bindings}
	 */
	get bindings() { return this.#getEndPoint(Bindings) };
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

