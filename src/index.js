import { Client, GatewayIntentBits, PermissionsBitField } from 'discord.js';
import { env, validateEnv } from './config/env.js';
import { MusicPlayer } from './services/musicPlayer.js';
import { SpotifyService } from './services/spotifyService.js';
import { AppleMusicService } from './services/appleMusicService.js';
import { VoicePlaybackService } from './services/voicePlayback.js';
import { YouTubeService } from './services/youtubeService.js';
import {
  createControlButtons,
  createErrorPanel,
  createHelpPanel,
  createJoystickButtons,
  createJoystickPanel,
  createNowPlayingPanel,
  createQueuePanel
} from './ui/messages.js';

validateEnv();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent]
});

const player = new MusicPlayer({
  youtubeService: new YouTubeService(env.youtubeApiKey),
  spotifyService: new SpotifyService(),
  appleMusicService: new AppleMusicService()
});

const voicePlayback = new VoicePlaybackService();

function createPlaybackMessage(track) {
  return { embeds: [createNowPlayingPanel(track)], components: [createControlButtons()] };
}

function playbackFailureMessage() {
  return '❌ تعذر تشغيل هذا الرابط/الاسم. جرّب رابطًا آخر أو أعد المحاولة.';
}

function hasDjAccess(guildId, member) {
  return player.hasDjPermission(guildId, member);
}

async function playCurrentTrack(guildId) {
  const nowPlaying = player.getNowPlaying(guildId);
  if (!nowPlaying) {
    if (!player.is247Enabled(guildId)) {
      voicePlayback.stop(guildId);
    }
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
  voicePlayback.setVolume(message.guildId, player.getVolume(message.guildId));

  voicePlayback.onIdle(message.guildId, async () => {
    let next = player.popNext(message.guildId);

    if (!next && player.isAutoplayEnabled(message.guildId)) {
      const last = player.getQueueSummary(message.guildId).split('\n')[0] || 'top music';
      try {
        const addRes = await player.addTrack(message.guildId, last, 'autoplay');
        next = addRes.nowPlaying;
      } catch {
        next = null;
      }
    }

    if (next) {
      await voicePlayback.playTrack(message.guildId, next.url);
      return;
    }

    if (!player.is247Enabled(message.guildId)) {
      voicePlayback.stop(message.guildId);
    }
  });
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;
  if (!message.guildId) return;

  const [command, ...args] = message.content.slice(1).trim().split(/\s+/);
  const input = args.join(' ');
  const guildId = message.guildId;

  try {
    if (command === 'help') return void await message.reply({ embeds: [createHelpPanel()] });
    if (command === 'ping') return void await message.reply(`🏓 ${Math.round(client.ws.ping)}ms`);

    if (command === 'setdj') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return void await message.reply({ embeds: [createErrorPanel('هذا الأمر للأدمن فقط.')] });
      }
      const role = message.mentions.roles.first();
      if (!role) return void await message.reply({ embeds: [createErrorPanel('استعمل: !setdj @role')] });
      player.setDjRole(guildId, role.id);
      return void await message.reply({ embeds: [createQueuePanel(`🎛️ تم تعيين DJ Role: ${role}`)] });
    }

    if (command === 'play' || command === 'video') {
      if (!input) return void await message.reply({ embeds: [createErrorPanel('اكتب اسم أغنية أو رابط أولاً 🎵')] });
      await ensureVoiceConnection(message);
      const { nowPlaying, shouldAutoStart } = await player.addTrack(guildId, input, message.author.username);
      if (shouldAutoStart) {
        try { await playCurrentTrack(guildId); } catch { player.stop(guildId); voicePlayback.stop(guildId); throw new Error(playbackFailureMessage()); }
      }
      return void await message.reply(createPlaybackMessage(nowPlaying));
    }

    if (command === 'queue') {
      return void await message.reply({ embeds: [createQueuePanel(player.getQueueSummary(guildId))], components: [createControlButtons()] });
    }

    if (command === 'now') {
      const nowPlaying = player.getNowPlaying(guildId);
      return void await message.reply(nowPlaying ? createPlaybackMessage(nowPlaying) : { embeds: [createQueuePanel('📭 لا يوجد تشغيل حالي.')] });
    }

    if (command === 'volume') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      const volume = player.setVolume(guildId, args[0]);
      if (!volume) return void await message.reply({ embeds: [createErrorPanel('استعمل: !volume 1-200')] });
      voicePlayback.setVolume(guildId, volume);
      return void await message.reply({ embeds: [createQueuePanel(`🔊 تم ضبط الصوت على ${volume}%`)] });
    }

    if (command === 'loop') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      const mode = player.cycleLoopMode(guildId);
      return void await message.reply({ embeds: [createQueuePanel(`🔁 Loop mode: **${mode}**`)] });
    }

    if (command === 'shuffle') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      const ok = player.shuffle(guildId);
      return void await message.reply({ embeds: [createQueuePanel(ok ? '🔀 تم خلط القائمة.' : 'لا يوجد عناصر كافية للخلط.')] });
    }

    if (command === 'move') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      const from = Number(args[0]);
      const to = Number(args[1]);
      const ok = player.move(guildId, from, to);
      return void await message.reply({ embeds: [createQueuePanel(ok ? `↔️ تم نقل العنصر من ${from} إلى ${to}.` : 'استعمل: !move <from> <to> (ابتداءً من 2).')] });
    }

    if (command === 'remove') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      const removed = player.removeAt(guildId, Number(args[0]));
      return void await message.reply({ embeds: [createQueuePanel(removed ? `🗑️ تم حذف: **${removed.title}**` : 'استعمل رقم صحيح من القائمة (ابتداءً من 2).')] });
    }

    if (command === 'autoplay') {
      const status = player.toggleAutoplay(guildId);
      return void await message.reply({ embeds: [createQueuePanel(`📻 Autoplay: **${status ? 'ON' : 'OFF'}**`)] });
    }

    if (command === '247') {
      const status = player.toggle247(guildId);
      return void await message.reply({ embeds: [createQueuePanel(`🕘 24/7 mode: **${status ? 'ON' : 'OFF'}**`)] });
    }

    if (command === 'clear') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      player.clear(guildId);
      voicePlayback.stop(guildId);
      return void await message.reply({ embeds: [createQueuePanel('🧹 تم تنظيف قائمة التشغيل بالكامل.')] });
    }

    if (command === 'skip') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      const next = player.skip(guildId);
      if (!next) {
        if (!player.is247Enabled(guildId)) voicePlayback.stop(guildId);
        return void await message.reply({ embeds: [createQueuePanel('📭 تم تخطي آخر عنصر، القائمة الآن فارغة.')] });
      }
      try { await voicePlayback.playTrack(guildId, next.url); } catch { player.stop(guildId); voicePlayback.stop(guildId); throw new Error(playbackFailureMessage()); }
      return void await message.reply(createPlaybackMessage(next));
    }

    if (command === 'stop') {
      if (!hasDjAccess(guildId, message.member)) return void await message.reply({ embeds: [createErrorPanel('هذا الأمر محجوز لـ DJ/Admin')] });
      player.stop(guildId);
      if (!player.is247Enabled(guildId)) voicePlayback.stop(guildId);
      return void await message.reply({ embeds: [createQueuePanel('⏹️ تم إيقاف التشغيل ومسح كل العناصر من القائمة.')] });
    }
  } catch (error) {
    console.error('message command failure:', error);
    await message.reply({ embeds: [createErrorPanel(error.message || 'Unexpected playback error')] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() || !interaction.guildId) return;
  const guildId = interaction.guildId;

  try {
    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId === 'joystick') {
      await interaction.editReply({ embeds: [createJoystickPanel()], components: [createJoystickButtons()] });
      return;
    }

    if (['joy_pause', 'play_pause'].includes(interaction.customId)) {
      const isPaused = player.togglePause(guildId);
      isPaused ? voicePlayback.pause(guildId) : voicePlayback.resume(guildId);
      await interaction.editReply({ embeds: [createQueuePanel(isPaused ? '⏸️ Paused' : '▶️ Resumed')] });
      return;
    }

    if (['joy_skip', 'skip'].includes(interaction.customId)) {
      const next = player.skip(guildId);
      if (!next) {
        if (!player.is247Enabled(guildId)) voicePlayback.stop(guildId);
        await interaction.editReply({ embeds: [createQueuePanel('⏭️ لا يوجد عناصر إضافية في قائمة التشغيل.')] });
        return;
      }
      await voicePlayback.playTrack(guildId, next.url);
      await interaction.editReply(createPlaybackMessage(next));
      return;
    }

    if (['joy_stop', 'stop'].includes(interaction.customId)) {
      player.stop(guildId);
      if (!player.is247Enabled(guildId)) voicePlayback.stop(guildId);
      await interaction.editReply({ embeds: [createQueuePanel('⏹️ تم إنهاء الجلسة ومسح القائمة.')] });
      return;
    }

    if (interaction.customId === 'joy_loop') {
      const mode = player.cycleLoopMode(guildId);
      await interaction.editReply({ embeds: [createQueuePanel(`🔁 Loop mode: **${mode}**`)] });
      return;
    }

    if (interaction.customId === 'joy_shuffle') {
      const ok = player.shuffle(guildId);
      await interaction.editReply({ embeds: [createQueuePanel(ok ? '🔀 Queue shuffled.' : 'Not enough tracks to shuffle.')] });
      return;
    }

    await interaction.editReply({ embeds: [createErrorPanel('زر غير معروف.')] });
  } catch (error) {
    console.error('interaction failure:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [createErrorPanel('حدث خطأ غير متوقع في التفاعل.')] });
      return;
    }
    await interaction.editReply({ embeds: [createErrorPanel('حدث خطأ غير متوقع في التفاعل.')] });
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(env.discordToken);
