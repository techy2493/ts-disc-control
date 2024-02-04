const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const btoa = require("btoa");
const atob = require("atob");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const db = require("./database");
const discord = require("./discord");
const synchronizeUser = require("./actions/synchronizeUser");
const config = require("./config");

const app = express();
const port = config.web.port;
app.use(cookieParser());

const catchAsync = (fn) => (req, res, next) => {
  const routePromise = fn(req, res, next);
  if (routePromise.catch) {
    routePromise.catch((err) => next(err));
  }
};

const CLIENT_ID = config.discord.clientID;
const CLIENT_SECRET = config.discord.clientSecret;
const redirect = `${config.web.baseUrl}${config.web.oAuthRedirect}`;

app.get(`${config.web.loginUrl}`, (req, res) => {
  if (!req.query.tsid) throw new Error("NoTSIDProvided");
  const tsid = req.query.tsid;
  res.cookie("tsid", tsid, { maxage: 3000 });
  res.redirect(
    `https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`
  );
});

app.get("/", (req, res) => {
  res.send("Nothing to see here move along!");
});

app.get(
  "/redirect",
  catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error("NoCodeProvided");
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const body = querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect,
    });
    // debugger;
    const response = await fetch(`https://discordapp.com/api/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    });
    const json = await response.json();
    res.redirect(`/token?token=${json.access_token}`);
  })
);

app.get(
  "/token",
  catchAsync(async (req, res) => {
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
      guild.members.fetch({ withPresences: true }).then((fetchedMembers) => {
        const totalOnline = fetchedMembers.filter(
          (member) => member.presence?.status === "online"
        );
        member = fetchedMembers.get(json.id);
        if (member) {
          synchronizeUser(
            discord.client.guilds.cache
              .get(config.discord.guild)
              .members.cache.get(json.id),
            tsid
          );
        } else console.log("The user didn't exist>!?!?");
        // Now you have a collection with all online member objects in the totalOnline variable
      });
    } else {
      console.log("Missing an ID, ", req.cookies.tsid, json.id);
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

app.get(
  "/registerCommands",
  catchAsync(async (req, res) => {
    discord.regsiterCommands();
  })
);

app.listen(port, () => {
  console.log(`OAuth Login listening at http://localhost:${port}`);
});
