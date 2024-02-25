import { TeamSpeak, TextMessageTargetMode } from "ts3-nodejs-library";
import config from "./config.js";
import log from "./log.js";
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
        log.error("error", e);
      });

      this.client.on("ready", () => {
        log.system("Teamspeak Bot Connected");
        if (config.teamspeak.virtualServerId === undefined) {
          log.error(
            "No virtual server id specified, please choose one in the config file from the list below"
          );
          log.error(this.client.serverList());
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

  async sendPokeToClient(client, message) {
    return new Promise((resolve) => {
      if (client.propcache.clientType === 0) {
        this.client.sendPokeToClient(
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
        log.error("Could not lookup group!", ex);
        reject(ex);
      }
    });
  }
}

export default new TS();
