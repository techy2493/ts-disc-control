const db = require('../../database')
const synchroniseUser = require('../synchronizeUser')
const ts = require('../../teamspeak');

class TSIDCommand {

    constructor() {
        this.command = '!tsid'
        this.permissions = []
    }
    async execute(message, commandArgs) {
        return new Promise(async (resolve, reject) => {
            if (!commandArgs[1] || commandArgs[1] === '?') {
                message.channel.send(
                    `To get your Teamspeak ID: 
\`\`\`Open Teamspeak, press ctrl+i
In the window that appears choose the identiy you use to connect to our teamspeak server (usually Default)
Then at the bottom of that window click Go Advanced
Copy your Unique ID (it will look something like DhxP31Z+Kl2d4HIhto3mv9lpY3Q).\`\`\``)
                    return;
            } 
            let tsID = args[1];
            let client = await ts.client.clientGetDbidFromUid(tsID)
            if (client) {
                await db.updateTeamspeakID(message.member.id, tsID)
                await synchroniseUser(message.member, tsID)
                message.channel.send("Thanks! I've updated your teamspeak identity and synchronized your roles!");
            } else {
                message.channel.send("Sorry I can't find that ID in teamspeak, please make sure you have connected to the server before and that you have used the ID for the correct identity. If you need help contact a member of high command.")
            }
            resolve();
        });
    }
}

module.exports = new TSIDCommand();