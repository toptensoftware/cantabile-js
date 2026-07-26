import { EndPoint } from './EndPoint.js';

/**
 * Fired when the current transport state has changed
 *
 * @event Transport#stateChanged
 */
/**
 * Fired when the current time signature has changed
 *
 * @event Transport#timeSignatureChanged
 */
/**
 * Fired when the current tempo has changed
 *
 * @event Transport#tempoChanged
 */
/**
 * Fired when the current loop mode, loop iteration or loop count has changed
 *
 * @event Transport#loopStateChanged
 */

/**
 * Interface to the master transport
 * 
 * Access this object via the {@linkcode Cantabile#transport} property.
 *
 * @fires Transport#stateChanged
 * @fires Transport#timeSignatureChanged
 * @fires Transport#tempoChanged
 * @fires Transport#loopStateChanged
 */
export class Transport extends EndPoint
{
    /** @internal */
	constructor(owner)
	{
		super(owner, "/api/transport");
	}

	_onConnected()
	{
        this.emit('stateChanged');
        this.emit('loopStateChanged');
        this.emit('timeSignatureChanged');
        this.emit('tempoChanged');
    }

	_onDisconnected()
	{
        this.emit('stateChanged');
        this.emit('loopStateChanged');
        this.emit('timeSignatureChanged');
        this.emit('tempoChanged');
	}

	/**
	 * The current transport state.  
	 * @property state
	 * @type {TransportState}
	 */
    get state() { return this.data ? this.data.state : "stopped"; }
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
	 * Gets the current time signature numerator
	 * @property timeSignatureNum
	 * @type {Number}
	 */
    get timeSignatureNum() { return this.data ? this.data.timeSigNum : 0 }

	/**
	 * Gets the current time signature denominator
	 * @property timeSignatureDen
	 * @type {Number}
	 */
    get timeSignatureDen() { return this.data ? this.data.timeSigDen : 0 }

	/**
	 * Gets the current time signature as a string (eg: "3/4")
	 * @property timeSignature
	 * @type {String}
	 */
    get timeSignature() { return this.data ? this.data.timeSigNum + "/" + this.data.timeSigDen : "-" }

	/**
	 * Gets the current tempo
	 * @property tempo
	 * @type {Number}
	 */
    get tempo() { return this.data ? this.data.tempo : 0 }

	/**
	 * Gets or sets the current loopMode 
	 * @property loopMode
	 * @type {TransportLoopMode}
	 */
    get loopMode() { return this.data ? this.data.loopMode : "none" }

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
    get loopCount() { return this.data ? this.data.loopCount : -1 }

	/**
	 * Gets the current loopIteration
	 * @property loopIteration
	 * @type {Number}
	 */
    get loopIteration() { return this.data ? this.data.loopIteration : -1 }

    _onEvent_stateChanged(data)
	{
        this.data.state = data.state;
		this.emit('stateChanged');
    }

    _onEvent_timeSigChanged(data)
    {
        this.data.timeSigNum = data.timeSigNum;
        this.data.timeSigDen = data.timeSigDen;
        this.emit('timeSignatureChanged');
    }
    
    _onEvent_tempoChanged(data)
    {
        this.data.tempo  = data.tempo;
        this.emit('tempoChanged');
    }
    
    _onEvent_loopStateChanged(data)
	{
        Object.assign(this.data, data);
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
	 * @method togglePause
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
	 * Cycles between the various loop modes
	 * @method cycleLoopMode
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
