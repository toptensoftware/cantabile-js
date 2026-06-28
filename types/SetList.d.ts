/**
 * Used to access and control Cantabile's set list functionality.
 *
 * Access this object via the {{#crossLink "Cantabile/setList:property"}}{{/crossLink}} property.
 *
 * @class SetList
 * @extends EndPoint
 */
export class SetList extends EndPoint {
    /** @internal */
    constructor(owner: any);
    _currentSong: any;
    /**
     * An array of {{#crossLink "SetListItem"}}{{/crossLink}} items in the set list
     * @property items
     * @type {SetListItem[]}
     */
    get items(): SetListItem[];
    /**
     * The display name of the current set list (ie: its file name with path and extension removed)
     * @property name
     * @type {String}
     */
    get name(): string;
    /**
     * Indicates if the set list is currently pre-loaded
     * @property preLoaded
     * @type {Boolean}
     */
    get preLoaded(): boolean;
    /**
     * The index of the currently loaded song (or -1 if the current song isn't in the set list).
     * See also {{#crossLink "SetList/currentSong:property"}}{{/crossLink}}.
     * @property currentSongIndex
     * @type {Number}
     */
    get currentSongIndex(): number;
    /**
     * The currently loaded {{#crossLink "SetListItem"}}{{/crossLink}} (or null if the current song isn't in the set list).
     * See also {{#crossLink "SetList/currentSongIndex:property"}}{{/crossLink}}.
     * @property currentSong
     * @type {SetListItem}
     */
    get currentSong(): SetListItem;
    /**
     * Load the song at a given index position
     * @method loadSongByIndex
     * @param {Number} index The zero based index of the song to load
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadSongByIndex(index: number, delayed?: boolean): void;
    /**
     * Load the song with a given program number
     * @method loadSongByProgram
     * @param {Number} program The zero based program number of the song to load
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadSongByProgram(program: number, delayed?: boolean): void;
    /**
     * Load the first song in the set list
     * @method loadFirstSong
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadFirstSong(delayed?: boolean): void;
    /**
     * Load the last song in the set list
     * @method loadLastSong
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     */
    loadLastSong(delayed?: boolean): void;
    /**
     * Load the next or previous song in the set list
     * @method loadNextSong
     * @param {Number} direction Direction to move (1 = next, -1 = previous)
     * @param {Boolean} [delayed=false] Whether to perform a delayed or immediate load
     * @param {Boolean} [wrap=false] Whether to wrap around at the start/end of the list
     */
    loadNextSong(direction: number, delayed?: boolean, wrap?: boolean): void;
    /**
     * Gets a list of available set lists in the user's set list folder
     * @method available
     * @returns {String[]} An array of set list names (relative to user's set list folder, extension removed)
     */
    available(): string[];
    /**
     * Loads the specified set list from the user's set list folder
     * @method loadSetList
     * @param {String} name Name of the set to load (relative to user's set list folder, without extension)
     * @param {Boolean} loadFirst True to load the first song in the set list (default = true)
     */
    loadSetList(name: string, loadFirst?: boolean): void;
    _resolveCurrentSong(): void;
    _onEvent_setListChanged(data: any): void;
    _onEvent_itemAdded(data: any): void;
    _onEvent_itemRemoved(data: any): void;
    _onEvent_itemMoved(data: any): void;
    _onEvent_itemChanged(data: any): void;
    _onEvent_itemsReload(data: any): void;
    _onEvent_preLoadedChanged(data: any): void;
    _onEvent_currentSongChanged(data: any): void;
    _onEvent_currentSongPartChanged(data: any): void;
    _onEvent_nameChanged(data: any): void;
}
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=SetList.d.ts.map