/**
 * Interface to the master transport
 *
 * Access this object via the {{#crossLink "Cantabile/transport:property"}}{{/crossLink}} property.
 *
 * @class Transport
 * @extends EndPoint
 */
export class Transport extends EndPoint {
    /** @internal */
    constructor(owner: any);
    set state(value: string);
    /**
     * Gets or sets the current transport state.  Supported values include "playing", "paused" or "stopped".
     * Setting this property calls {{#crossLink "Transport/play:method"}}{{/crossLink}},
     * {{#crossLink "Transport/pause:method"}}{{/crossLink}}, or
     * {{#crossLink "Transport/stop:method"}}{{/crossLink}} accordingly.
     * @property state
     * @type {String}
     */
    get state(): string;
    /**
     * Gets the current time signature numerator
     * @property timeSignatureNum
     * @type {Number}
     */
    get timeSignatureNum(): number;
    /**
     * Gets the current time signature denominator
     * @property timeSignatureDen
     * @type {Number}
     */
    get timeSignatureDen(): number;
    /**
     * Gets the current time signature as a string (eg: "3/4")
     * @property timeSignature
     * @type {String}
     */
    get timeSignature(): string;
    /**
     * Gets the current tempo
     * @property tempo
     * @type {Number}
     */
    get tempo(): number;
    set loopMode(value: string);
    /**
     * Gets or sets the current loopMode ("auto", "break", "loopOnce" or "loop").
     * Changes fire the {{#crossLink "Transport/loopStateChanged:event"}}{{/crossLink}} event.
     * @property loopMode
     * @type {String}
     */
    get loopMode(): string;
    /**
     * Gets the current loopCount
     * @property loopCount
     * @type {Number}
     */
    get loopCount(): number;
    /**
     * Gets the current loopIteration
     * @property loopIteration
     * @type {Number}
     */
    get loopIteration(): number;
    _onEvent_stateChanged(data: any): void;
    _onEvent_timeSigChanged(data: any): void;
    _onEvent_tempoChanged(data: any): void;
    _onEvent_loopStateChanged(data: any): void;
    /**
     * Starts transport playback
     * @method play
     */
    play(): void;
    /**
     * Toggles between play and pause states
     * @method togglePlayPause
     */
    togglePlayPause(): void;
    /**
     * Toggles pause and play states (unless stopped)
     * @method togglePause
     */
    togglePause(): void;
    /**
     * Toggles play and stopped states
     * @method togglePlay
     */
    togglePlay(): void;
    /**
     * Toggles between play and stop states
     * @method togglePlayStop
     */
    togglePlayStop(): void;
    /**
     * Pauses the master transport
     * @method pause
     */
    pause(): void;
    /**
     * Stops the master transport
     * @method stop
     */
    stop(): void;
    /**
     * Cycles between the various loop modes
     * @method cycleLoopMode
     */
    cycleLoopMode(): void;
}
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=Transport.d.ts.map