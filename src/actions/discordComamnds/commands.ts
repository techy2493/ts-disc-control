import tsid from './tsid';
import sync from './sync';
import unsync from './unsync';
import syncRole from './syncRole';
import fs from 'node:fs';
import path from 'node:path';

const commands: Array<any> = [];
const commandsPath = path.join(__dirname, './');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.endsWith('index.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    console.log("Loading Discord Command", command.data.name)
    commands.push(command);
}
export default commands;