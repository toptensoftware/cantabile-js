import { EventEmitter } from 'events';

/**
 * Identifies the kind of set list iteem
 */
export type SetListItemKind = 'song' | 'break';

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
 * describes a binding point entry as returned from {{#crossLink "Bindings/availableBindingPoints:method"}}{{/crosslink}}
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
export type BindingPointKind = 'Command' | 'Switch' | 'Value' | 'Object';

/**
 * Identifies the value format of a binding point value
 */
export type BindingPointValueFormat = 'None' | 'Float' | 'Integer' | 'Index' | 'ProgramNumber' | 'BankedProgramNumber' | 'BankedProgramMask' | 'GainLevel' | 'PitchBend';


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
export type ShowNoteTextAlignment = 'left' | 'center' | 'right';

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
    type: string;

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
export type TransportState = "playing" | "paused" | "stopped";

/** Transport loop modes */
export type TransportLoopMode = "auto" | "break" |"loopOnce" | "loop";

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
