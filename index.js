import web from "./src/express.js";
import ts from "./src/teamspeak.js";
import db from "./src/database.js";
import discord from "./src/discord.js";
import _ from "lodash";
import teamspeakClientConnected from "./src/actions/teamspeakClientConnected.js";
import synchroniseUser from "./src/actions/synchronizeUser.js";

// Initialize Connections to Servers
async function initialize() {
  await ts.connect();
  await discord.connect();
  await db.initializeDatabase();

  ts.client.on("clientconnect", async (e) => {
    await teamspeakClientConnected(e);
  });

  discord.client.on("guildMemberUpdate", (member) => {
    console.log("Guild Member Update");
    synchroniseUser(member.guild.members.cache.get(member.id));
  });
}

initialize();
