import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

import { commands, onInteractionCreate } from './commands';

dotenv.config();

const { TOKEN, CLIENT_ID, CHANNEL_ID } = process.env;
if (!TOKEN || !CLIENT_ID || !CHANNEL_ID) {
	console.error('Missing environment variables.');
	process.exit(1);
}

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const rest = new REST().setToken(TOKEN);
(async () =>
	await rest.put(Routes.applicationCommands(CLIENT_ID!), {
		body: commands,
	}))();

client.once('ready', () => {
	console.log(`Logged in as ${client.user?.tag}`);
});
client.on('interactionCreate', onInteractionCreate);
client.on('error', error => console.error(error));
client.on('warn', error => console.warn(error));
client.login(TOKEN);
