/**
 * Provides access to information about the currently active set of key ranges
 *
 * Access this object via the {{#crossLink "Cantabile/keyRanges:property"}}{{/crossLink}} property.
 *
 * @class KeyRanges
 * @extends EndPoint
 */
export class KeyRanges extends EndPoint {
    constructor(owner: any);
    /**
     * An array of {{#crossLink "KeyRange"}}{{/crossLink}} items
     * @property items
     * @type {KeyRange[]}
     */
    get items(): KeyRange[];
    _onEvent_keyRangesChanged(data: any): void;
}
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=KeyRanges.d.ts.map