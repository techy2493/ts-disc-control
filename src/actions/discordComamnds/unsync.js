const db = require('../../database')
const unmention = require('../../helpers/unmention');

class TSIDCommand {

    constructor() {
        this.command = '!unsync'
        this.permissions = []
    }
    async execute(message, commandArgs) {
        return new Promise(async (resolve, reject) => {
            if (!commandArgs[1] || !commandArgs[1].startsWith('<@')) {
                message.channel.send("Please mention (@) the role you would like to unsync!")
                return;
            }
            
            let synced = await db.getSynchronizedRoles();
            if (synced === undefined) {
                synced = []
            }
            synced = synced.filter(r => r !== message.guild.roles.cache.get(unmention(splitArgs(message.content)[0])).name)
            await db.setSynchronizedRoles(synced);
            
            synced = await db.getSynchronizedRoles();
            let syncedString = "Syncing: "
            synced.forEach(r => syncedString = syncedString + r + ", ")
            message.channel.send(syncedString)
            resolve();
        });
    }
}

module.exports = new TSIDCommand();