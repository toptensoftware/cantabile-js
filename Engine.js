import EndPoint from './EndPoint';
import fetch from 'node-fetch';

/**
 * Provides access to Cantabile's engine object for start/stop control
 *
 * Access this object via the {{#crossLink "Cantabile/engine:property"}}{{/crossLink}} property.
 *
 * @class Engine
 */
class Engine
{
    constructor(owner)
    {
		this.owner = owner;
    }

	/**
	 * Returns a promise to provide the started state of Cantabile's audio engine.
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method isStarted
	 * @return {Promise|Boolean}
	 */
	 async isStarted()
	{
		let f = await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/")).then(r => r.json());
		return f.isStarted;
	}

	/**
	 * Starts Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method start
	 * @return {Promise}
	 */
	async start()
	{
		await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/start"), { method: "POST" });
	}

	/**
	 * Stops Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method stop
	 * @return {Promise}
	 */
	async stop()
	{
		await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/stop"), { method: "POST" });
	}

	/**
	 * Restarts Cantabile's audio engine
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method restart
	 * @return {Promise}
	 */
	 async restart()
	 {
		 await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/restart"), { method: "POST" });
	 }

 	/**
	 * Toggles the audio engine between started and stopped
	 *
	 * This API is only available via  AJAX, and not WebSocket
	 *
	 * @method startStop
	 * @return {Promise}
	 */
	  async startStop()
	  {
		  await fetch(EndPoint.joinPath(this.owner.hostUrl, "api/engine/startStop"), { method: "POST" });
	  }

  }



export default Engine;
