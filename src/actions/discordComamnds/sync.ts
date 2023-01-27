const db = require('../../database')
const synchroniseUser = require('../synchronizeUser')
const ts = require('../../teamspeak');
import { SlashCommandBuilder, PermissionsBitField, CommandInteraction } from "discord.js";
import SlashCommand from "./slashCommand";

class SyncCommand implements SlashCommand {
    isPublic: boolean;
    data: SlashCommandBuilder;
    constructor() {
        this.isPublic = true;
        this.data = new SlashCommandBuilder()
            .setName("sync")
            .setDescription("Forces the user to resynchronize.")
            .addUserOption(option => 
                option.setName("user")
                .setDescription("The user to be synchronized")
            )
    }

    // TODO: Implement a rate limit

    async execute(interaction: CommandInteraction) {
        let member;

        if (interaction.options.getUser('user'))
        if (interaction.member?.permissions)
            if (interaction.member?.permissions.has(PermissionsBitField.Flags.ManageRoles))
                member = interaction.options.getMentionable('user');
            else 
                interaction.reply("Sorry you don't have have permission to sync another user's roles")
        else 
            member = interaction.member;
        
        const tsid = await db.getTeamspeakIDByDiscordId(member.user.id)
        
        let client;
        try {
            client = await ts.client.clientGetDbidFromUid(tsid)
        } catch (ex) { console.log(ex) }
        
        if (client) {
            await synchroniseUser(interaction.member, tsid)
            interaction.reply(`Roles of ${member.user.username} synchronized!`)
        } else {
            interaction.reply("Sorry I can't find that ID in teamspeak, please make sure you have connected to the server before and that you have used the ID for the correct identity. If you need help contact a member of high command.")
        }
        
    }
}

module.exports = new SyncCommand();