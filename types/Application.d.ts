/**
 * Interface to the application object
 *
 * Access this object via the {{#crossLink "Cantabile/application:property"}}{{/crossLink}} property.
 *
 * @class Application
 * @extends EndPoint
 */
export class Application extends EndPoint {
    constructor(owner: any);
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
     * An array of {{#crossLink "ColorEntry"}}{{/crossLink}} items for the color index table
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
    _onEvent_busyChanged(data: any): void;
}
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=Application.d.ts.map