/**
 * Base states functionality for State and racks
 *
 * @class States
 * @extends EndPoint
 */
export class States extends EndPoint {
    _currentState: any;
    /**
     * An array of {{#crossLink "State"}}{{/crossLink}} items
     * @property items
     * @type {State[]}
     */
    get items(): State[];
    /**
     * The display name of the containing song or rack
     * @property name
     * @type {String}
     */
    get name(): string;
    /**
     * The index of the currently loaded State (or -1 if no active state).
     * See also {{#crossLink "States/currentState:property"}}{{/crossLink}}.
     * @property currentStateIndex
     * @type {Number}
     */
    get currentStateIndex(): number;
    /**
     * The currently loaded {{#crossLink "State"}}{{/crossLink}} (or null if no active state).
     * See also {{#crossLink "States/currentStateIndex:property"}}{{/crossLink}}.
     * @property currentState
     * @type {State}
     */
    get currentState(): State;
    /**
     * Load the State at a given index position
     * @method loadStateByIndex
     * @param {Number} index The zero based index of the State to load
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadStateByIndex(index: number, delayed?: boolean): void;
    /**
     * Load the State with a given program number
     * @method loadStateByProgram
     * @param {Number} program The zero based program number of the State to load
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadStateByProgram(program: number, delayed?: boolean): void;
    /**
     * Load the first state
     * @method loadFirstState
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadFirstState(delayed?: boolean): void;
    /**
     * Load the last state
     * @method loadLastState
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadLastState(delayed?: boolean): void;
    /**
     * Load the next or previous state
     * @method loadNextState
     * @param {Number} direction Direction to move (1 = next, -1 = previous)
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     * @param {Boolean} [wrap=false] Whether to wrap around at the start/end
     */
    loadNextState(direction: number, delayed?: boolean, wrap?: boolean): void;
    _resolveCurrentState(): void;
    _onEvent_songChanged(data: any): void;
    _onEvent_itemAdded(data: any): void;
    _onEvent_itemRemoved(data: any): void;
    _onEvent_itemMoved(data: any): void;
    _onEvent_itemChanged(data: any): void;
    _onEvent_itemsReload(data: any): void;
    _onEvent_currentStateChanged(data: any): void;
    _onEvent_nameChanged(data: any): void;
}
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=States.d.ts.map