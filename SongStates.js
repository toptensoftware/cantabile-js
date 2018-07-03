'use strict';

const States = require('./States');

/**
 * Interface to the states of the current song
 * 
 * Access this object via the {{#crossLink "Cantabile/songStates:property"}}{{/crossLink}} property.
 *
 * @class SongStates
 * @extends States
 */
class SongStates extends States
{
	constructor(owner)
	{
		super(owner, "/api/songStates");
	}
}


module.exports = SongStates;