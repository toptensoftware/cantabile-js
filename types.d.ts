declare module "@toptensoftware/cantabile-js" {
/** 
 * Describes the connection state of the Cantabile connection 
 */
export type ConnectionState = 
    'connecting' | 
    'connected' | 
    'disconnected';
/**
 * Identifies the kind of set list item
 */
export type SetListItemKind = 
    'song' | 
    'break';
/**
 * Represents an item in a list
 */
export interface SetListItem
{
    /** The item kind  */
    readonly kind: SetListItemKind;

    /** The name of the song or break */
    readonly name: string;

    /** The zero based program number of a song */
    readonly pr: number;

    /** The color of the item (0 to 15) */
    readonly color: number;
}
/**
 * Describes a binding point
 */
export interface BindingPoint
{
    /** The id of the bindable object */
    bindableId: string;

    /** Optional parameters for the bindable object */
    bindableParams?: object;

    /** The id of the binding point on the bindable object */
    bindingPointId: string;

    /** Optional parameters for the binding point */
    bindingPointParams?: object;
}
/**
 * describes a binding point entry as returned from {@linkcode Bindings#getAvailableBindingPoints}
 */
export interface BindingPointEntry
{
    /** The id of the bindable object */
    bindableId: string;

    /** The id of the binding point on the bindable object */
    bindingPointId: string; 

    /** The display name of the binding point */
    displayName: string;

    /** Indicates if this binding point can be used as a source binding point */
    isSource: boolean;

    /** Indicates if this binding point can be used as a target binding point */
    isTarget: boolean;
}
/**
 * Identifies the kind of binding point
 */
export type BindingPointKind = 
    'Command' | 
    'Switch' | 
    'Value' | 
    'Object';
/**
 * Identifies the value format of a binding point value
 */
export type BindingPointValueFormat = 
    'None' | 
    'Float' | 
    'Integer' | 
    'Index' | 
    'ProgramNumber' | 
    'BankedProgramNumber' | 
    'BankedProgramMask' | 
    'GainLevel' | 
    'PitchBend';
/**
 * Information about an available binding point
 */
export interface BindingPointInfo
{
    /** The id of the binding point */
    id: string;

    /** The display name of the binding point */
    displayName: string;

    /** The kind of value accepted/sent by this binding point */
    kind: BindingPointKind;

    /** The kind of value accepted/sent by this binding point
     * This property is only present if 'kind' is "Value" */
    valueFormat: BindingPointValueFormat;

    /** The minimum value range (only if 'kind' is "Value") */
    valueMin: number;


    /** The maximum value range (only if 'kind' is "Value") */
    valueMax: number;

    /** Information about the bindable object parameters supported by this binding point */
    bindableParams: BindingParam[];

    /** Information about the binding point parameters supported by this binding point */
    bindingPointParams: BindingParam[];

}
/**
 * Describes a binding point parameter
 */
export interface BindingParam
{
    /** The name of the parameter */
    name: string;

    /** The type of the parameter */
    type: string;
}
/**
 * Describes a built in color
 */
export interface ColorEntry
{
    /** The foreground color in #RRGGBBAA format */
    fore: string;

    /** The background color in #RRGGBBAA format */
    back: string;
}
/**
 * Describes an available command 
 */
export interface CommandInfo
{
    /** The id of the command */
    id: string;

    /** The display name of the command */
    name: string;
}
/**
 * Describes an active key range
 */
export interface KeyRange
{
    /** The MIDI note number of the lowest note in the key range */
    min: number;

    /** The MIDI note number of the highest note in the key range */
    max: number;

    /** The transpose setting associated with the key range (in semi-tones) */
    transport: number;

    /** The color associated with the key range (0 - 15) */
    color: number;

    /** The title of the key range (ie: name of the target) */
    title: string;
}
/**
 * Text alignment constants for show note text
 */
export type ShowNoteTextAlignment = 
    'left' | 
    'center' | 
    'right';
 /**
 * Describes a show note item
 */
export interface ShowNote
{
    /** Background color (0 - 15) */
    backgroundColor: number;

    /** Bold font */
    bold: boolean;

    /** Fixed pitch font */
    fixedPitch: boolean;

    /** Font size */
    fontSize: number;

    /** True if the show note is currently hidden */
    hidden: boolean;

    /** URL to retrieve the note's background image (or null) */
    imageUrl: string;

    /** How much to scale the image by (0.0 - 1.0) */
    imageScale: number;

    /** Width of the image in pixels */
    imageWidth: number;

    /** Height of the image in pixels */
    imageHeight: number;

    /** The show note's text */
    text: string;

    /** Text alignment */
    textAlign: ShowNoteTextAlignment;

    /** Text color (0 - 15) */
    textColor: number;
}
/**
 * An anonymous type representing a state
 */
export interface State
{
    /** The name of the state */
    name: string;

    /** The zero based program number of the state */
    pr: number;

    /** The color of the state (0 to 15) */
    color: number;
}
/** MIDI Controller Event Kinds */
export type MidiControllerEventKind = 
    'Controller' |
    'FineController' |
    'ControllerButton' |
    'ControllerNonEdgeButton' |
    'ControllerSwitch' |
    'ProgramChange	' |
    'BankedProgramChange' |
    'PitchBend		' |
    'ChannelPressure' |
    'Note' |
    'NoteOff' |
    'NoteSwitch' |
    'RpnCoarse' |
    'RpnFine' |
    'NRpnCoarse' |
    'NRpnFine' |
    'MasterVolume' |
    'MasterBalance' |
    'MmcStop' |
    'MmcPlay' |
    'MmcDeferredPlay' |
    'MmcFastForward' |
    'MmcRewind' |
    'MmcRecordPunchIn' |
    'MmcRecordPunchOut' |
    'MmcRecordReady' |
    'MmcPause' |
    'MmcEject' |
    'MmcChase' |
    'MmcReset' |
    'SongSelect' |
    'ClockStart' |
    'ClockContinue' |
    'ClockStop';
/**
 * An anonymous type representing a complex MIDI controller event.  
 * 
 * MidiController events can be passed to anywhere that expects MIDI Data (eg: a target MIDI binding point), or can be 
 * used as a condition on a MIDI source binding point.
 */
export interface MidiControllerEvent
{
    /** The zero based MIDI channel number of the event (0-15) */
    channel: number;

    /** The kind of MIDI event */
    kind: MidiControllerEventKind;

    /** 
     * The associated controller number for any of the controller event kinds, or the program
     * number for program change event kinds.  
     * 
     * When used as a source binding condition, this property can be set to -1 for program change
     * events to be triggered on any program change.
     */
    controller: number;

    /**
     * The value property is only used when sending MIDI data and is ignored if specified when
     * setting a source binding condition.
     */
    value: number;
}
/**
 * Transport states
 */
export type TransportState = 
    "playing" | 
    "paused" | 
    "stopped";
/** Transport loop modes */
export type TransportLoopMode = 
    "auto" | 
    "break" |
    "loopOnce" | 
    "loop";
/** Controller event kinds */
export type MidiControllerKind = 
    'Controller' |
    'FineController' |
    'Program' |
    'BankedProgram' |
    'PitchBend		' |
    'ChannelPressure' |
    'RpnCoarse' |
    'RpnFine' |
    'NRpnCoarse' |
    'NRpnFine';
/** Callback from a bindings watcher */
export type BindingWatcherCallback = (value: any, source: BindingWatcher) => void;
/** Callback from a variables pattern watcher */
export type PatternWatcherCallback = (value: string, source: PatternWatcher) => void;
/** Callback from a controller watcher */
export type ControllerWatcherCallback = (value: number, source: ControllerWatcher) => void;
/**
 * Fired when the resolved display string has changed
 *
 * @event PatternWatcher#changed
 * @property {String} resolved The new resolved display string
 * @property {PatternWatcher} source This object
 */
/**
 * Represents a monitored pattern string.

 * Returned from the {@linkcode Variables#watch} method.
 *
 * @fires PatternWatcher#changed
 */
export class PatternWatcher extends EventEmitter<any> {
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
    /**
     * Stops monitoring this pattern string for changes
     *
     * @method unwatch
     */
    unwatch(): void;
}
/**
 * Provides access to Cantabile's internal variables by allowing a pattern string to be
 * expanded into a final display string.
 *
 * Access this object via the {@linkcode Cantabile#variables} property.
 *
 */
export class Variables extends EndPoint {
    /**
     * Resolves a variable pattern string into a final display string
     *
     * @example
     *
     * console.log(await C.variables.resolve("Song: $(SongTitle)"));
     *
     * @example
     *
     * C.variables.resolve("Song: $(SongTitle)").then(r => console.log(r)));
     *
     * @method resolve
     * @param {string} pattern The string variable pattern to resolve
     * @returns {Promise<String>} A promise to provide the resolved string
     */
    resolve(pattern: string): Promise<string>;
    /**
     * Starts watching a pattern string for changes
     *
     * @example
     *
     * // Watch a string pattern using a callback function
     * C.variables.watch("Song: $(SongTitle)", function(resolved) {
     *     console.log(resolved);
     * })
     *
     * @example
     *
     * // Using the PatternWatcher class and events:
     * let watcher = C.variables.watch("Song: $(SongTitle)");
     * watcher.on('changed', function(resolved) {
     *     console.log(resolved);
     * });
     *
     * /// later, stop listening
     * watcher.unwatch();
     *
     * @method watch
     * @param {String} pattern The string pattern to watch
     * @param {PatternWatcherCallback} [callback] Optional callback function to be called when the resolved display string changes.
     * @returns {PatternWatcher}
     */
    watch(pattern: string, callback?: PatternWatcherCallback): PatternWatcher;
}
/**
 * Fired when the current transport state has changed
 *
 * @event Transport#stateChanged
 */
/**
 * Fired when the current time signature has changed
 *
 * @event Transport#timeSignatureChanged
 */
/**
 * Fired when the current tempo has changed
 *
 * @event Transport#tempoChanged
 */
/**
 * Fired when the current loop mode, loop iteration or loop count has changed
 *
 * @event Transport#loopStateChanged
 */
/**
 * Interface to the master transport
 *
 * Access this object via the {@linkcode Cantabile#transport} property.
 *
 * @fires Transport#stateChanged
 * @fires Transport#timeSignatureChanged
 * @fires Transport#tempoChanged
 * @fires Transport#loopStateChanged
 */
export class Transport extends EndPoint {
    set state(value: TransportState);
    /**
     * The current transport state.
     * @property state
     * @type {TransportState}
     */
    get state(): TransportState;
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
    set loopMode(value: TransportLoopMode);
    /**
     * Gets or sets the current loopMode
     * @property loopMode
     * @type {TransportLoopMode}
     */
    get loopMode(): TransportLoopMode;
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
/**
 * Fired after a new state has been added
 *
 * @event States#itemAdded
 * @property {Number} index The zero based index of the newly added item
 */
/**
 * Fired when anything about the contents of state list changes
 *
 * @event States#changed
 */
/**
 * Fired after a state has been removed
 *
 * @event States#itemRemoved
 * @property {Number} index The zero based index of the removed item
 */
/**
 * Fired when an item has been moved
 *
 * @event States#itemMoved
 * @property {Number} from The zero based index of the item before being moved
 * @property {Number} to The zero based index of the item's new position
 */
/**
 * Fired when something about an state has changed
 *
 * @event States#itemChanged
 * @property {Number} index The zero based index of the item that changed
 */
/**
 * Fired when the entire set of states has changed (eg: after a sort operation, or loading a new song/rack)
 *
 * @event States#reload
 */
/**
 * Fired when the current state changes
 *
 * @event States#currentStateChanged
 */
/**
 * Fired when the name of the containing song or rack changes
 *
 * @event States#nameChanged
 */
/**
 * Base states functionality for State and racks
 *
*  @fires States#itemAdded
 * @fires States#changed
 * @fires States#itemRemoved
 * @fires States#itemMoved
 * @fires States#itemChanged
 * @fires States#reload
 * @fires States#currentStateChanged
 * @fires States#nameChanged
 */
export class States extends EndPoint {
    /**
     * An array of {@linkcode State} items
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
     * See also {@linkcode States#currentState}.
     * @property currentStateIndex
     * @type {Number}
     */
    get currentStateIndex(): number;
    /**
     * The currently loaded {@linkcode State} (or null if no active state).
     * See also {@linkcode States#currentStateIndex}.
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
}
/**
 * Interface to the states of the current song
 *
 * Access this object via the {@linkcode Cantabile#songStates} property.
 *
 */
export class SongStates extends States {
}
/**
 * Fired when anything about the current song changes
 *
 * @event Song#changed
 */
/**
 * Fired when the name of the current song changes
 *
 * @event Song#nameChanged
 */
/**
 * Fired when the current song state changes
 *
 * @event Song#currentStateChanged
 */
/**
 * Interface to the current song
 *
 * Access this object via the {@linkcode Cantabile#song} property.
 *
 * @fires Song#changed
 * @fires Song#nameChanged
 * @fires Song#currentStateChanged
 */
export class Song extends EndPoint {
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
}
/**
 * Fired after a new show note has been added
 *
 * @event ShowNotes#itemAdded
 * @property {Number} index The zero based index of the newly added item
 */
/**
 * Fired when anything about the current set of show notes changes
 *
 * @event ShowNotes#changed
 */
/**
 * Fired after a show note has been removed
 *
 * @event ShowNotes#itemRemoved
 * @property {Number} index The zero based index of the removed item
 */
/**
 * Fired when an show note has been moved
 *
 * @event ShowNotes#itemMoved
 * @property {Number} from The zero based index of the item before being moved
 * @property {Number} to The zero based index of the item's new position
 */
/**
 * Fired when something about an show note has changed
 *
 * @event ShowNotes#itemChanged
 * @property {Number} index The zero based index of the item that changed
 */
/**
 * Fired when the entire set of show notes has changed (eg: after  loading a new song)
 *
 * @event ShowNotes#reload
 */
/**
 * Fired when the markdown notes have changed
 *
 * @event ShowNotes#markdownChanged
 */
/** Used to access the current set of show notes
 *
 * Access this object via the {@linkcode Cantabile#showNotes} property.
 * @fires ShowNotes#itemAdded
 * @fires ShowNotes#changed
 * @fires ShowNotes#itemRemoved
 * @fires ShowNotes#itemMoved
 * @fires ShowNotes#itemChanged
 * @fires ShowNotes#reload
 * @fires ShowNotes#markdownChanged
 *
 */
export class ShowNotes extends EndPoint {
    /**
     * Get's the original v1 show notes in raw json format
     * @returns {Promise<object>} Returns a promise for the JSON data
     */
    getV1Raw(): Promise<object>;
    /**
     * An array of {@linkcode ShowNote} items
     * @property items
     * @type {ShowNote[]}
     */
    get items(): ShowNote[];
    /**
     * The markdown show notes
     */
    get markdown(): any;
    /**
     * Stores the markdown notes		 for the current song
     *
     * @param {string} markdown The markdown to store
     * @returns {Promise<void>} A promise that resolves when the markdown has been stored with the song
     */
    storeMarkdown(markdown: string): Promise<void>;
}
/**
 * Fired after a new item has been added to the set list
 *
 * @event SetList#itemAdded
 * @property {Number} index The zero based index of the newly added item
 */
/**
 * Fired when anything about the contents of the set list changes
 *
 * @event SetList#changed
 */
/**
 * Fired after an item has been removed from the set list
 *
 * @event SetList#itemRemoved
 * @property {Number} index The zero based index of the removed item
 */
/**
 * Fired when an item in the set list has been moved
 *
 * @event SetList#itemMoved
 * @property {Number} from The zero based index of the item before being moved
 * @property {Number} to The zero based index of the item's new position
 */
/**
 * Fired when something about an item has changed
 *
 * @event SetList#itemChanged
 * @property {Number} index The zero based index of the item that changed
 */
/**
 * Fired when the entire set list has changed (eg: after a sort operation, or loading a new set list)
 *
 * @event SetList#reload
 */
/**
 * Fired when the pre-loaded state of the list has changed
 *
 * @event SetList#preLoadedChanged
 */
/**
 * Fired when the currently loaded song changes
 *
 * @event SetList#currentSongChanged
 */
/**
 * Fired when the part of the currently loaded song changes
 *
 * @event SetList#currentSongPartChanged
 * @property {Number} part The zero-based current song part index (can be -1)
 * @property {Number} partCount The number of parts in the current song
 */
/**
 * Fired when the name of the currently loaded set list changes
 *
 * @event SetList#nameChanged
 */
/**
 * Used to access and control Cantabile's set list functionality.
 *
 * Access this object via the {@linkcode Cantabile#setList} property.
 *
 * @fires SetList#itemAdded
 * @fires SetList#changed
 * @fires SetList#itemRemoved
 * @fires SetList#itemMoved
 * @fires SetList#itemChanged
 * @fires SetList#reload
 * @fires SetList#preLoadedChanged
 * @fires SetList#currentSongChanged
 * @fires SetList#currentSongPartChanged
 * @fires SetList#nameChanged
 */
export class SetList extends EndPoint {
    /**
     * An array of {@linkcode SetListItem} items in the set list
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
     * See also {@linkcode SetList#currentSong}.
     * @property currentSongIndex
     * @type {Number}
     */
    get currentSongIndex(): number;
    /**
     * The currently loaded {@linkcode SetListItem} (or null if the current song isn't in the set list).
     * See also {@linkcode SetList#currentSongIndex}.
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
}
/**
 * Fired when the controller value changes
 *
 * @event ControllerWatcher#changed
 * @property {Number} value The new value of the controller
 * @property {ControllerWatcher} source This object
 */
/**
 * Represents a monitored controller

 * Returned from the {@linkcode OnscreenKeyboard#watch} method.
 * @fires ControllerWatcher#changed
 */
export class ControllerWatcher extends EventEmitter<any> {
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
     * @type {MidiControllerKind}
     */
    get kind(): MidiControllerKind;
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
    /**
     * Stops monitoring this controller for changes
     *
     * @method unwatch
     */
    unwatch(): void;
}
/**
 * Provides access to controllers managed by Cantabile's on-screen keyboard device
 *
 * Access this object via the {@linkcode Cantabile#onscreenKeyboard} property.
 *
 */
export class OnscreenKeyboard extends EndPoint {
    /**
     * Queries the on-screen keyboard for the current value of a controller
     *
     * @example
     *
     * // Get the value of cc 64 on channel 1
     * console.log(await C.onscreenKeyboard.queryController(1, "controller", 64));
     *
     * @example
     *
     * C.onscreenKeyboard.queryController(1, "controller", 64).then(r => console.log(r)));
     *
     * @method queryController
     * @param {Number} channel 		The MIDI channel number of the controller
     * @param {MidiControllerKind} kind 		The MIDI controller kind
     * @param {Number} controller	The number of the controller
     * @returns {Promise<Number>} A promise to provide the controller value
     */
    queryController(channel: number, kind: MidiControllerKind, controller: number): Promise<number>;
    /**
     * Starts watching a controller for changes
     *
     * @example
     *
     * // Watch a controller using a callback function
     * C.onscreenKeyboard.watchController(1, "controller", 64, function(value) {
     *     console.log(value);
     * })
     *
     * @example
     *
     * // Using the ControllerWatcher class and events:
     * let watcher = C.onscreenKeyboard.watchController(1, "controller", 64);
     * watcher.on('changed', function(value) {
     *     console.log(value);
     * });
     *
     * /// later, stop listening
     * watcher.unwatch();
     *
     * @method watch
     * @param {Number} channel 		The MIDI channel number of the controller
     * @param {MidiControllerKind} kind 		The MIDI controller kind
     * @param {Number} controller	The number of the controller
     * @param {ControllerWatcherCallback} [callback] Optional callback function to be called when the controller value changes.
     * @returns {ControllerWatcher}
     */
    watch(channel: number, kind: MidiControllerKind, controller: number, callback?: ControllerWatcherCallback): ControllerWatcher;
    /**
     * Inject MIDI from the on-screen keyboard device
     *
     * @method injectMidi
     * @param {object} data		An array of bytes or a MidiControllerEvent
     *
     * @example
     *
     * // Send a note on event
     * C.onscreenKeyboard.inject([0x90, 64, 64]);
     *
     * @example
     *
     * // Send Midi CC 23 = 127
     * let watcher = C.onscreenKeyboard.inject({
     *      channel: 0,
     *      kind: "controller",
     *      controller: 23,
     *      value: 127,
     * });
     *
     */
    injectMidi(data: object): void;
}
/**
 * Fired when the active set of key ranges has changed
 *
 * @event KeyRanges#changed
 */
/**
 * Provides access to information about the currently active set of key ranges
 *
 * Access this object via the {@linkcode Cantabile#keyRanges} property.
 * @fires KeyRanges#changed
 */
export class KeyRanges extends EndPoint {
    /**
     * An array of {@linkcode KeyRange} items
     * @property items
     * @type {KeyRange[]}
     */
    get items(): KeyRange[];
}
/**
 * Provides access to Cantabile's engine object for start/stop control
 *
 * Access this object via the {@linkcode Cantabile#engine} property.
 *
 */
export class Engine {
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
     * @returns {Promise<void>}
     */
    start(): Promise<void>;
    /**
     * Stops Cantabile's audio engine
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method stop
     * @returns {Promise<void>}
     */
    stop(): Promise<void>;
    /**
     * Restarts Cantabile's audio engine
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method restart
     * @returns {Promise<void>}
     */
    restart(): Promise<void>;
    /**
     * Toggles the audio engine between started and stopped
     *
     * This API is only available via  AJAX, and not WebSocket
     *
     * @method startStop
     * @returns {Promise<void>}
     */
    startStop(): Promise<void>;
}
/**
 * Common functionality for all end point handlers
 *
 */
export class EndPoint extends EventEmitter<any> {
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
    /**
     * Connects this end point and starts listening for events.
     *
     * Usually this method doesn't need to be called since the session
     * object normally automatically connects end point objects when
     * first accessed
     *
     * @method connect
     * @returns {Promise<void>} A promise that resolves when connected
     */
    connect(): Promise<void>;
    /**
     * Disconnect this end point and stops listening for events.
     *
     * Usually this method should never be used
     *
     * @method disconnect
     */
    disconnect(): void;
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
     * await C.application.waitForConnected();
     *
     * @method waitForConnected
     * @returns {Promise<void>}
     */
    waitForConnected(): Promise<void>;
}
/**
 * Provides access to Cantabile's UI commands
 *
 * Access this object via the {@linkcode Cantabile#commands} property.
 *
 */
export class Commands extends EndPoint {
    /**
     * Retrieves a list of available commands
     *
     * If Cantabile is running on your local machine you can view this list
     * directly at <http://localhost:35007/api/commands/availableCommands>
     *
     * @example
     *
     * console.log(await C.commands.availableCommands());
     *
     * @method availableCommands
     * @returns {Promise<CommandInfo[]>} A promise to return an array of {@linkcode CommandInfo} objects
     */
    availableCommands(): Promise<CommandInfo[]>;
    /**
     * Invokes a command
     *
     * @example
     *
     * // Show the file open dialog
     * C.commands.invoke("file.open");
     *
     * @param {String} id The id of the command to invoke
     * @method invoke
     * @returns {Promise<void>} A promise that resolves once the target command has been invoked
     */
    invoke(id: string): Promise<void>;
}
/**
 * Fired when the connection state of the session changes
 * @event Cantabile#stateChanged
 * @property {ConnectionState} newState The new connection state of the session
 */
/**
 * Fired when entering the connected state
 * @event Cantabile#connected
 */
/**
 * Fired when entering the connecting state
 * @event Cantabile#connecting
 */
/**
 * Fired when entering the disconnected state
* @event Cantabile#disconnected
 */
/**
* Represents a connection to Cantabile.
*
* @fires Cantabile#stateChanged
* @fires Cantabile#connected
* @fires Cantabile#connecting
* @fires Cantabile#disconnected
*/
export class Cantabile extends EventEmitter<any> {
    /**
     * Creates a new Cantabile network session
     * @constructor
     * @param {string|Object} options A string host, or configuration options
     * @param {string} [options.host] the host to connect to (defaults to browser url, or localhost:35007)
     * @param {boolean} [options.autoConnect=true] if true automatically initiates connection
     * @param {boolean} [options.autoConnectEndPoints=true] if true automatically connects end point objects when accessed
     * @param {number} [options.maxListeners=30] set the max event listeners for this object (if supported)
     */
    constructor(options: string | Object);
    set autoConnectEndPoints(value: boolean);
    /**
     * Controls whether the sub-object end points are automatically
     * connected when first accessed.
     *
     * @property autoConnectEndPoints
     * @type {Boolean}
     */
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
     * @returns {Promise<void>} a promise that resolves when connected
     */
    connect(): Promise<void>;
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
     * @param {object} message The message object to send
     * @returns {Promise<object>}
     */
    request(message: object): Promise<object>;
    /**
     * Returns a promise that will be resolved when connected
     *
     * @example
     *
     * let C = new Cantabile();
     * await C.waitForConnected();
     *
     * @method waitForConnected
     * @returns {Promise<void>}
     */
    waitForConnected(): Promise<void>;
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
    /**
     * Gets the {@linkcode Song} object
     *
     * @property song
     * @type {Song}
     */
    get song(): Song;
    /**
     * Gets the {@linkcode SetList} object
     *
     * @property setList
     * @type {SetList}
     */
    get setList(): SetList;
    /**
     * Gets the {@linkcode SongStates} object
     *
     * @property songStates
     * @type {SongStates}
     */
    get songStates(): SongStates;
    /**
     * Gets the {@linkcode KeyRanges} object
     *
     * @property keyRanges
     * @type {KeyRanges}
     */
    get keyRanges(): KeyRanges;
    /**
     * Gets the {@linkcode ShowNotes} object
     *
     * @property showNotes
     * @type {ShowNotes}
     */
    get showNotes(): ShowNotes;
    /**
     * Gets the {@linkcode Variables} object
     *
     * @property variables
     * @type {Variables}
     */
    get variables(): Variables;
    /**
     * Gets the {@linkcode OnscreenKeyboard} object
     *
     * @property onscreenKeyboard
     * @type {OnscreenKeyboard}
     */
    get onscreenKeyboard(): OnscreenKeyboard;
    /**
     * Gets the {@linkcode Commands} object
     *
     * @property commands
     * @type {Commands}
     */
    get commands(): Commands;
    /**
     * Gets the {@linkcode Transport} object
     *
     * @property transport
     * @type {Transport}
     */
    get transport(): Transport;
    /**
     * Gets the {@linkcode Application} object
     *
     * @property application
     * @type {Application}
     */
    get application(): Application;
    /**
     * Gets the {@linkcode Engine} object
     *
     * @property engine
     * @type {Engine}
     */
    get engine(): Engine;
    /**
     * Gets the {@linkcode Bindings} object
     *
     * @property bindings
     * @type {Bindings}
     */
    get bindings(): Bindings;
}
/**
 * Fired when the source binding point is triggered
 *
 * @event BindingWatcher#invoked
 * @property {Object} value The value supplied from the source binding
 * @property {BindingWatcher} source This object
 */
/**
 * Represents an watched binding point for changes/invocations

 * Returned from the {@linkcode Bindings#watch} method.
 *
 * @fires BindingWatcher#invoked
 */
export class BindingWatcher extends EventEmitter<any> {
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
    /**
     * Stops monitoring this binding source
     *
     * @method unwatch
     */
    unwatch(): void;
}
/**
 * Represents a target binding point prepared for multiple invocations

 * Returned from the {@linkcode Bindings#prepare} method.
 *
 */
export class PreparedBindingPoint {
    /**
     * Returns a promise that will resolve once this prepared binding has connected
     * @method waitForConnected
     * @returns {Promise<void>}}
     */
    waitForConnected(): Promise<void>;
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
     * @returns {Promise<void>} A promise that resolves once the target binding point has been invoked
     */
    invoke(value: Object): Promise<void>;
    /**
     * Tries to invokes this binding point
     * @method tryInvoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Boolean|Promise} False if not currently connected, or a promise that resolves once the target
     *                            binding point has been invoked
     */
    tryInvoke(value: Object): boolean | Promise<any>;
}
/**
 * Provides access to Cantabile's binding points.
 *
 * Access this object via the {@linkcode Cantabile#bindings} property.
 *
 */
export class Bindings extends EndPoint {
    /**
     * Retrieves a list of available binding points
     *
     * If Cantabile is running on your local machine you can view this list
     * directly at <http://localhost:35007/api/bindings/availableBindingPoints>
     *
     * @example
     *
     * console.log(await C.bindings.getAvailableBindingPoints());
     *
     * @method getAvailableBindingPoints
     * @returns {Promise<BindingPointEntry[]>} A promise to return an array of {@linkcode BindingPointEntry} objects
     */
    getAvailableBindingPoints(): Promise<BindingPointEntry[]>;
    /**
     * Retrieves additional information about a specific binding point
     *
     * @example
     *
     * console.log(await C.bindings.getBindingPointInfo("setList", "loadSongByProgram", false, {}, {}));
     *
     * @method getBindingPointInfo
     * @param {BindingPoint} bindingPoint the binding point to be queried
     * @param {Boolean} source whether to return information about the source or target version of the binding point
     * @returns {Promise<BindingPointInfo>} A promise to return a {@linkcode BindingPointInfo} object
     */
    getBindingPointInfo(bindingPoint: BindingPoint, source: boolean): Promise<BindingPointInfo>;
    /**
     * Invokes a target binding point
     *
     * If Cantabile is running on your local machine a full list of available binding
     * points is [available here](http://localhost:35007/api/bindings/availableBindingPoints)
     *
     * @example
     *
     * // Set the master output level gain
     * C.bindings.invoke({
     *     bindableId: "masterLevels",
     *     bindingPointId: "outputGain"
     * }, 0.5);
     *
     * @example
     *
     * // Suspend the 2nd plugin in the song
     * C.bindings.invoke({
     *     bindableId: "indexedPlugin",
     *     bindableParams: {
     *         rackIndex: 0, 			// 0 = song, 1 = first rack, 2 = second etc...
     *         pluginIndex: 1, 		// 1 = second plugin (zero based)
     *     }
     *     bindingPointId: "suspend"
     * }, true);
     *
     *
     * @example
     *
     * // Sending a MIDI Controller Event
     * C.bindings.invoke({
     *     bindableId: "midiPorts",
     *     bindingPointId: "out.Main Keyboard",
     *     bindingPointParams: {
     *         kind: "Controller",
     *         controller: 10,
     *         channel: 0
     *     }
     * }, 65);
     *
     * @example
     *
     * // Sending MIDI Data directly
     * C.bindings.invoke({
     *    bindiableId: "midiPorts",
     *    bindingPointId: "out.Main Keyboard"
     * }, [ 0xb0, 23, 99 ]);
     *
     * @example
     *
     * // Sending MIDI Sysex Data directly
     * C.bindings.invoke({
     *     bindiableId: "midiPorts",
     *     bindingPointId: "out.Main Keyboard"
     * }, [ 0xF7, 0x00, 0x00, 0x00, 0xF0 ]);
     *
     * @method invoke
     * @param {BindingPoint} bindingPoint The binding point to invoke
     * @param {Object} value The value to pass to the binding point
     * @returns {Promise<void>} A promise that resolves once the target binding point has been invoked
     */
    invoke(bindingPoint: BindingPoint, value: Object): Promise<void>;
    /**
     * Queries a source binding point for it's current value.
     *
     * @example
     *
     * console.log("Current Output Gain:", await C.bindings.query({
     *     bindableId: "masterLevels",
     *     bindingPointId: "outputGain"
     * }));
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
     * // Using a callback function:
     * C.bindings.watch({
     *     bindableId: "masterLevels",
     *     bindingPointId: "outputGain",
     * }, (value) => console.log("Master output gain changed to:", value));
     *
     * @example
     *
     * // Using the BindingWatcher class and events:
     * let watcher = C.bindings.watch({
     *     bindableId: "masterLevels",
     *     bindingPointId: "outputGain",
     * });
     * watcher.on('invoked', function(value) {
     *     console.log("Master output gain changed to:", value);
     * });
     *
     * /// later, stop listening
     * watcher.unwatch();
     *
     * @example
     *
     * // Watching for a MIDI event:
     * C.bindings.watch({
     *     bindableId: "midiPorts",
     *     bindingPointId: "in.Onscreen Keyboard",
     *     bindingPointParams: {
     *         channel: 0,
     *         kind: "ProgramChange",
     *         controller: -1,
     * }, (value) => console.log("Program Change: ", value));
     *
     * @example
     *
     * // Watching for a keystroke:
     * C.bindings.watch({
     *     bindableId: "pckeyboard",
     *     bindingPointId: "keyPress",
     *     bindingPointParams:  {
     *         key: "Ctrl+Alt+M"
     *     },
     * }, () => console.log("Key press!"));
     *
     *
     * @method watch
     * @param {BindingPoint} bindingPoint The binding point to watch
     * @param {BindingWatcherCallback} [callback] Optional callback function to be called when the source binding triggers
     * @returns {BindingWatcher}
     */
    watch(bindingPoint: BindingPoint, callback?: BindingWatcherCallback): BindingWatcher;
    /**
     * Prepares a target binding point for multiple invocations
     *
     * @method prepare
     * @param {BindingPoint} bindingPoint The binding point to invoke
     * @returns {PreparedBindingPoint}
     */
    prepare(bindingPoint: BindingPoint): PreparedBindingPoint;
}
/**
 * Fired when any of the application properties change
 *
 * @event Application#changed
 */
/**
 * Fired when the application object has initially connected
 *
 * @event Application#connected
 */
/**
 * Fired when the application's busy state changes
 *
 * @event Application#busyChanged
 * @property {boolean} busy True if the app is currently busy
 */
/**
 * Interface to the application object
 *
 * Access this object via the {@linkcode Cantabile#application} property.
 *
 * @fires Application#changed
 * @fires Application#connected
 * @fires Application#busyChanged
 */
export class Application extends EndPoint {
    /**
     * The application's company name
     * @property companyName
     * @type {String}
     */
    get companyName(): string;
    /**
     * The application name
     * @property name
     * @type {String}
     */
    get name(): string;
    /**
     * The application version string
     * @property version
     * @type {String}
     */
    get version(): string;
    /**
     * The application edition string
     * @property edition
     * @type {String}
     */
    get edition(): string;
    /**
     * The application's copyright message
     * @property copyright
     * @type {String}
     */
    get copyright(): string;
    /**
     * The application's build number
     * @property build
     * @type {Number}
     */
    get build(): number;
    /**
     * An array of {@linkcode ColorEntry} items for the color index table
     * @property colors
     * @type {ColorEntry[]}
     */
    get colors(): ColorEntry[];
    /**
    * The application's busy status
    * @property busy
    * @type {Boolean}
    */
    get busy(): boolean;
    /**
     * The base program number (0 or 1)
     * @property baseProgramNumber
     * @type {Number}
     */
    get baseProgramNumber(): number;
    /**
     * The preferred banked program display format - "SeparateBanks","CombinedBanks","Plain" or "ZeroPadded"
     * @property bankedProgramNumberFormat
     * @type {String}
     */
    get bankedProgramNumberFormat(): string;
}
import EventEmitter from "events";

}

//# sourceMappingURL=types.d.ts.map
