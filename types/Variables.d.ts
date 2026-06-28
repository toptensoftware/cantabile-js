/**
 * Represents a monitored pattern string.

 * Returned from the {{#crossLink "Variables/watch:method"}}{{/crossLink}} method.
 *
 * @class PatternWatcher
 * @extends EventEmitter
 */
export class PatternWatcher extends EventEmitter<any> {
    constructor(owner: any, pattern: any, listener: any);
    owner: any;
    _pattern: any;
    _patternId: number;
    _resolved: string;
    _listener: any;
    /**
     * Returns the pattern string being watched
     *
     * @property pattern
     * @type {String}
     */
    get pattern(): string;
    /**
     * Returns the current resolved display string
     *
     * @property resolved
     * @type {String}
     */
    get resolved(): string;
    _start(): void;
    _stop(): void;
    /**
     * Stops monitoring this pattern string for changes
     *
     * @method unwatch
     */
    unwatch(): void;
    _update(data: any): void;
    _fireChanged(): void;
}
/**
 * Provides access to Cantabile's internal variables by allowing a pattern string to be
 * expanded into a final display string.
 *
 * Access this object via the {{#crossLink "Cantabile/variables:property"}}{{/crossLink}} property.
 *
 * @class Variables
 * @extends EndPoint
 */
export class Variables extends EndPoint {
    constructor(owner: any);
    watchers: any[];
    patternIds: {};
    /**
     * Resolves a variable pattern string into a final display string
     *
     * @example
     *
     *     let C = new Cantabile();
     *     console.log(await C.variables.resolve("Song: $(SongTitle)"));
     *
     * @example
     *
     *     let C = new Cantabile();
     *     C.variables.resolve("Song: $(SongTitle)").then(r => console.log(r)));
     *
     * @method resolve
     * @returns {Promise<String>} A promise to provide the resolved string
     */
    resolve(pattern: any): Promise<string>;
    /**
     * Starts watching a pattern string for changes
     *
     * @example
     *
     * Using a callback function:
     *
     *     let C = new Cantabile();
     *
     *     // Watch a string pattern using a callback function
     *     C.variables.watch("Song: $(SongTitle)", function(resolved) {
     *         console.log(resolved);
     *     })
     *
     * 	   // The "variables" end point must be opened before callbacks will happen
     *     C.variables.open();
     *
     * @example
     *
     * Using the PatternWatcher class and events:
     *
     *     let C = new Cantabile();
     *     let watcher = C.variables.watch("Song: $(SongTitle)");
     *     watcher.on('changed', function(resolved) {
     *         console.log(resolved);
     *     });
     *
     * 	   // The "variables" end point must be opened before callbacks will happen
     *     C.variables.open();
     *
     *     /// later, stop listening
     *     watcher.unwatch();
     *
     * @method watch
     * @param {String} pattern The string pattern to watch
     * @param {Function} [callback] Optional callback function to be called when the resolved display string changes.
     *
     * The callback function has the form function(resolved, source) where resolved is the resolved display string and source
     * is the {{#crossLink "PatternWatcher"}}{{/crossLink}} instance.
     *
     * @returns {PatternWatcher}
     */
    watch(pattern: string, listener: any): PatternWatcher;
    _registerPatternId(patternId: any, watcher: any): void;
    _revokePatternId(patternId: any): void;
    _revokeWatcher(w: any): void;
    _onEvent_patternChanged(data: any): void;
}
import EventEmitter from 'events';
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=Variables.d.ts.map