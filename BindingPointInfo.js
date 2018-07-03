/**
 * An anonymous type that describes a binding point
 *
 * @class BindingPointInfo
 */

/** 
 * The name of the binding point
 * @property name
 * @type {String}
 */

/** 
 * The display name of the binding point
 * @property name
 * @type {String}
 */

/** 
 * Indicates if this is a source or target binding point
 * @property isSource
 * @type {Boolean}
 */

/** 
 * The names of the indicies used to reference this binding point
 * 
 * @example
 * 
 * This binding point requires two indicies... the rack index and the plug index
 * 
 *      "indicies": [ "Rack Index", "Plugin Index"],
 * 
 * @property indicies
 * @type {String[]}
 */

/** 
 * The binding point kind - the type of data send/expected by this binding piont
 * 
 * * "midi"
 * * "command"
 * * "switch"
 * * "float"
 * * "gainLevel"
 * * "integer"
 * * "index"
 * * "pitchBend"
 * * "programNumber"
 * * "bankedProgramNumber"
 * * "variant"
 * * "object"
 * 
 * @property kind
 * @type {String}
 */


/** 
 * The binding point parameter kind - the kind of parameter expected by this binding point
 * 
 * * "none"
 * * "triggerNumber"
 * * "popup"
 * * "keystoke"
 * * "script"
 * 
 * @property parameterKind
 * @type {String}
 */

