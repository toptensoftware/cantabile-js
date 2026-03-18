/**
 * An anonymous type that describes a binding point
 *
 * @class BindingPointInfo4
 */

/** 
 * The id of the binding point
 * @property id
 * @type {String}
 */

/** 
 * The display name of the binding point
 * @property displayName
 * @type {String}
 */

/** 
 * The kind of value accepted/sent by this binding point
 * 
 * * "Command" - value is ignored, binding point is a simple "action"
 * * "Switch" - True/false value, <0.5 = false, >= 0.5 = true
 * * "Value" - A numeric value (floating point or integer)
 * * "Object" - An object value (typically double, string or byte array)
 * 
 * @property kind
 * @type {String}
 */



/** 
 * The kind of value accepted/sent by this binding point
 * 
 * * "Float" - a floating point value
 * * "Integer" - an integer value
 * * "Index" - an index displayed either 0 or 1 based
 * * "ProgramNumber" - a program number displayed either 0 or 1 based
 * * "BankedProgramNumber" - a banked program number displayed in one of several banked program number formats
 * * "GainLevel" - a gain level displayed by converting from scalar value to decibels
 * * "PitchBend" - a pitch bend value from 0 to 16384 but displayed as -8192 to 8191
 * 
 * This property is only present if 'kind' is "Value"
 * 
 * @property valueFormat
 * @type {String}
 */


/** 
 * The minimum value range
 * 
 * This property is only present if 'kind' is "Value"
 * 
 * @property valueMin
 * @type {Number}
 */


/** 
 * The maximum value range
 * 
 * This property is only present if 'kind' is "Value"
 * 
 * @property valueMax
 * @type {Number}
 */


/**
 * Information about the bindable object parameters supported by this binding point
 * 
 * @property bindableParams
 * @type {BindingParam[]}
 */

/**
 * Information about the binding point parameters supported by this binding point
 * 
 * @property bindingPointParams
 * @type {BindingParam[]}
 */
