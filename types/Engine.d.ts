/**
 * Provides access to Cantabile's engine object for start/stop control
 *
 * Access this object via the {{#crossLink "Cantabile/engine:property"}}{{/crossLink}} property.
 *
 * @class Engine
 */
export class Engine {
    /** @internal */
    constructor(owner: any);
    /**
     * Returns a promise to provide the started state of Cantabile's audio engine.
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method isStarted
     * @returns {Promise<Boolean>}
     */
    isStarted(): Promise<boolean>;
    /**
     * Starts Cantabile's audio engine
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method start
     * @returns {Promise}
     */
    start(): Promise<any>;
    /**
     * Stops Cantabile's audio engine
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method stop
     * @returns {Promise}
     */
    stop(): Promise<any>;
    /**
     * Restarts Cantabile's audio engine
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method restart
     * @returns {Promise}
     */
    restart(): Promise<any>;
    /**
     * Toggles the audio engine between started and stopped
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method startStop
     * @returns {Promise}
     */
    startStop(): Promise<any>;
    #private;
}
//# sourceMappingURL=Engine.d.ts.map