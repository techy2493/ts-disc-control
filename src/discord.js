const discordlib = require('discord.js');
const config = require('./config');
console.log(discordlib)
const intents = discordlib.IntentsBitField;

class Discord {
    constructor() {
        this.client = new discordlib.Client({ intents: intents.GUILDS & intents.GUILD_MEMBERS & intents.GUILD_MESSAGES });
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.client.login(config.discord.token);
            this.client.on('ready', () => {
                console.log('Discord Bot Connected');
                resolve();
            });
        })
        
    }
    
}

module.exports = new Discord();