/**
 * Represents an watched binding point for changes/invocations

 * Returned from the {{#crossLink "Bindings/watch:method"}}{{/crossLink}} method.
 *
 * @class BindingWatcher
 * @extends EventEmitter
 */
export class BindingWatcher extends EventEmitter<any> {
    constructor(owner: any, bindingPoint: any, callback: any);
    owner: any;
    /**
     * Returns the binding point being listened to
     *
     * @property bindingPoint
     * @type {BindingPoint}
     */
    get bindablePoint(): BindingPoint;
    /**
     * Returns the last received value for the source binding point
     *
     * @property value
     * @type {Object}
     */
    get value(): Object;
    _start(): void;
    _stop(): void;
    /**
     * Stops monitoring this binding source
     *
     * @method unwatch
     */
    unwatch(): void;
    _update(data: any): void;
    #private;
}
/**
 * Represents a target binding point prepared for multiple invocations

 * Returned from the {{#crossLink "Bindings/prepare:method"}}{{/crossLink}} method.
 *
 * @class PreparedBindingPoint
 */
export class PreparedBindingPoint {
    constructor(owner: any, bindingPoint: any);
    owner: any;
    _start(): void;
    _stop(): void;
    /**
     * Returns a promise that will resolve once this prepared binding has connected
     * @method waitForConnected
     * @returns {Promise}}
     */
    waitForConnected(): Promise<any>;
    /**
     * Check if this binding point is currently connected and ready to accept invocations
     *
     * @property isConnected
     * @type {Boolean}
     */
    get isConnected(): boolean;
    /**
     * Releases this prepared binding point
     *
     * @method unprepare
     */
    unprepare(): void;
    /**
     * Invokes this binding point
     * @method invoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Promise} A promise that resolves once the target binding point has been invoked
     */
    invoke(value: Object): Promise<any>;
    /**
     * Tries to invokes this binding point
     * @method tryInvoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Boolean|Promise} False if not currently connected, or a promise that resolves once the target
     *                            binding point has been invoked
     */
    tryInvoke(value: Object): boolean | Promise<any>;
    #private;
}
/**
 * Provides access to Cantabile's binding points.
 *
 * Access this object via the {{#crossLink "Cantabile/bindings:property"}}{{/crossLink}} property.
 *
 * @class Bindings
 * @extends EndPoint
 */
export class Bindings extends EndPoint {
    constructor(owner: any);
    /**
     * Retrieves a list of available binding points
     *
     * If Cantabile is running on your local machine you can view this list
     * directly at <http://localhost:35007/api/bindings/vailableBindingPoints>
     *
     * @example
     *
     *     let C = new Cantabile();
     *     console.log(await C.bindings.getAvailableBindingPoints());
     *
     * @method getAvailableBindingPoints
     * @returns {Promise<BindingPointEntry[]>} A promise to return an array of {{#crossLink "BindingPointEntry"}}{{/crossLink}} objects
     */
    getAvailableBindingPoints(): Promise<BindingPointEntry[]>;
    /**
     * Retrieves additional information about a specific binding point
     *
     * @example
     *
     *     let C = new Cantabile();
     *     console.log(await C.bindings.getBindingPointInfo("setList", "loadSongByProgram", false, {}, {}));
     *
     * @method getBindingPointInfo
     * @param {BindingPoint} bindingPoint the binding point to be queried
     * @param {Boolean} source whether to return information about the source or target version of the binding point
     * @returns {Promise<BindingPointInfo>} A promise to return a {{#crossLink "BindingPointInfo"}}{{/crossLink}} object
     */
    getBindingPointInfo(bindablePoint: any, source: boolean): Promise<BindingPointInfo>;
    /**
     * Invokes a target binding point
     *
     * If Cantabile is running on your local machine a full list of available binding
     * points is [available here](http://localhost:35007/api/bindings/availableBindingPoints)
     *
     * @example
     *
     * Set the master output level gain
     *
     *     C.bindings.invoke({
     * 			bindableId: "masterLevels",
     * 			bindingPointId: "outputGain"
     * 	   }, 0.5);
     *
     * @example
     *
     * Suspend the 2nd plugin in the song
     *
     *     C.bindings.invoke({
     * 			bindableId: "indexedPlugin",
     * 			bindableParams: {
     * 				rackIndex: 0, 			// 0 = song, 1 = first rack, 2 = second etc...
     * 				pluginIndex: 1, 		// 1 = second plugin (zero based)
     * 			}
     * 			bindingPointId: "suspend"
     *     }, true);
     *
     *
     * @example
     *
     * Sending a MIDI Controller Event
     *
     *     C.bindings.invoke({
     * 			bindableId: "midiPorts",
     * 			bindingPointId: "out.Main Keyboard",
     * 			bindingPointParams: {
     *         		kind: "Controller",
     *         		controller: 10,
     * 		   		channel: 0
     * 	   		}
     *      }, 65);
     *
     * @example
     *
     * Sending MIDI Data directly
     *
     *     C.bindings.invoke({
     * 			bindiableId: "midiPorts",
     *          bindingPointId: "out.Main Keyboard"
     * 	   }, [ 0xb0, 23, 99 ]);
     *
     * @example
     *
     * Sending MIDI Sysex Data directly
     *
     *     C.bindings.invoke({
     * 			bindiableId: "midiPorts",
     *          bindingPointId: "out.Main Keyboard"
     * 	   }, [ 0xF7, 0x00, 0x00, 0x00, 0xF0 ]);
     *
     * @method invoke
     * @param {BindingPoint} bindablePoint The binding point to invoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Promise} A promise that resolves once the target binding point has been invoked
     */
    invoke(bindingPoint: any, value: Object): Promise<any>;
    /**
     * Queries a source binding point for it's current value.
     *
     * @example
     *
     *     console.log("Current Output Gain:", await C.bindings.query({
     *         bindableId: "masterLevels",
     *         bindingPointId: "outputGain"
     *     }));
     *
     * @method query
     * @param {BindingPoint} bindingPoint The binding point to query
     * @returns {Promise<Object>} The current value of the binding source
     */
    query(bindingPoint: BindingPoint): Promise<Object>;
    /**
     * Starts watching a source binding point for changes (or invocations)
     *
     * @example
     *
     * Using a callback function:
     *
     *     let C = new Cantabile();
     *
     *     // Watch a source binding point using a callback function
     *     C.bindings.watch({
     *         bindableId: "masterLevels",
     *         bindingPointId: "outputGain",
     *     }, (value) => console.log("Master output gain changed to:", value));
     *
     * @example
     *
     * Using the BindingWatcher class and events:
     *
     *     let C = new Cantabile();
     *     let watcher = C.bindings.watch({
     *         bindableId: "masterLevels",
     *         bindingPointId: "outputGain",
     *     });
     *     watcher.on('invoked', function(value) {
     *         console.log("Master output gain changed to:", value);
     *     });
     *
     *     /// later, stop listening
     *     watcher.unwatch();
     *
     * @example
     *
     * Watching for a MIDI event:
     *
     *     C.bindings.watch({
     *         bindableId: "midiPorts",
     *         bindingPointId: "in.Onscreen Keyboard",
     *         bindingPointParams: {
     *             channel: 0,
     *             kind: "ProgramChange",
     *             controller: -1,
     *     }, (value) => console.log("Program Change: ", value));
     *
     * @example

     * Watching for a keystroke:
     *
     *     C.bindings.watch({
     *         bindableId: "pckeyboard",
     *         bindingPointId: "keyPress",
     *         bindingPointParams:  {
     *             key: "Ctrl+Alt+M"
     * 	       },
     *     }, () => console.log("Key press!"));
     *
     *
     * @method watch
     * @param {BindingPoint} bindingPoint The binding point to watch
     * @param {Function} [callback] Optional callback function to be called when the source binding triggers
     *
     * The callback function has the form function(value, source) where value is the new binding point value and source
     * is the BindingWatcher instance.
     *
     * @returns {BindingWatcher}
     */
    watch(bindingPoint: BindingPoint, callback?: Function): BindingWatcher;
    /**
     * Prepares a target binding point for multiple invocations
     *
     * @method prepare
     * @param {BindingPoint} bindingPoint The binding point to invoke
     * @returns {PreparedBindingPoint}
     */
    prepare(bindingPoint: BindingPoint): PreparedBindingPoint;
    _registerWatchId(watchId: any, watcher: any): void;
    _revokeWatchId(watchId: any): void;
    _revokeWatcher(w: any): void;
    _revokePrepped(p: any): void;
    _onEvent_invoked(data: any): void;
    #private;
}
import EventEmitter from 'events';
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=Bindings.d.ts.map