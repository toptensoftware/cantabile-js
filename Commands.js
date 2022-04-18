'use strict';

const debug = require('debug')('Cantabile');
const EndPoint = require('./EndPoint');


/**
 * Provides access to Cantabile's UI commands
 * 
 * Access this object via the {{#crossLink "Cantabile/commands:property"}}{{/crossLink}} property.
 *
 * @class Commands
 * @extends EndPoint
 */
class Commands extends EndPoint
{
    constructor(owner)
    {
        super(owner, "/api/commands");
    }

    _onOpen()
    {
    }

    _onClose()
    {
    }


    /**
     * Retrieves a list of available commands
	 * 
	 * If Cantabile is running on your local machine you can view this list
	 * directly at <http://localhost:35007/api/commands/availableCommands>
     * 
     * @example
     * 
     *     let C = new CantabileApi();
     *     C.connect();
     *     console.log(await C.commands.availableCommands());
     * 
     * @method availableCommands
     * @return {Promise|CommandInfo[]} A promise to return an array of CommandInfo
     */
    async availableCommands()
    {
        await this.owner.untilConnected();
        return (await this.request("GET", "/availableCommands")).data;
    }

    /**
     * Invokes a command
     * 
     * @example
     * 
     * Show the file open dialog
	 * 
     *     C.commands.invoke("file.open");
     * 
     * @param {String} id The id of the command to invoke
     * @method invoke
     * @return {Promise} A promise that resolves once the target command has been invoked
     */
    async invoke(id)
    {
        return (await this.request("POST", "/invoke", {
            id: id,
        }));
    }
}



module.exports = Commands;