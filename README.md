# ts-disc-control

This is a passion project to develop a tool focusing on ARMA communities which use both TS and Discord for their voice communications. 

It allows automated synchronization of discord & teamspeak roles.

## Current Status
I've not had enough interest in this to continue new development. As of January 5th, 2024 it still functions however no new functionality will be added unless users request it. 

DEMO links updated, join the Demo server https://discord.gg/SDHjZt9wYt to reach out to me directly, or feel free to post an issue and I will respond when I can.

## How & Is it Safe?

### What is it and how does it work?
TS-DISC-Control is a Discord BOT, which should be used with a Discord Appliation & Bot. It does not automate any activity on your user account.

When you connect to a teamspeak server with this bot connected you will recieve a message inidcating you should log in with discord (this is done through normal OAuth2 flows which protect you the user and do not ever give your credentials to anyone but Discord). This authorization is only for identification of the discord client in the discord server the bot is connected to.

When your accounts are linked together you will automatically recieve and or lose the roles chosen to be synchronized (and only those) when you recieve or lose them in discord.

At this time, we are not offering a hosted bot for this, we offer this code for your use and you must set up the bot with your own application & bot account to use it.

### What is it not.
TS-DISC-Control is NOT a self-bot. It will never act on your behalf with your account and it will not impersonate you or any other person.
For the bot to start it must have a discord application & bot account associated for it to do anything at all.

### Is it safe?
Safety is always relative and we do not offer any warranty or guarantee. However, the project is designed to follow all Discord Terms of Service and rules. Any changes which impact this will be announced within 24 hours on discord. We have requested discord perform a validation of our code to ensure we are not in breach, however they currently only review bots with 75 active guids or more. We are still aiming to have this done and will update on discord when we can.

This bot does not collect or store sensitive user information, it does not retain any rights to the user account even those for identity after the user ID is connected. It does not read messages (and therefore does not require the message intent and we reccomend not turning it on in your application). The database file used in this application only stores Teamspeak user ids (DBIDs which uniquely identify the user to the server) and Discord Ids which uniquely identify the discord user on the discord server (guild). It does not store any information about which roles a user has assigned preferring to check every time a sync is triggered.

## DEMO

Demo servers are available at 
https://discord.gg/SDHjZt9wYt
and 
wc147.teamspeak3.com

## Current Features
These are the features which currently exist in ts-discord-control;

- Discord Bot
- Synchronizaton of a users's discord roles to Teamspeak.
    - Currently only Discord can be the master
    - Configured roles to be synchornized must exist with an identical name in teamspeak
    - Only TS server group are supported
    - Only roles configured to be synchronized are checked
        - If a role is set to sync and it exists in TS it will be added and removed from users who are properly logged in
        - If a role is not set to sync even if it exists in TS it will *not* be added or removed
    - Log in with Discord
        - When a user who is not connects to TS server they will recieve a message with a link to login through discord this connects their TS identity to their discord user
    - If useOAuth is turned off teamspeak will send the client a message asking them to register their teamspeak id with a discord command

- /syncRole [role]
    - Configures a discord role to be synchronized with a TS server group with a matching name
- /unsync [role]
    - Removes a role from synchronization
- /sync [user]
    - Synchornize the roles configured 
- /tsid [user] [tsid]
    - Allows an admin to manually configure a user's teamspeak id instead of requiring the user to login with discord oAuth through teamspeak
- /register [user]
    - Allows user to manually configure a their own teamspeak id instead of requiring the user to login discord oAuth

## Roadmap
This is entirely a work in progress and is subject to change

- /RoleRequest Command
    - Allow users to submit a request for a role that can be approved by an authorized user clicking an embedded button
- /Trained Command
    - Allow an authorized user to grant a role and add appropriate logging
- /RoleRequest [trained]
    - Allow user to submit a request for a role and notify a certain user approval is neccesary,
    - Would allow trainer to authorize either at the message or from a DM
- Backend Webpage for Logs, Searching, Database access. 
    - Would allow users to view a history of all actions taken by the bot
    - Would allow users to search history by trainer
    - Would allow users to search history by trainee
    - Guage Interest: Allow Users to grant / revoke roles from here
    - Login with discord
- Update TS group management to use TS gid instead of name
- Guage Interst: Support TS channel groups???
- Put a message in a channel (configruable) when RoleRequest is made
- General log channel (configurable) which will track all syncronizations, and requests, and authorizations
- Configurable Master
    - Guage Iterest
        - Discord (current)
        - Teamspeak
        - ts-disc-control
            - Would make all role changes go through ts-disc-control through commands and would overide any changes elsewhere to synchronized roles
- /ForgetMe
    - Remove Discord / TSID from database so the user will receive a prompt to log in again when they connect to TS
    - Optionally, add [user] param to force another user to be removed (if invoker has appropriate permissions)
- Sync discord bans, kicks, mutes to teamspeak???
- /funop <description>
    - Create message with description indicating funop participation ping and reaction to join
    -Create 3 buttons
        - confirm (ping reactors with message saying confirmed will go on)
        - start (ping reactors with messsage to join)
        - cancel (ping reactors op is canceled)
      

# SETUP

### Discord Bot

Create your application & bot in Discord

For your token see: https://discordjs.guide/preparations/setting-up-a-bot-application.html

For your clientID and clientSecret see: https://discordjs.guide/oauth2/#getting-an-oauth2-url

### Teamspeak

Create a serverquery account for your bot to monitor teamspeak, send messages to users, and assign server groups.

### CONFIG FILE

See the configuration section of the wiki for information on configuring the bot, an example config file and descriptions of each configuration item and what it is used for.

```
### Running the bot
Once the config file is filled out, run the bot by executing index.js with node.
To make it run continually you may want to use PM2, see: https://discordjs.guide/improving-dev-environment/pm2.html#installation
