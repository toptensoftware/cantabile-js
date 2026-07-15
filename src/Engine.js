import { EndPoint } from './EndPoint.js';
import 'isomorphic-fetch';

/**
 * Provides access to Cantabile's engine object for start/stop control
 *
 * Access this object via the {@linkcode Cantabile#engine} property.
 *
 * @class Engine
 */
export class Engine
{
	/** @internal */
    constructor(owner)
    {
		this.#owner = owner;
    }

	#owner;

	/**
	 * Returns a promise to provide the started state of Cantabile's audio engine.
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method isStarted
	 * @returns {Promise<Boolean>}
	 */
	async isStarted()
	{
		let f = await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/")).then(r => r.json());
		return f.isStarted;
	}

	/**
	 * Starts Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method start
	 * @returns {Promise<void>}
	 */
	async start()
	{
		await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/start"), { method: "POST" });
	}

	/**
	 * Stops Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method stop
	 * @returns {Promise<void>}
	 */
	async stop()
	{
		await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/stop"), { method: "POST" });
	}

	/**
	 * Restarts Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method restart
	 * @returns {Promise<void>}
	 */
	 async restart()
	 {
		 await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/restart"), { method: "POST" });
	 }

 	/**
	 * Toggles the audio engine between started and stopped
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method startStop
	 * @returns {Promise<void>}
	 */
	  async startStop()
	  {
		  await fetch(EndPoint.joinPath(this.#owner.hostUrl, "api/engine/startStop"), { method: "POST" });
	  }

  }

