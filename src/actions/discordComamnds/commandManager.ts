import { Collection } from "discord.js";
import SlashCommand from "./slashCommand";


class CommandManager {
    commands: Collection<string, SlashCommand> = new Collection<string, SlashCommand>()
}

export default CommandManager;