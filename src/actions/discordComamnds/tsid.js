const db = require("../../database");
const synchroniseUser = require("../synchronizeUser");
const ts = require("../../teamspeak");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

class TSIDCommand {
  constructor() {
    this.public = true;
    this.data = new SlashCommandBuilder()
      .setName("tsid")
      .setDescription("Registers a users teamspeak ID manually.")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addMentionableOption((option) =>
        option
          .setName("user")
          .setDescription("The user to update teamspeak id of")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("tsid")
          .setDescription("The id of the teamspeak user")
          .setRequired(true)
      );
  }

  async execute(interaction) {
    const member = interaction.options.getMentionable("user");

    const tsid = interaction.options.getString("tsid");
    // TOOD: FIX INVALID CLIENT ERROR
    let client;
    try {
      client = await ts.client.clientGetDbidFromUid(tsid);
    } catch {}

    if (client) {
      await db.addTeamspeakID(member.user.id, tsid);
      await synchroniseUser(member);
      interaction.reply({
        content: `Teamspeak ID of ${member.user.username} updated!`,
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content:
          "Sorry I can't find that ID in teamspeak, please make sure you have connected to the server before and that you have used the ID for the correct identity. If you need help contact a member of high command.",
        ephemeral: true,
      });
    }
  }

  //     async execute(message, commandArgs) {
  //         return new Promise(async (resolve, reject) => {
  //             if (!commandArgs[1] || commandArgs[1] === '?') {
  //                 message.channel.send(
  //                     `To get your Teamspeak ID:
  // \`\`\`Open Teamspeak, press ctrl+i
  // In the window that appears choose the identiy you use to connect to our teamspeak server (usually Default)
  // Then at the bottom of that window click Go Advanced
  // Copy your Unique ID (it will look something like DhxP31Z+Kl2d4HIhto3mv9lpY3Q).\`\`\``)
  //                     return;
  //             }
  //             let tsID = args[1];
  //             let client = await ts.client.clientGetDbidFromUid(tsID)
  //             if (client) {
  //                 await db.addTeamspeakID(message.member.id, tsID)
  //                 await synchroniseUser(message.member, tsID)
  //                 message.channel.send("Thanks! I've updated your teamspeak identity and synchronized your roles!");
  //             } else {
  //                 message.channel.send("Sorry I can't find that ID in teamspeak, please make sure you have connected to the server before and that you have used the ID for the correct identity. If you need help contact a member of high command.")
  //             }
  //             resolve();
  //         });
  //     }
}

module.exports = new TSIDCommand();
