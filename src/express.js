const express = require('express')
const fetch = require('node-fetch');
const btoa = require('btoa');
const atob = require('atob');
const querystring = require('querystring');
const cookieParser = require("cookie-parser")
const db = require('./database');
const discord = require('./discord');
const synchronizeUser = require('./actions/synchronizeUser');
const config = require('./config')

const app = express()
const port = config.web.port
app.use(cookieParser())


const catchAsync = fn => (
    (req, res, next) => {
      const routePromise = fn(req, res, next);
      if (routePromise.catch) {
        routePromise.catch(err => next(err));
      }
    }
  );

  
const CLIENT_ID = config.discord.clientID;
const CLIENT_SECRET =  config.discord.clientSecret;
const redirect = `${config.web.baseUrl}${config.discord.oAuthRedirect}`;

app.get('/login', (req, res) => {
    if (!req.query.tsid) throw new Error('NoTSIDProvided');
    const tsid = req.query.tsid;
    res.cookie('tsid', tsid, { maxage: 3000 })
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
});
  


app.get('/', (req, res) => {
    res.send('Nothing to see here move along!')
})
  
app.get('/redirect', catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const body = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect
    });
   // debugger;
    const response = await fetch(`https://discordapp.com/api/oauth2/token`,
      {
        method: "POST",
        headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded'

        },
        body: body
      });
    const json = await response.json();
    res.redirect(`/token?token=${json.access_token}`);
  }));

  app.get('/token', catchAsync(async (req, res)=> {
    if (!req.query.token) throw new Error('NoTokenProvided');
    const token = req.query.token;
      const response = await fetch('http://discordapp.com/api/users/@me', 
      {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      const json = await response.json();
      res.send(`Hello ${json.username} your Discord ID is ${json.id}, you Teamspeak ID is ${req.cookies.tsid}. <br /> If you have problems with synchronization send the line above to high command!`)
      if (req.cookies.tsid && json.id) {
        var tsid = atob(req.cookies.tsid);
        db.updateTeamspeakID(json.id, tsid)
        synchronizeUser(discord.client.guilds.cache.get(config.discord.guild).members.cache.get(json.id), tsid)
      } else {
        console.log("Missing an ID, ", req.cookies.tsid, json.id)
      }
  }))

app.listen(port, () => {
    console.log(`OAuth Login listening at http://localhost:${port}`)
})
