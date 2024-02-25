import config from "./config.js";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import commands from "./actions/discordComamnds/index.js";
import log from "./log.js";
class Discord {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });

    this.client.commands = new Collection();
    for (const command of commands) {
      if ("data" in command && "execute" in command) {
        this.client.commands.set(command.data.name, command);
      } else {
        log.debug(
          `[WARNING] The command $command is missing a required "data" or "execute" property.`,
          { command: command }
        );
      }
    }
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client.login(config.discord.token);
      this.client.on("ready", () => {
        this.client.intents;
        log.system("Discord Bot Connected");
        this.regsiterCommands();
        resolve();
      });
      this.client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(
          interaction.commandName
        );
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      });

      this.client.on(Events.Debug, (message) => {
        log.debug(message);
      });

      this.client.on(Events.Error, (message) => {
        log.error(message);
      });

      this.client.on(Events.Warn, (message) => {
        log.debug(message);
      });

      this.client.on(Events.GuildUnavailable, (message) => {
        log.error(message);
      });

      this.client.on(Events.GuildRoleUpdate, (message) => {
        log.verbose(message);
      });

      this.client.on(Events.Raw, (message) => {
        log.verbose(message);
      });
    });
  }

  async regsiterCommands() {
    let jsonCommands = [];
    commands
      .filter((x) => x.public)
      .forEach((x) => jsonCommands.push(x.data.toJSON()));
    let devJsonCommands = [];
    commands
      .filter((x) => !x.public)
      .forEach((x) => devJsonCommands.push(x.data.toJSON()));
    const rest = new REST({ version: "10" }).setToken(config.discord.token);

    const data = await rest.put(
      Routes.applicationGuildCommands(
        config.discord.clientID,
        config.discord.guild
      ),
      { body: devJsonCommands }
    );

    log.system(
      `Successfully reloaded ${data.length} dev application (/) commands.`
    );

    const data2 = await rest.put(
      Routes.applicationCommands(config.discord.clientID),
      { body: jsonCommands }
    );

    log.debug(
      `Successfully reloaded ${data2.length} public application (/) commands.`
    );
  }
}

export default new Discord();
