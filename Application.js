import EndPoint from './EndPoint.js';

/**
 * Interface to the application object
 * 
 * Access this object via the {{#crossLink "Cantabile/application:property"}}{{/crossLink}} property.
 *
 * @class Application
 * @extends EndPoint
 */
class Application extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/application");
	}

	_onOpen()
	{
		/**
		 * Fired when any of the application properties change
		 * 
		 * @event changed
		 */

		/**
		 * Fired when the application object has initially loaded
		 * 
		 * @event open
		 */

		this.emit('open');
		this.emit('busyChanged', this.busy);
		this.emit('changed');
	}

	_onClose()
	{
		this.emit('busyChanged', this.busy);
		this.emit('changed');
	}

	/**
	 * The application's company name
	 * @property companyName
	 * @type {String}
	 */
	get companyName() { return this._data ? this._data.companyName : null; }

	/**
	 * The application name
	 * @property name
	 * @type {String}
	 */
	get name() { return this._data ? this._data.name : null; }

	/**
	 * The application version string
	 * @property version
	 * @type {String}
	 */
	get version() { return this._data ? this._data.version : null; }

	/**
	 * The application edition string
	 * @property edition
	 * @type {String}
	 */
	get edition() { return this._data ? this._data.edition : null; }

	/**
	 * The application's copyright message
	 * @property copyright
	 * @type {String}
	 */
	get copyright() { return this._data ? this._data.copyright : null; }

	/**
	 * The application's build number
	 * @property build
	 * @type {Number}
	 */
	 get build() { return this._data ? this._data.build : null; }

	/**
	 * An array of {{#crossLink "ColorEntry"}}{{/crossLink}} items for the color index table
	 * @property colors
	 * @type {ColorEntry[]}
	 */
	 get colors() { return this._data ? this._data.colors : null; }

	 /**
	 * The application's busy status
	 * @property busy
	 * @type {Boolean}
	 */
	get busy() { return this._data ? this._data.busy : false; }


	 /**
	 * The base program number (0 or 1)
	 * @property baseProgramNumber
	 * @type {Number}
	 */
	 get baseProgramNumber() { return this._data ? this._data.baseProgramNumber : null; }

	 /**
	 * The preferred banked program display format - "SeparateBanks","CombinedBanks","Plain" or "ZeroPadded"
	 * @property bankedProgramNumberFormat
	 * @type {String}
	 */
	 get bankedProgramNumberFormat() { return this._data ? this._data.bankedProgramNumberFormat : null; }

	 _onEvent_busyChanged(data)
	{
		/**
		 * Fired when the application busy state changes
		 * 
		 * @event busyChanged
		 * @param {Boolean} busy True if the app is currently busy
		 */

		this._data.busy = data.busy;
		this.emit('busyChanged', this.busy);
	}


}


export default Application;