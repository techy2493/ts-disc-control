const { TeamSpeak, QueryProtocol, TextMessageTargetMode } = require("ts3-nodejs-library")
const config =  require('./config');


class TS {
    constructor() {
        this.client = undefined;
        this.ready = false;
    }

    async connect() {
       return new Promise((resolve, reject) => {
            if (this.client) {
                reject("Client already connected!")
            }
            this.client = new TeamSpeak({
                host: config.teamspeak.host,
                queryport: config.teamspeak.queryport,
                username: config.teamspeak.username,
                password: config.teamspeak.password,
            })
            
            this.client.on("error", (e) => {
                console.log('error', e)
            })

            this.client.on("ready", () => {
                console.log('Teamspeak Bot Connected', )
                this.client.useBySid(config.teamspeak.virtualServerId)
                resolve()
            })
       })
    }

    async sendMessageToServer(message) {
        return new Promise(resolve => {
            this.client.sendTextMessage("0", TextMessageTargetMode.SERVER, message);
            resolve();
        })
    }

    async sendMessageToClient(client, message) {
        return new Promise(resolve => {
            if (client.propcache.clientType === 0) {
                this.client.sendTextMessage(client, TextMessageTargetMode.CLIENT, message);
            }
            resolve();
        })
    }
}

module.exports = new TS();
