'use strict';

const EndPoint = require('./EndPoint');

/**
 * Interface to the master transport
 * 
 * Access this object via the {{#crossLink "Cantabile/transport:property"}}{{/crossLink}} property.
 *
 * @class Transport
 * @extends EndPoint
 */
class Transport extends EndPoint
{
	constructor(owner)
	{
		super(owner, "/api/transport");
	}

	_onOpen()
	{
		/**
		 * Fired when the current transport state has changed
		 *
		 * @event stateChanged
		 */
        this.emit('stateChanged');
	}

	/**
	 * Gets or sets the current transport state.  Supported values include "playing", "paused" or "stopped"
	 * @property state
	 * @type {String}
	 */
    get state() { return this._data ? this._data.state : "stopped"; }
    set state(value)
    {
        if (this.state == value)
            return;
        switch (value)
        {
            case "playing": this.play(); break;
            case "paused": this.pause(); break;
            case "stopped": this.stop(); break;
        }
    }


	_onEvent_stateChanged(data)
	{
		/**
		 * Fired when the current transport state changes
		 *
		 * @event stateChanged
		 */

         this._data.state = data.state;
		this.emit('stateChanged');
    }
    
	/**
	 * Starts transport playback
	 * @method play
	 */
    play()
    {
        if (this.state != "playing")
            this.post("/play", {});
    }

	/**
	 * Toggles between play and pause states
	 * @method togglePlayPause
	 */
    togglePlayPause()
    {
        if (this.state == "playing")
            this.pause();
        else
            this.play();
    }

	/**
	 * Toggles pause and play states (unless stopped)
	 * @method togglePlayPause
	 */
    togglePause()
    {
        if (this.state == "paused")
            this.play();
        else if (this.state == "playing")
            this.pause();
    }

    /**
	 * Toggles play and stopped states
	 * @method togglePlay
	 */
    togglePlay()
    {
        if (this.state == "stopped")
            this.play();
        else
            this.stop();
    }

	/**
	 * Toggles between play and stop states
	 * @method togglePlayStop
	 */
    togglePlayStop()
    {
        if (this.state != "playing")
            this.play();
        else
            this.stop();
    }

	/**
	 * Pauses the master transport
	 * @method play
	 */
    pause()
    {
        if (this.state != "paused")
            this.post("/pause", {});
    }

	/**
	 * Stops the master transport
	 * @method play
	 */
    stop()
    {
        if (this.state != "stopped")
            this.post("/stop", {});
    }

}


module.exports = Transport;