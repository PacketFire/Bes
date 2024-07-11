import { Message } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnection } from '@discordjs/voice';
import { saveSongMetadata, getPlaylist } from '../db/database';
import settings from '../settings/settings';

let player = createAudioPlayer();
let connection: VoiceConnection | null = null;
let currentPlaylist: string[] = [];
let currentIndex = 0;

export const handleMusicCommand = async (message: Message, args: string[]) => {
  const subCommand = args.shift()?.toLowerCase();

  switch (subCommand) {
    case 'play':
      await play(message, args);
      break;
    case 'pause':
      await pause(message);
      break;
    case 'stop':
      await stop(message);
      break;
    case 'skip':
      await skip(message);
      break;
    case 'playlist':
      await playlist(message);
      break;
    default:
      message.reply('Unknown subcommand for music. Use play, pause, stop, skip, or playlist.');
  }
};

const play = async (message: Message, args: string[]) => {
  const url = args[0];
  if (!url) {
    message.reply('Please provide a URL.');
    return;
  }

  if (!message.member?.voice.channelId) {
    message.reply('You need to be in a voice channel to play music!');
    return;
  }

  if (!connection) {
    connection = joinVoiceChannel({
      channelId: message.member.voice.channelId,
      guildId: message.guildId!,
      adapterCreator: message.guild!.voiceAdapterCreator!,
    });
  }

  currentPlaylist.push(url);
  currentIndex = currentPlaylist.length - 1;
  const resource = createAudioResource(url, { inlineVolume: true });
  resource.volume?.setVolume(settings.default_volume);
  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Playing, () => {
    console.log('The audio player has started playing!');
  });

  player.on(AudioPlayerStatus.Idle, () => {
    if (currentIndex + 1 < currentPlaylist.length) {
      currentIndex++;
      const nextResource = createAudioResource(currentPlaylist[currentIndex], { inlineVolume: true });
      nextResource.volume?.setVolume(settings.default_volume);
      player.play(nextResource);
    } else {
      connection?.destroy();
      connection = null;
    }
  });

  await saveSongMetadata(url);
  message.reply(`Playing: ${url}`);
};

const pause = async (message: Message) => {
  if (player.state.status === AudioPlayerStatus.Playing) {
    player.pause();
    message.reply('Paused playing.');
  } else {
    message.reply('No audio is playing.');
  }
};

const stop = async (message: Message) => {
  player.stop();
  connection?.destroy();
  connection = null;
  currentPlaylist = [];
  currentIndex = 0;
  message.reply('Stopped playing.');
};

const skip = async (message: Message) => {
  if (currentIndex + 1 < currentPlaylist.length) {
    currentIndex++;
    const nextResource = createAudioResource(currentPlaylist[currentIndex], { inlineVolume: true });
    nextResource.volume?.setVolume(settings.default_volume);
    player.play(nextResource);
    message.reply('Skipped to the next song.');
  } else {
    message.reply('No more songs in the playlist.');
  }
};

const playlist = async (message: Message) => {
  const playlist = await getPlaylist();
  if (playlist.length > 0) {
    const playlistString = playlist.map((song, index) => `${index + 1}. ${song.url}`).join('\n');
    message.reply(`Current Playlist:\n${playlistString}`);
  } else {
    message.reply('The playlist is empty.');
  }
};
