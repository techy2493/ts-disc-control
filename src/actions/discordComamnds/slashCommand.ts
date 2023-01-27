import { SlashCommandBuilder } from "discord.js";

interface SlashCommand {
    type: "slash";
    isPublic: boolean;
    data: SlashCommandBuilder;
    execute: () => {}
}
export default SlashCommand