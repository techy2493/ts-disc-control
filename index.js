const web = require('./src/express')
const ts = require("./src/teamspeak");
const db = require("./src/database");
const discord = require("./src/discord");
const _ = require('lodash');
const teamspeakClientConnected = require('./src/actions/teamspeakClientConnected');
const synchroniseUser = require('./src/actions/synchronizeUser');


// Initialize Connections to Servers
async function initialize() {
    await ts.connect();
    await discord.connect();
    await db.initializeDatabase();
        
    ts.client.on("clientconnect", async (e) => {
        await teamspeakClientConnected(e)
    })

    prepareDiscordListeners();
}

function prepareDiscordListeners() {
    
    discord.client.on('guildMemberUpdate', member => {
        synchroniseUser(member.guild.members.cache.get(member.id))
    })
}

initialize();