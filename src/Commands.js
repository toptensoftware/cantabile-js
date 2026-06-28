import { EndPoint } from './EndPoint.js';


/**
 * Provides access to Cantabile's UI commands
 * 
 * Access this object via the {{#crossLink "Cantabile/commands:property"}}{{/crossLink}} property.
 *
 * @class Commands
 * @extends EndPoint
 */
export class Commands extends EndPoint
{
    constructor(owner)
    {
        super(owner, "/api/commands");
    }

    _onConnected()
    {
    }

    _onDisconnected()
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
     *     let C = new Cantabile();
     *     console.log(await C.commands.availableCommands());
     * 
     * @method availableCommands
     * @returns {Promise<CommandInfo[]>} A promise to return an array of {{#crossLink "CommandInfo"}}{{/crossLink}} objects
     */
    async availableCommands()
    {
        await this.owner.waitForConnected();
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
     * @returns {Promise} A promise that resolves once the target command has been invoked
     */
    async invoke(id)
    {
        return (await this.request("POST", "/invoke", {
            id: id,
        }));
    }
}

