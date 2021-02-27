const teamspeak = require("../teamspeak");
const btoa = require('btoa');
const config = require('../config')
const db = require('../database');
const synchronizeUser = require("./synchronizeUser");
const discord = require('../discord')

module.exports = async function(event) {
    return new Promise(async (resolve, reject) => {
        var tsid = event.client.propcache.clientUniqueIdentifier;
        var discordID = await db.getDiscodIDByTeamspeakID(tsid);
        if (discordID) {
            var discordMember = discord.client.guilds.cache.get(config.discord.guild).members.cache.get(discordID)
            if (discordMember) {
                synchronizeUser(discordMember, tsid, true)
            }
        } else {
            await teamspeak.sendMessageToClient(event.client, 'Hello! You seem to be new here. Please connect your discord account by logging in with the link below.')
            await teamspeak.sendMessageToClient(event.client, `${config.web.baseUrl}/login?tsid=${btoa(tsid)}`)
        }
        resolve();
    })
}