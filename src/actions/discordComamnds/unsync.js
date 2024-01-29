const db = require("../../database");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

class UnSyncCommand {
  constructor() {
    this.public = true;
    this.data = new SlashCommandBuilder()
      .setName("unsync")
      .setDescription("Removes a role to by synchronized.")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addMentionableOption((option) =>
        option
          .setName("role")
          .setDescription("The role to be remvoed from synchronization")
          .setRequired(true)
      );
  }

  async execute(interaction) {
    const role = interaction.options.getMentionable("role");

    let synced = await db.getSynchronizedRoles();
    if (synced === undefined) {
      synced = [];
    }

    synced.push(role.name);
    await db.removeSynchronizedRoles(role.name);

    synced = await db.getSynchronizedRoles();
    let syncedString = "Syncing: ";
    synced.forEach((r, index) => {
      syncedString += r.discord + " -> " + r.teamspeak;
      if (index < synced.length - 1) syncedString += ", ";
    });
    interaction.reply({ content: syncedString, ephemeral: true });
  }
}

module.exports = new UnSyncCommand();
