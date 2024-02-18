import express from "express";
import fetch from "node-fetch";
import btoa from "btoa";
import atob from "atob";
import querystring from "querystring";
import cookieParser from "cookie-parser";
import db from "./database.js";
import discord from "./discord.js";
import synchronizeUser from "./actions/synchronizeUser.js";
import config from "./config.js";
import log from "./log.js";

class Web {
  catchAsync = (fn) => (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch((err) => next(err));
    }
  };
  constructor() {
    this.app = express();
    this.port = config.web.port;
    this.app.use(cookieParser());

    this.CLIENT_ID = config.discord.clientID;
    this.CLIENT_SECRET = config.discord.clientSecret;
    this.redirect = `${config.web.baseUrl}${config.web.oAuthredirect}`;

    this.app.get(`${config.web.loginUrl}`, (req, res) => {
      if (!req.query.tsid) throw new Error("NoTSIDProvided");
      const tsid = req.query.tsid;
      res.cookie("tsid", tsid, { maxage: 3000 });
      res.redirect(
        `https://discordapp.com/api/oauth2/authorize?client_id=${this.CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${this.redirect}`
      );
    });

    this.app.get("/", (req, res) => {
      res.send("Nothing to see here move along!");
    });

    this.app.get(
      "/redirect",
      this.catchAsync(async (req, res) => {
        if (!req.query.code) throw new Error("NoCodeProvided");
        const code = req.query.code;
        const creds = btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);
        const body = querystring.stringify({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.redirect,
        });
        // debugger;
        const response = await fetch(
          `https://discordapp.com/api/oauth2/token`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${creds}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body,
          }
        );
        const json = await response.json();
        res.redirect(`/token?token=${json.access_token}`);
      })
    );

    this.app.get(
      "/token",
      this.catchAsync(async (req, res) => {
        if (!req.query.token) throw new Error("NoTokenProvided");
        const token = req.query.token;
        const response = await fetch("https://discordapp.com/api/users/@me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json();

        if (req.cookies.tsid && json.id) {
          var tsid = atob(req.cookies.tsid);
          db.addTeamspeakID(json.id, tsid);
          let guild = discord.client.guilds.cache.get(config.discord.guild);
          let member;
          guild.members
            .fetch({ withPresences: true })
            .then((fetchedMembers) => {
              // const totalOnline = fetchedMembers.filter(
              //   (member) => member.presence?.status === "online"
              // );
              member = fetchedMembers.get(json.id);
              if (member) {
                synchronizeUser(
                  discord.client.guilds.cache
                    .get(config.discord.guild)
                    .members.cache.get(json.id),
                  tsid
                );
              } else
                log.error(
                  "Could not register from OAuth discord ID did not exist in the discord server - $discordId - $tsid",
                  {
                    tsid: req.cookies.tsid,
                    discordId: json.id,
                  }
                );
            });
        } else {
          log.error(
            "Could not register from OAuth did not recieve tsid - $discordId",
            {
              discordId: json.id,
            }
          );
        }

        if (config.web.clientBaseUrl) {
          res.redirect(config.web.clientBaseUrl);
        } else {
          res.send(
            `Hello ${json.username} your Discord ID is ${json.id}, you Teamspeak ID is ${req.cookies.tsid}. <br /> If you have problems with synchronization send the line above to high command!`
          );
        }
      })
    );

    this.app.get(
      "/registerCommands",
      this.catchAsync(async (req, res) => {
        discord.regsiterCommands();
      })
    );

    this.app.listen(this.port, () => {
      log.system(`OAuth Login listening at http://localhost:${this.port}`);
    });
  }
}

export default new Web();
