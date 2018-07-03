/**
 * An anonymous type representing a complex MIDI controller event.  
 * 
 * MidiController events can be passed to anywhere that expects MIDI Data (eg: a target MIDI binding point), or can be 
 * used as a condition on a MIDI source binding point.
 *
 * @class MidiControllerEvent
 */

/** 
 * The zero based MIDI channel number of the event (0-15)
 * @property channel
 * @type {Number}
 */

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
 * 
 * @property kind
 * @type {String}
 */

/** 
 * The associated controller number for any of the controller event kinds, or the program
 * number for program change event kinds.  
 * 
 * When used as a source binding condition, this property can be set to -1 for program change
 * events to be triggered on any program change.
 * 
 * @property controller
 * @type {Number}
 */

/**
 * Value 
 * 
 * The value property is only used when sending MIDI data and is ignored if specified when
 * setting a source binding condition.
 * 
 * @property value
 * @type {Number}
 */