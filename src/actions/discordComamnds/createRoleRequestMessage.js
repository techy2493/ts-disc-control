const db = require("../../database");
const synchroniseUser = require("../synchronizeUser");
const ts = require("../../teamspeak");
const {
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

class CreateRoleRequestMessageCommand {
  constructor() {
    this.public = false;
    this.data = new SlashCommandBuilder()
      .setName("createrolerequestmessage")
      .setDescription("Create a message for role requests")
      .addMentionableOption((option) =>
        option.setName("role1").setDescription("Selectable Role")
      )
      .addMentionableOption((option) =>
        option.setName("role2").setDescription("Selectable Role")
      )
      .addMentionableOption((option) =>
        option.setName("role3").setDescription("Selectable Role")
      )
      .addMentionableOption((option) =>
        option.setName("role4").setDescription("Selectable Role")
      )
      .addMentionableOption((option) =>
        option.setName("role5").setDescription("Selectable Role")
      )
      .addMentionableOption((option) =>
        option.setName("role6").setDescription("Selectable Role")
      )
      .addMentionableOption((option) =>
        option.setName("role7").setDescription("Selectable Role")
      );
  }

  // TODO: Implement a rate limit

  async execute(interaction) {
    const roles = interaction.options._hoistedOptions;

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(roles[0].role.name)
        .setLabel(roles[0].role.name)
        .setStyle(ButtonStyle.Primary)
    );
    interaction.reply({ content: "I Think You Sould", components: [row1] });

    // let member;

    // if (interaction.options.getMentionable('user'))
    //     if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
    //         member = interaction.options.getMentionable('user');
    //     else
    //         interaction.reply("Sorry you don't have have permission to sync another user's roles")
    // else
    //     member = interaction.member;

    // const tsid = await db.getTeamspeakIDByDiscordId(member.user.id)

    // let client;
    // try {
    //     client = await ts.client.clientGetDbidFromUid(tsid)
    // } catch (ex) { console.log(ex) }

    // if (client) {
    //     await synchroniseUser(interaction.member)
    //     interaction.reply(`Roles of ${member.user.username} synchronized!`)
    // } else {
    //     interaction.reply("Sorry I can't find that ID in teamspeak, please make sure you have connected to the server before and that you have used the ID for the correct identity. If you need help contact a member of high command.")
    // }
  }
}

module.exports = new CreateRoleRequestMessageCommand();
