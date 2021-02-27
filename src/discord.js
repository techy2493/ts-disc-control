const discordlib = require('discord.js');
const config = require('./config');

class Discord {
    constructor() {
        this.client = new discordlib.Client();
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