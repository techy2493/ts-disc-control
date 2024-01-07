const db = require("../../database");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

class SyncRoleCommand {
  constructor() {
    this.public = true;
    this.data = new SlashCommandBuilder()
      .setName("syncrole")
      .setDescription("Configures a role to by synchronized.")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addMentionableOption((option) =>
        option
          .setName("role")
          .setDescription("The role to be synchronized")
          .setRequired(true)
      );
  }
  async execute(interaction) {
    const role = interaction.options.getMentionable("role");

    let synced = await db.getSynchronizedRoles();
    console.log(synced);
    if (synced === undefined) {
      synced = [];
    }

    synced.push(role.name);
    await db.addSynchronizedRoles(role.name);

    synced = await db.getSynchronizedRoles();
    console.log(synced);
    let syncedString = "Syncing: ";
    synced.forEach((r, index) => {
      syncedString += r;
      if (index < synced.length - 1) syncedString += ", ";
    });
    interaction.reply({ content: syncedString, ephemeral: true });
  }
}

module.exports = new SyncRoleCommand();
