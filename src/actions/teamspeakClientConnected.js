const teamspeak = require("../teamspeak");
const btoa = require("btoa");
const config = require("../config");
const db = require("../database");
const synchronizeUser = require("./synchronizeUser");
const discord = require("../discord");

module.exports = async function (event) {
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
        await teamspeak.sendMessageToClient(
          event.client,
          config.teamspeak.welcomeMessageText
            ? config.teamspeak.welcomeMessageText
            : "Hello! You seem to be new here. Please connect your discord account by logging in with the link below."
        );
        await teamspeak.sendMessageToClient(
          event.client,
          `Please use the /register command in the ${config.discord.commandChannelName} channel in discord with the following teamspeak-id`
        );
        await teamspeak.sendMessageToClient(event.client, `${tsid}`);
      } else {
        await teamspeak.sendMessageToClient(
          event.client,
          config.teamspeak.welcomeMessageText
            ? config.teamspeak.welcomeMessageText
            : "Hello! You seem to be new here. Please connect your discord account by logging in with the link below."
        );
        await teamspeak.sendMessageToClient(
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
};
