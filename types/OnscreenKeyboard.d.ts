/**
 * Represents a monitored controller

 * Returned from the {{#crossLink "OnscreenKeyboard/watch:method"}}{{/crossLink}} method.
 *
 * @class ControllerWatcher
 * @extends EventEmitter
 */
export class ControllerWatcher extends EventEmitter<any> {
    constructor(owner: any, channel: any, kind: any, controller: any, listener: any);
    owner: any;
    _channel: any;
    _kind: any;
    _controller: any;
    _value: any;
    _listener: any;
    /**
     * Returns the MIDI channel number of controller being watched
     *
     * @property channel
     * @type {Number}
     */
    get channel(): number;
    /**
     * Returns the kind of controller being watched
     *
     * @property kind
     * @type {String}
     */
    get kind(): string;
    /**
     * Returns the number of the controller being watched
     *
     * @property controller
     * @type {Number}
     */
    get controller(): number;
    /**
    * Returns the current value of the controller
    *
    * @property value
    * @type {Number}
    */
    get value(): number;
    _start(): void;
    _id: any;
    _stop(): void;
    /**
     * Stops monitoring this controller for changes
     *
     * @method unwatch
     */
    unwatch(): void;
    _update(data: any): void;
    _fireChanged(): void;
}
/**
 * Provides access to controllers managed by Cantabile's on-screen keyboard device
 *
 * Access this object via the {{#crossLink "Cantabile/onscreenKeyboard:property"}}{{/crossLink}} property.
 *
 * @class OnscreenKeyboard
 * @extends EndPoint
 */
export class OnscreenKeyboard extends EndPoint {
    constructor(owner: any);
    watchers: any[];
    ids: {};
    /**
     * Queries the on-screen keyboard for the current value of a controller
     *
     * @example
     *
     * 	   // Get the value of cc 64 on channel 1
     *     let C = new Cantabile();
     *     console.log(await C.onscreenKeyboard.queryController(1, "controller", 64));
     *
     * @example
     *
     *     let C = new Cantabile();
     *     C.onscreenKeyboard.queryController(1, "controller", 64).then(r => console.log(r)));
     *
     * @method queryController
     * @param {Number} channel 		The MIDI channel number of the controller
     * @param {String} kind 		The MIDI controller kind
     * @param {Number} controller	The number of the controller
     * @returns {Promise<Number>} A promise to provide the controller value
     */
    queryController(channel: number, kind: string, controller: number): Promise<number>;
    /**
     * Starts watching a controller for changes
     *
     * @example
     *
     * Using a callback function:
     *
     *     let C = new Cantabile();
     *
     *     // Watch a controller using a callback function
     *     C.onscreenKeyboard.watchController(1, "controller", 64, function(value) {
     *         console.log(value);
     *     })
     *
     * 	   // The "onscreenKeyboard" end point must be opened before callbacks will happen
     *     C.onscreenKeyboard.open();
     *
     * @example
     *
     * Using the ControllerWatcher class and events:
     *
     *     let C = new Cantabile();
     *     let watcher = C.onscreenKeyboard.watchController(1, "controller", 64);
     *     watcher.on('changed', function(value) {
     *         console.log(value);
     *     });
     *
     *     // The "onscreenKeyboard" end point must be opened before callbacks will happen
     *     C.onscreenKeyboard.open();
     *
     *     /// later, stop listening
     *     watcher.unwatch();
     *
     * @method watch
     * @param {Number} channel 		The MIDI channel number of the controller
     * @param {String} kind 		The MIDI controller kind
     * @param {Number} controller	The number of the controller
     * @param {Function} [callback] Optional callback function to be called when the controller value changes.
     *
     * The callback function has the form function(value, source) where value is the controller value and source
     * is the {{#crossLink "ControllerWatcher"}}{{/crossLink}} instance.
     *
     * @returns {ControllerWatcher}
     */
    watch(channel: number, kind: string, controller: number, listener: any): ControllerWatcher;
    /**
     * Inject MIDI from the on-screen keyboard device
     *
     * @method injectMidi
     * @param {object} data		An array of bytes or a MidiControllerEvent
     *
     * @example
     *
     * Using a callback function:
     *
     *     // Send a note on event
     *     C.onscreenKeyboard.inject([0x90, 64, 64]);
     *
     * @example
     *
     * Using the MidiControllerEvent
     *
     *     // Send Midi CC 23 = 127
     *     let watcher = C.onscreenKeyboard.inject({
     *          channel: 0,
     *          kind: "controller",
     *          controller: 23,
     *          value: 127,
     *     });
     *
     */
    injectMidi(data: object): void;
    _registerWatcher(id: any, watcher: any): void;
    _revokeWatcher(id: any): void;
    _onEvent_controllerChanged(data: any): void;
}
import EventEmitter from 'events';
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=OnscreenKeyboard.d.ts.map