const commands = require('./discordComamnds')
const checkDiscordPermission = require('./checkDiscordPermission');
const splitArgs = require('../helpers/splitArgs')

module.exports = async function processDiscordModule(message) {
    return new Promise(async (resolve, reject) => {
        var args = splitArgs(message.content);

        commands.every(async (command) => {
            console.log(command.command)
            if (command.command === args[0]) {
                if (checkDiscordPermission(message.user, command.permissions)) {
                    try {
                        await command.execute(message, args);
                    } catch (ex) {
                        console.error("Error processing command", ex)
                    }
                    
                } else {
                    message.channel.send("You do not have permission to do that!");
                }
                return false;
            }
        })

        resolve();
    })
}
