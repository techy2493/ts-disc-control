import {TeamSpeak, TextMessageTargetMode} from 'ts3-nodejs-library'
import config from './config'

/*
TODO: FIX THIS ON SERVER EDIT

error EventError: could not fetch client with id 1995 in event "cliententerview"
    at C:\Users\FuckMicrosoft\ts-disc-control\node_modules\ts3-nodejs-library\lib\TeamSpeak.js:208:23
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
  eventName: 'cliententerview'
}
error EventError: could not fetch client with id 1996 in event "cliententerview"
    at C:\Users\FuckMicrosoft\ts-disc-control\node_modules\ts3-nodejs-library\lib\TeamSpeak.js:208:23
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
  eventName: 'cliententerview'
}
error EventError: could not fetch client with id 1996 in event "serveredited"
    at C:\Users\FuckMicrosoft\ts-disc-control\node_modules\ts3-nodejs-library\lib\TeamSpeak.js:278:23
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
  eventName: 'serveredited'
}
error EventError: could not fetch client with id 1997 in event "cliententerview"
    at C:\Users\FuckMicrosoft\ts-disc-control\node_modules\ts3-nodejs-library\lib\TeamSpeak.js:208:23
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
  eventName: 'cliententerview'
}
*/

class TS {
    client: TeamSpeak | undefined;
    ready: boolean;
    public constructor() {
        this.client = undefined;
        this.ready = false;
    }

    public async connect() {
       return /** @type {Promise<void>} */(new Promise<void>((resolve, reject) => {
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
                if (!this.client)
                {
                    throw "Teamspeak client not initialized!";
                }
                this.client.useBySid(config.teamspeak.virtualServerId)
                resolve()
            })
       }))
    }

    public async sendMessageToServer(message) {
        return /** @type {Promise<void>} */(new Promise<void>(resolve => {
            if (!this.client)
            {
                throw "Teamspeak client not initialized!";
            }
            this.client.sendTextMessage("0", TextMessageTargetMode.SERVER, message);
            resolve();
        }))
    }

    public async sendMessageToClient(client, message) {
        return /** @type {Promise<void>} */(new Promise<void>(resolve => {
            if (client.propcache.clientType === 0) {
                if (!this.client)
                {
                    throw "Teamspeak client not initialized!";
                }
                this.client.sendTextMessage(client, TextMessageTargetMode.CLIENT, message);
            }
            resolve();
        }))
    }
}

export default new TS() as TS;
