/**
 * Used to access the current set of show notes
 *
 * Access this object via the {{#crossLink "Cantabile/showNotes:property"}}{{/crossLink}} property.
 *
 * @class ShowNotes
 * @extends EndPoint
 */
export class ShowNotes extends EndPoint {
    /** @internal */
    constructor(owner: any);
    /**
     * An array of {{#crossLink "ShowNote"}}{{/crossLink}} items
     * @property items
     * @type {ShowNote[]}
     */
    get items(): ShowNote[];
    _onEvent_itemAdded(data: any): void;
    _onEvent_itemRemoved(data: any): void;
    _onEvent_itemMoved(data: any): void;
    _onEvent_itemChanged(data: any): void;
    _onEvent_itemsReload(data: any): void;
}
import { EndPoint } from './EndPoint.js';
//# sourceMappingURL=ShowNotes.d.ts.map