import teamspeak from "../teamspeak.js";
import btoa from "btoa";
import config from "../config.js";
import db from "../database.js";
import synchronizeUser from "./synchronizeUser.js";
import discord from "../discord.js";

function contactUser(tsid, message) {
  config.teamspeak.usePokes
    ? teamspeak.sendPokeToClient(tsid, message)
    : teamspeak.sendMessageToClient(tsid, message);
}

export default async function (event) {
  return new Promise(async (resolve, reject) => {
    var tsid = event.client.propcache.clientUniqueIdentifier;
    var discordID = await db.getDiscodIDByTeamspeakID(tsid);
    if (discordID) {
      var discordMember = discord.client.guilds.cache
        .get(config.discord.guild)
        .members.cache.get(discordID);
      if (discordMember) {
        synchronizeUser(discordMember, tsid, true);
      }
    } else {
      if (!config.discord.useOAuth) {
        await contactUser(
          event.client,
          config.teamspeak.welcomeMessageText
            ? config.teamspeak.welcomeMessageText
            : "Hello! You seem to be new here. Please connect your discord account by logging in with the link below."
        );
        await contactUser(
          event.client,
          `Please use the /register command in the ${config.discord.commandChannelName} channel in discord with the following teamspeak-id`
        );
        await contactUser(event.client, `${tsid}`);
      } else {
        await contactUser(
          event.client,
          config.teamspeak.welcomeMessageText
            ? config.teamspeak.welcomeMessageText
            : "Hello! You seem to be new here. Please connect your discord account by logging in with the link below."
        );
        await contactUser(
          event.client,
          `${
            config.web.clientBaseUrl
              ? config.web.clientBaseUrl
              : config.web.baseUrl
          }${config.web.loginUrl}?tsid=${btoa(tsid)}`
        );
      }
    }
    resolve();
  });
}
