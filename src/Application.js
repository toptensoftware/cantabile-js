import { EndPoint } from './EndPoint.js';

/**
 * Fired when any of the application properties change
 * 
 * @event Application#changed
 */

/**
 * Fired when the application object has initially connected
 * 
 * @event Application#connected
 */

/**
 * Fired when the application's busy state changes
 * 
 * @event Application#busyChanged
 * @property {boolean} busy True if the app is currently busy
 */


/**
 * Interface to the application object
 * 
 * Access this object via the {@linkcode Cantabile#application} property.
 * 
 * @fires Application#changed
 * @fires Application#connected
 * @fires Application#busyChanged
 */
export class Application extends EndPoint
{
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/application");
	}

	_onConnected()
	{
		this.emit('connected');
		this.emit('busyChanged', this.busy);
		this.emit('changed');
	}

	_onDisconnected()
	{
		this.emit('busyChanged', this.busy);
		this.emit('changed');
	}

	/**
	 * The application's company name
	 * @property companyName
	 * @type {String}
	 */
	get companyName() { return this.data ? this.data.companyName : null; }

	/**
	 * The application name
	 * @property name
	 * @type {String}
	 */
	get name() { return this.data ? this.data.name : null; }

	/**
	 * The application version string
	 * @property version
	 * @type {String}
	 */
	get version() { return this.data ? this.data.version : null; }

	/**
	 * The application edition string
	 * @property edition
	 * @type {String}
	 */
	get edition() { return this.data ? this.data.edition : null; }

	/**
	 * The application's copyright message
	 * @property copyright
	 * @type {String}
	 */
	get copyright() { return this.data ? this.data.copyright : null; }

	/**
	 * The application's build number
	 * @property build
	 * @type {Number}
	 */
	get build() { return this.data ? this.data.build : null; }

	/**
	 * An array of {@linkcode ColorEntry} items for the color index table
	 * @property colors
	 * @type {ColorEntry[]}
	 */
	get colors() { return this.data ? this.data.colors : null; }

	 /**
	 * The application's busy status
	 * @property busy
	 * @type {Boolean}
	 */
	get busy() { return this.data ? this.data.busy : false; }


	/**
	 * The base program number (0 or 1)
	 * @property baseProgramNumber
	 * @type {Number}
	 */
	get baseProgramNumber() { return this.data ? this.data.baseProgramNumber : null; }

	/**
	 * The preferred banked program display format - "SeparateBanks","CombinedBanks","Plain" or "ZeroPadded"
	 * @property bankedProgramNumberFormat
	 * @type {String}
	 */
	get bankedProgramNumberFormat() { return this.data ? this.data.bankedProgramNumberFormat : null; }

	 _onEvent_busyChanged(data)
	{
		this.data.busy = data.busy;
		this.emit('busyChanged', this.busy);
	}


}
