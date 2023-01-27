import teamspeak from "../teamspeak";
import btoa from 'btoa';
import config from '../config';
import db from '../database';
import synchronizeUser from "./synchronizeUser";
import discord from '../discord';

export default async function(event) {
    return /** @type {Promise<void>} */(new Promise<void>(async (resolve, reject) => {
        var tsid = event.client.propcache.clientUniqueIdentifier;
        var discordID = await db.getDiscodIDByTeamspeakID(tsid);
        if (discordID) {
            var discordMember = discord.client.guilds.cache.get(config.discord.guild)?.members.cache.get(discordID)
            if (discordMember) {
                synchronizeUser(discordMember, true)
            }
        } else {
            await teamspeak.sendMessageToClient(event.client, 'Hello! You seem to be new here. Please connect your discord account by logging in with the link below.')
            await teamspeak.sendMessageToClient(event.client, `${config.web.baseUrl}/login?tsid=${btoa(tsid)}`)
        }
        resolve();
    }))
}