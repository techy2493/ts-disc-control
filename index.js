import web from "./src/express.js";
import ts from "./src/teamspeak.js";
import db from "./src/database.js";
import discord from "./src/discord.js";
import _ from "lodash";
import teamspeakClientConnected from "./src/actions/teamspeakClientConnected.js";
import synchroniseUser from "./src/actions/synchronizeUser.js";
import log from "./src/log.js";

// Initialize Connections to Servers
async function initialize() {
  await ts.connect();
  await discord.connect();
  await db.initializeDatabase();

  ts.client.on("clientconnect", async (e) => {
    await teamspeakClientConnected(e);
  });

  discord.client.on("guildMemberUpdate", (member) => {
    log.info("Discord User Updated - $discordName - $discordId", {
      discordName: member.user.username,
      discordId: member.id,
    });
    r;
    synchroniseUser(member);
  });
}

initialize();
