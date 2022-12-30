const config = require('./config');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const commands = require('./actions/discordComamnds')



class Discord {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
            ],
        });
        
        
        this.client.commands = new Collection();
        for (const command of commands) {
            if ('data' in command && 'execute' in command) {
                this.client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command ${command} is missing a required "data" or "execute" property.`);
            }
        }
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.client.login(config.discord.token);
            this.client.on('ready', () => {
                this.client.intents
                console.log('Discord Bot Connected');
                resolve();
            });
            this.client.on(Events.InteractionCreate, async interaction => {
                if (!interaction.isChatInputCommand()) return;

                const command = interaction.client.commands.get(interaction.commandName);
                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }

            });
        })
    }

    async regsiterCommands() {
        let jsonCommands = [];
        commands.forEach(x => jsonCommands.push(x.data.toJSON()));
        const rest = new REST({ version: '10' }).setToken(config.discord.token);
        const data = await rest.put(
			Routes.applicationGuildCommands(config.discord.clientID, config.discord.guild),
			{ body: jsonCommands },
		);
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    
    
}

module.exports = new Discord();