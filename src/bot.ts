import { Client, GatewayIntentBits } from 'discord.js';
import settings from './settings/settings';
import { handleMusicCommand } from './commands/music';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log('Meret Music Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(settings.prefix) || message.author.bot) return;

  const args = message.content.slice(settings.prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'music') {
    await handleMusicCommand(message, args);
  } else {
    message.reply('Unknown command.');
  }
});

client.login(settings.bot_token);
