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
export class Cantabile extends EventEmitter<any> {
    /**
     * Creates a new Cantabile network session
     * @constructor
     * @param {Object} options configuration options
     * @param {string} [options.host] the host to connect to (defaults to browser url, or localhost:35007)
     * @param {boolean} [options.autoConnect=true] if true automatically initiates connection
     * @param {boolean} [options.autoConnectEndPoints=true] if true automatically connects end point objects when accessed
     * @param {number} [options.maxListeners=30] set the max event listeners for this object (if supported)
     */
    constructor(options: {
        host?: string | undefined;
        autoConnect?: boolean | undefined;
        autoConnectEndPoints?: boolean | undefined;
        maxListeners?: number | undefined;
    });
    shouldConnect: boolean;
    set autoConnectEndPoints(value: boolean);
    get autoConnectEndPoints(): boolean;
    /**
     * Gets the resolved options object used to construct this object
     * @property options
     * @type {Object}
     */
    get options(): Object;
    /**
     * The current connection state, either "connecting", "connected" or "disconnected"
     *
     * @property state
     * @type {String}
     */
    get state(): string;
    /**
     * Initiate connection and retry if fails until success
     * @method connect
     * @returns {Promise} a promise that resolves when connected
     */
    connect(): Promise<any>;
    /**
     * Disconnect and stop retries
     * @method disconnect
     */
    disconnect(): void;
    /**
     * Stringify an object as a JSON message and send it to the server
     *
     * @method send
     * @param {object} obj The object to send
     */
    send(obj: object): void;
    /**
     * Stringify an object as a JSON message, send it to the server and returns
     * a promise which will resolve to the result.
     *
     * @method request
     * @param {object} obj The object to send
     * @returns {Promise<object>}
     */
    request(message: any): Promise<object>;
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
    waitForConnected(): Promise<any>;
    /**
     * The host URL
     *
     * @property host
     * @type {String}
     */
    get host(): string;
    /**
     * The base socket url
     *
     * @property socketUrl
     * @type {String}
     */
    get socketUrl(): string;
    timeoutPending: boolean | undefined;
    _registerEndPointEventHandler(epid: any, endPoint: any): void;
    _revokeEndPointEventHandler(epid: any): void;
    getEndPoint(type: any): any;
    /**
     * Gets the {{#crossLink "Song"}}{{/crossLink}} object
     *
     * @property song
     * @type {Song}
     */
    get song(): Song;
    /**
     * Gets the {{#crossLink "SetList"}}{{/crossLink}} object
     *
     * @property setList
     * @type {SetList}
     */
    get setList(): SetList;
    /**
     * Gets the {{#crossLink "SongStates"}}{{/crossLink}} object
     *
     * @property songStates
     * @type {SongStates}
     */
    get songStates(): SongStates;
    /**
     * Gets the {{#crossLink "KeyRanges"}}{{/crossLink}} object
     *
     * @property keyRanges
     * @type {KeyRanges}
     */
    get keyRanges(): KeyRanges;
    /**
     * Gets the {{#crossLink "ShowNotes"}}{{/crossLink}} object
     *
     * @property showNotes
     * @type {ShowNotes}
     */
    get showNotes(): ShowNotes;
    /**
     * Gets the {{#crossLink "Variables"}}{{/crossLink}} object
     *
     * @property variables
     * @type {Variables}
     */
    get variables(): Variables;
    /**
     * Gets the {{#crossLink "OnscreenKeyboard"}}{{/crossLink}} object
     *
     * @property onscreenKeyboard
     * @type {OnscreenKeyboard}
     */
    get onscreenKeyboard(): OnscreenKeyboard;
    /**
     * Gets the {{#crossLink "Commands"}}{{/crossLink}} object
     *
     * @property commands
     * @type {Commands}
     */
    get commands(): Commands;
    /**
     * Gets the {{#crossLink "Transport"}}{{/crossLink}} object
     *
     * @property transport
     * @type {Transport}
     */
    get transport(): Transport;
    /**
     * Gets the {{#crossLink "Application"}}{{/crossLink}} object
     *
     * @property application
     * @type {Application}
     */
    get application(): Application;
    /**
     * Gets the {{#crossLink "Engine"}}{{/crossLink}} object
     *
     * @property engine
     * @type {Engine}
     */
    get engine(): Engine;
    /**
     * Gets the {{#crossLink "Bindings"}}{{/crossLink}} object
     *
     * @property bindings
     * @type {Bindings}
     */
    get bindings(): Bindings;
    #private;
}
import EventEmitter from 'events';
import { Song } from './Song.js';
import { SetList } from './SetList.js';
import { SongStates } from './SongStates.js';
import { KeyRanges } from './KeyRanges.js';
import { ShowNotes } from './ShowNotes.js';
import { Variables } from './Variables.js';
import { OnscreenKeyboard } from './OnscreenKeyboard.js';
import { Commands } from './Commands.js';
import { Transport } from './Transport.js';
import { Application } from './Application.js';
import { Engine } from './Engine.js';
import { Bindings } from './Bindings.js';
//# sourceMappingURL=Cantabile.d.ts.map