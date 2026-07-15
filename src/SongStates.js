import { States } from './States.js';

/**
 * Interface to the states of the current song
 * 
 * Access this object via the {@linkcode Cantabile#songStates} property.
 *
 * @class SongStates
 * @extends States
 */
export class SongStates extends States
{
	/** @internal */
	constructor(owner)
	{
		super(owner, "/api/songStates");
	}
}
