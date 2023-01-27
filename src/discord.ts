import config from './config';
import { Client, Collection, Events, GatewayIntentBits, REST, Routes, CommandInteraction} from 'discord.js';
import mycommands from './actions/discordComamnds';


interface DiscordCommand {
    execute: (x: any) => {}
}


class Discord {
    client: Client<boolean>;
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions
            ],
        });
        
        
        for (const command of mycommands) {
            if ('data' in command && 'execute' in command) {
                this.client.application?.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command ${command} is missing a required "data" or "execute" property.`);
            }
        }
    }

    async connect() {
        return /** @type {Promise<void>} */(new Promise<void>((resolve, reject) => {
            this.client.login(config.discord.token);
            this.client.on('ready', () => {
                console.log('Discord Bot Connected');
                resolve();
            });
            this.client.on(Events.InteractionCreate, async (interaction:CommandInteraction) => {
                if (!interaction.isChatInputCommand()) return;
                const command = interaction.client.commands.get(interaction.commandName);
                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }

            });
        }))
    }

    async regsiterCommands() {
        let jsonCommands: Array<any> = [];
        mycommands.filter(x => x.public ).forEach(x => jsonCommands.push(x.data.toJSON()));
        let devJsonCommands: Array<any> = [];
        mycommands.filter(x => !x.public ).forEach(x => devJsonCommands.push(x.data.toJSON()));
        const rest = new REST({ version: '10' }).setToken(config.discord.token);
        
        const data: any = await rest.put(
			Routes.applicationGuildCommands(config.discord.clientID, config.discord.guild),
			{ body: devJsonCommands },
		);

        console.log(`Successfully reloaded ${data.length} dev application (/) commands.`);

        const data2: any = await rest.put(
			Routes.applicationCommands(config.discord.clientID),
			{ body:  jsonCommands},
		);

        console.log(`Successfully reloaded ${data2.length} public application (/) commands.`);
        
    }
    
    
}

module.exports = new Discord();