import db from "../../database.js";
import ts from "../../teamspeak.js";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

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
      )
      .addStringOption((option) =>
        option
          .setName("ts-group")
          .setDescription("The teamspeak group to be synchronized")
          .setRequired(true)
      );
  }
  async execute(interaction) {
    const role = interaction.options.getMentionable("role");
    const tsGroup = interaction.options.getString("ts-group");

    if (!(await ts.getGroupByName(tsGroup))) {
      interaction.reply({
        content: "Sorry I can't find that group in teamspeak!",
        ephemeral: true,
      });
      return;
    }

    let synced = await db.getSynchronizedRoles();
    if (synced === undefined) {
      synced = [];
    }

    synced.push(role.name);
    await db.addSynchronizedRoles(role.name, tsGroup);

    synced = await db.getSynchronizedRoles();
    let syncedString = "Syncing: ";
    synced.forEach((r, index) => {
      syncedString += r.discord + " -> " + r.teamspeak;
      if (index < synced.length - 1) syncedString += ", ";
    });
    interaction.reply({ content: syncedString, ephemeral: true });
  }
}

export default new SyncRoleCommand();
