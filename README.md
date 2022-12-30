# ts-disc-control

This is a passion project to develop a tool focusing on ARMA communities which use both TS and Discord for their voice communications. 

It allows automated synchronization of discord & teamspeak roles.

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
    - Log in wtith Discord
        - When a user who is not connects to TS server they will recieve a message with a link to login through discord this connects their TS identity to their discord user

- /syncRole [role]
    - Configures a discord role to be synchronized with a TS server group with a matching name
- /unsync [role]
    - Removes a role from synchronization
- /sync [user]
    - Synchornize the roles configured 
- /tsid [user] [tsid]
    - Allows an admin to manually configure a user's teamspeak id instead of requiring the user to login with teamspeak

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
- /RegisterTeamspeakIdentity
    - Allow user to register their own TS id instead of logging in? (This may present a security issue??)