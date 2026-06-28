import { EventEmitter } from 'events';

/**
 * Represents an item in a list
 */
export interface SetListItem
{
    /** The item kind - either "song" or "break" */
    readonly kind: string;

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
 * Information about an available binding point
 */
export interface BindingPointInfo
{
    /** The id of the binding point */
    id: string;

    /** The display name of the binding point */
    displayName: string;

    /**  
     * The kind of value accepted/sent by this binding point
     *   * "Command" - value is ignored, binding point is a simple "action"
     *   * "Switch" - True/false value, <0.5 = false, >= 0.5 = true
     *   * "Value" - A numeric value (floating point or integer)
     *   * "Object" - An object value (typically double, string or byte array)
     */
    kind: string;

    /** 
     * The kind of value accepted/sent by this binding point
     *   * "Float" - a floating point value
     *   * "Integer" - an integer value
     *   * "Index" - an index displayed either 0 or 1 based
     *   * "ProgramNumber" - a program number displayed either 0 or 1 based
     *   * "BankedProgramNumber" - a banked program number displayed in one of several banked program number formats
     *   * "GainLevel" - a gain level displayed by converting from scalar value to decibels
     *   * "PitchBend" - a pitch bend value from 0 to 16384 but displayed as -8192 to 8191
     * This property is only present if 'kind' is "Value"
     */
    valueFormat: string;

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
 * Describes a show note item
 */
export interface ShowNote
{
    /** The item kind - either "song" or "break" */
    kind: string;

    /** The name of the song or break */
    name: string;

    /** The zero based program number of a song */
    pr: number;

    /** The color of the item (0 to 15) */
    color: number;

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

    /** Text alignment ("left", "center" or "right") */
    textAlign: string;

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


/**
 * An anonymous type representing a complex MIDI controller event.  
 * 
 * MidiController events can be passed to anywhere that expects MIDI Data (eg: a target MIDI binding point), or can be 
 * used as a condition on a MIDI source binding point.
 */
export interface MidiControllerEvent
{

    /** 
     * The zero based MIDI channel number of the event (0-15)
     */
    channel: number;

    /** 
     * The kind of MIDI event
     * 
     * * Controller		
     * * FineController
     * * ControllerButton
     * * ControllerNonEdgeButton
     * * ControllerSwitch
     * * ProgramChange	
     * * BankedProgramChange
     * * PitchBend		
     * * ChannelPressure
     * * Note
     * * NoteOff
     * * NoteSwitch
     * * RpnCoarse
     * * RpnFine
     * * NRpnCoarse
     * * NRpnFine
     * * MasterVolume
     * * MasterBalance
     * * MmcStop
     * * MmcPlay
     * * MmcDeferredPlay
     * * MmcFastForward
     * * MmcRewind
     * * MmcRecordPunchIn
     * * MmcRecordPunchOut
     * * MmcRecordReady
     * * MmcPause
     * * MmcEject
     * * MmcChase
     * * MmcReset
     * * SongSelect
     * * ClockStart
     * * ClockContinue
     * * ClockStop
     */
    kind: string;

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
