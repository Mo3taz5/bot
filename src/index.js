import { Client, GatewayIntentBits } from 'discord.js';
import { env, validateEnv } from './config/env.js';
import { MusicPlayer } from './services/musicPlayer.js';
import { SpotifyService } from './services/spotifyService.js';
import { VoicePlaybackService } from './services/voicePlayback.js';
import { YouTubeService } from './services/youtubeService.js';
import {
  createControlButtons,
  createErrorPanel,
  createHelpPanel,
  createNowPlayingPanel,
  createQueuePanel
} from './ui/messages.js';

validateEnv();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent]
});

const player = new MusicPlayer({
  youtubeService: new YouTubeService(env.youtubeApiKey),
  spotifyService: new SpotifyService()
});

const voicePlayback = new VoicePlaybackService();

function createPlaybackMessage(track) {
  return {
    embeds: [createNowPlayingPanel(track)],
    components: [createControlButtons()]
  };
}

function playbackFailureMessage() {
  return '❌ تعذر تشغيل هذا الرابط/الاسم. جرّب رابطًا آخر أو أعد المحاولة.';
}

async function playCurrentTrack(guildId) {
  const nowPlaying = player.getNowPlaying(guildId);
  if (!nowPlaying) {
    voicePlayback.stop(guildId);
    return null;
  }

  await voicePlayback.playTrack(guildId, nowPlaying.url);
  return nowPlaying;
}

async function ensureVoiceConnection(message) {
  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    throw new Error('لازم تدخل روم صوتي أولاً قبل أمر التشغيل 🎧');
  }

  await voicePlayback.connect(voiceChannel);
  voicePlayback.onIdle(message.guildId, async () => {
    const next = player.skip(message.guildId);
    if (next) {
      await voicePlayback.playTrack(message.guildId, next.url);
      return;
    }

    voicePlayback.stop(message.guildId);
  });
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;
  if (!message.guildId) return;

  const [command, ...args] = message.content.slice(1).trim().split(/\s+/);
  const input = args.join(' ');
  const guildId = message.guildId;

  try {
    if (command === 'help') {
      await message.reply({ embeds: [createHelpPanel()] });
      return;
    }

    if (command === 'play' || command === 'video') {
      if (!input) {
        await message.reply({ embeds: [createErrorPanel('اكتب اسم أغنية أو رابط أولاً 🎵')] });
        return;
      }

      await ensureVoiceConnection(message);
      const { nowPlaying, shouldAutoStart } = await player.addTrack(guildId, input, message.author.username);

      if (shouldAutoStart) {
        try {
          await playCurrentTrack(guildId);
        } catch {
          player.stop(guildId);
          voicePlayback.stop(guildId);
          throw new Error(playbackFailureMessage());
        }
      }

      await message.reply(createPlaybackMessage(nowPlaying));
      return;
    }

    if (command === 'queue') {
      await message.reply({
        embeds: [createQueuePanel(player.getQueueSummary(guildId))],
        components: [createControlButtons()]
      });
      return;
    }

    if (command === 'skip') {
      const next = player.skip(guildId);
      if (!next) {
        voicePlayback.stop(guildId);
        await message.reply({ embeds: [createQueuePanel('📭 تم تخطي آخر عنصر، القائمة الآن فارغة.')] });
        return;
      }

      try {
        await voicePlayback.playTrack(guildId, next.url);
      } catch {
        player.stop(guildId);
        voicePlayback.stop(guildId);
        throw new Error(playbackFailureMessage());
      }

      await message.reply(createPlaybackMessage(next));
      return;
    }

    if (command === 'stop') {
      player.stop(guildId);
      voicePlayback.stop(guildId);
      await message.reply({ embeds: [createQueuePanel('⏹️ تم إيقاف التشغيل ومسح كل العناصر من القائمة.')] });
      return;
    }
  } catch (error) {
    await message.reply({ embeds: [createErrorPanel(error.message || 'Unexpected playback error')] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() || !interaction.guildId) return;

  const guildId = interaction.guildId;

  if (interaction.customId === 'play_pause') {
    const isPaused = player.togglePause(guildId);
    if (isPaused) {
      voicePlayback.pause(guildId);
    } else {
      voicePlayback.resume(guildId);
    }

    await interaction.reply({
      embeds: [createQueuePanel(isPaused ? '⏸️ تم إيقاف التشغيل مؤقتاً.' : '▶️ تم استكمال التشغيل.')]
    });
    return;
  }

  if (interaction.customId === 'skip') {
    const next = player.skip(guildId);
    if (!next) {
      voicePlayback.stop(guildId);
      await interaction.reply({ embeds: [createQueuePanel('⏭️ لا يوجد عناصر إضافية في قائمة التشغيل.')] });
      return;
    }

    try {
      await voicePlayback.playTrack(guildId, next.url);
    } catch {
      player.stop(guildId);
      voicePlayback.stop(guildId);
      await interaction.reply({ embeds: [createErrorPanel(playbackFailureMessage())] });
      return;
    }

    await interaction.reply(createPlaybackMessage(next));
    return;
  }

  if (interaction.customId === 'stop') {
    player.stop(guildId);
    voicePlayback.stop(guildId);
    await interaction.reply({ embeds: [createQueuePanel('⏹️ تم إنهاء الجلسة ومسح القائمة.')] });
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(env.discordToken);
