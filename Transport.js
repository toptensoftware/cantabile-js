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
        this.emit('stateChanged');
        this.emit('loopStateChanged');
        this.emit('timeSignatureChanged');
        this.emit('tempoChanged');
    }

	_onClose()
	{
        this.emit('stateChanged');
        this.emit('loopStateChanged');
        this.emit('timeSignatureChanged');
        this.emit('tempoChanged');
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

	/**
	 * Gets the current time signture numerator
	 * @property timeSignatureNum
	 * @type {Number}
	 */
    get timeSignatureNum() { return this._data ? this._data.timeSigNum : 0 }

	/**
	 * Gets the current time signture denominator
	 * @property timeSignatureDen
	 * @type {Number}
	 */
    get timeSignatureDen() { return this._data ? this._data.timeSigDen : 0 }

	/**
	 * Gets the current time signture as a string (eg: "3/4")
	 * @property timeSignature
	 * @type {String}
	 */
    get timeSignature() { return this._data ? this._data.timeSigNum + "/" + this._data.timeSigDen : "-" }

	/**
	 * Gets the current tempo
	 * @property tempo
	 * @type {Number}
	 */
    get tempo() { return this._data ? this._data.tempo : 0 }

	/**
	 * Gets the current loopMode
	 * @property loopMode
	 * @type {String}
	 */
    get loopMode() { return this._data ? this._data.loopMode : "none" }

	/**
	 * Sets the current loopMode
	 * @property loopMode
	 * @type {String}
	 */
    set loopMode(value)
    {
        if (this.loopMode == value)
            return;

        this.post("/setLoopMode", { loopMode: value });
    }

	/**
	 * Gets the current loopCount
	 * @property loopCount
	 * @type {Number}
	 */
    get loopCount() { return this._data ? this._data.loopCount : -1 }

	/**
	 * Gets the current loopIteration
	 * @property loopIteration
	 * @type {Number}
	 */
    get loopIteration() { return this._data ? this._data.loopIteration : -1 }

    _onEvent_stateChanged(data)
	{
		/**
		 * Fired when the current transport state has changed
		 *
		 * @event stateChanged
		 */

        this._data.state = data.state;
		this.emit('stateChanged');
    }

    _onEvent_timeSigChanged(data)
    {
		/**
		 * Fired when the current time signature has changed
		 *
		 * @event timeSignatureChanged
		 */

        this._data.timeSigNum = data.timeSigNum;
        this._data.timeSigDen = data.timeSigDen;
        this.emit('timeSignatureChanged');
    }
    
    _onEvent_tempoChanged(data)
    {
        /**
		 * Fired when the current tempo has changed
		 *
		 * @event tempoChanged
		 */

        this._data.tempo  = data.tempo;
        this.emit('tempoChanged');
    }
    
    _onEvent_loopStateChanged(data)
	{
		/**
		 * Fired when the current loop state, iteration or count has changed
		 *
		 * @event loopStateChanged
		 */

        Object.assign(this._data, data);
		this.emit('loopStateChanged');
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
	 * @method pause
	 */
    pause()
    {
        if (this.state != "paused")
            this.post("/pause", {});
    }

	/**
	 * Stops the master transport
	 * @method stop
	 */
    stop()
    {
        if (this.state != "stopped")
            this.post("/stop", {});
    }

	/**
	 * Stops the master transport
	 * @method stop
	 */
    cycleLoopMode()
    {
        switch (this.loopMode)
        {
            case "auto":
                this.loopMode = "break";
                break;

            case "break":
                this.loopMode = "loopOnce";
                break;

            case "loopOnce":
                this.loopMode = "loop";
                break;

            case "loop":
                this.loopMode = "auto";
                break;
        }
    }

}


module.exports = Transport;