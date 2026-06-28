/**
 * Common functionality for all end point handlers
 *
 * @class EndPoint
 * @extends EventEmitter
 */
export class EndPoint extends EventEmitter<any> {
    /** @internal */
    static joinPath(a: any, b: any): string;
    /** @internal */
    constructor(owner: any, endPoint: any);
    /**
     * Gets the owning session of this end point
     * @property owner
     * @type {Cantabile}
     */
    get owner(): Cantabile;
    /**
     * Gets the end point url for this endpoint
     * @property endPoint
     * @type {string}
     */
    get endPoint(): string;
    /**
     * Gets the last received raw data for this end point
     * @property endPoint
     * @type {string}
     */
    get data(): string;
    _setData(value: any): void;
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
    connect(): Promise<any>;
    /**
     * Disconnect this end point and stops listening for events.
     *
     * Usually this method should never be used
     *
     * @method disconnect
     */
    disconnect(): void;
    /** @internal */
    send(method: any, endPoint: any, data: any): any;
    /** @internal */
    request(method: any, endPoint: any, data: any): any;
    /** @internal */
    post(endPoint: any, data: any): any;
    /** @internal */
    get(endPoint: any): any;
    /**
     * Checks if this end point is current connected
     * @property isConnected
     * @type {Boolean}
     */
    get isConnected(): boolean;
    /**
     * Checks if this end point will connect when the session connects
     * @property willConnect
     * @type {Boolean}
     */
    get willConnect(): boolean;
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
    waitForConnected(): Promise<any>;
    _onConnected(): void;
    _onDisconnected(): void;
    _dispatchEventMessage(eventName: any, data: any): void;
    #private;
}
import EventEmitter from 'events';
//# sourceMappingURL=EndPoint.d.ts.map