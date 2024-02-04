const {
  TeamSpeak,
  QueryProtocol,
  TextMessageTargetMode,
} = require("ts3-nodejs-library");
const config = require("./config");
/*
TODO: FIX THIS ON SERVER EDIT

error EventError: could not fetch client with id 1995 in event "cliententerview"
  eventName: 'cliententerview'
}
*/

class TS {
  constructor() {
    this.client = undefined;
    this.ready = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      if (this.client) {
        reject("Client already connected!");
      }
      this.client = new TeamSpeak({
        host: config.teamspeak.host,
        queryport: config.teamspeak.queryport,
        username: config.teamspeak.username,
        password: config.teamspeak.password,
      });

      this.client.on("error", (e) => {
        console.log("error", e);
      });

      this.client.on("ready", () => {
        console.log("Teamspeak Bot Connected");
        if (config.teamspeak.virtualServerId === undefined) {
          console.log(
            "No virtual server id specified, please choose one in the config file from the list below"
          );
          console.log(this.client.serverList());
        }

        this.client.useBySid(config.teamspeak.virtualServerId);
        resolve();
      });
    });
  }

  async sendMessageToServer(message) {
    return new Promise((resolve) => {
      this.client.sendTextMessage("0", TextMessageTargetMode.SERVER, message);
      resolve();
    });
  }

  async sendMessageToClient(client, message) {
    return new Promise((resolve) => {
      if (client.propcache.clientType === 0) {
        this.client.sendTextMessage(
          client,
          TextMessageTargetMode.CLIENT,
          message
        );
      }
      resolve();
    });
  }

  async getGroupByName(name) {
    return new Promise(async (resolve, reject) => {
      try {
        let group = await this.client.getServerGroupByName(name);
        resolve(group);
      } catch (ex) {
        console.log("Could not lookup group!", ex);
        reject(ex);
      }
    });
  }
}

module.exports = new TS();
