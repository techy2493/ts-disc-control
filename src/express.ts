import express from 'express';
import fetch from 'node-fetch';
import btoa from 'btoa';
import atob from 'atob';
import querystring from 'querystring';
import cookieParser from "cookie-parser"
import db from './database';
import discord from './discord';
import synchronizeUser from './actions/synchronizeUser';
import config from './config'
import { CookieOptions } from 'express';
import { Guild } from 'discord.js';

// TODO: Refactor this mess

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
    res.cookie('tsid', tsid, { maxage: 3000 } as CookieOptions)
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
    const json: any = await response.json();
    res.redirect(`/token?token=${json.access_token}`);
  }));

  app.get('/token', catchAsync(async (req, res)=> {
    if (!req.query.token) throw new Error('NoTokenProvided');
    const token = req.query.token;
      const response = await fetch('https://discordapp.com/api/users/@me', 
      {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      const json: any = await response.json();
      res.send(`Hello ${json.username} your Discord ID is ${json.id}, you Teamspeak ID is ${req.cookies.tsid}. <br /> If you have problems with synchronization send the line above to high command!`)
      if (req.cookies.tsid && json.id) {
        var tsid = atob(req.cookies.tsid);
        db.updateTeamspeakID(json.id, tsid)
        let guild: Guild | undefined = discord.client.guilds.cache.get(config.discord.guild);
        let member;
        guild?.members.fetch({ withPresences: true }).then(fetchedMembers => {
          const totalOnline = fetchedMembers.filter(member => member.presence?.status === 'online');
          member = fetchedMembers.get(json.id)
          if (member)
          {
            synchronizeUser(discord.client.guilds.cache.get(config.discord.guild)?.members.cache.get(json.id), tsid)
            res.send(`Thanks ${member.username} your teamspeak identity and discord identity have been linked!`);
          }
          else 
            console.log("The user didn't exist>!?!?")
          // Now you have a collection with all online member objects in the totalOnline variable
        });
        
      } else {
        console.log("Missing an ID, ", req.cookies.tsid, json.id)
      }
  }))

  app.get('/registerCommands', catchAsync((async (req, res) => {
    discord.regsiterCommands();
  })));

app.listen(port, () => {
    console.log(`OAuth Login listening at http://localhost:${port}`)
})


export default app;