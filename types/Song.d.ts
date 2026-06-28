/**
 * Interface to the current song
 *
 * Access this object via the {{#crossLink "Cantabile/song:property"}}{{/crossLink}} property.
 *
 * @class Song
 * @extends EndPoint
 */
export class Song extends EndPoint {
    constructor(owner: any);
    /**
     * The name of the current song
     * @property name
     * @type {String}
     */
    get name(): string;
    /**
     * The set list program number of the song (or -1 if not in set list, or not set)
     * @property pr
     * @type {Number}
     */
    get pr(): number;
    /**
     * The name of the current song state
     * @property currentState
     * @type {String}
     */
    get currentState(): string;
    /**
     * Gets a list of available songs in the user's songs folder
     * @method available
     * @returns {String[]} An array of song names (relative to user's song folder, extension removed)
     */
    available(): string[];
    /**
     * Loads the specified song from the user's song folder
     * @method loadSong
     * @param {String} name Name of the song to load (relative to user's song folder, without extension)
     * @param {String} state Optional name of state to load, or null.
     */
    loadSong(name: string, state: string): void;
    _onEvent_songChanged(data: any): void;
    _onEvent_nameChanged(data: any): void;
    _onEvent_currentStateChanged(data: any): void;
}
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=Song.d.ts.map