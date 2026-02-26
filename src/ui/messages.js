import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { botEmoji } from '../config/customEmojis.js';
import { env } from '../config/env.js';

const EMOJIS = {
  music: botEmoji('musicbeat', '🎵'),
  video: '🎬',
  search: botEmoji('spotifyAlt', '🔎'),
  play: botEmoji('listeningToMusic', '▶️'),
  pause: botEmoji('soundMuteDark', '⏸️'),
  stop: botEmoji('soundDark', '⏹️'),
  next: botEmoji('spotifyQueueAdd', '⏭️'),
  queue: botEmoji('spotify', '📜'),
  joystick: '🕹️',
  ok: botEmoji('accountConnected', '✅'),
  warning: botEmoji('skull', '⚠️'),
  bot: botEmoji('boombox', '🤖'),
  voice: botEmoji('microphoneWhite', '🎧'),
  jam: botEmoji('catjam', '🎶')
};

function createBasePanel(title, description) {
  return new EmbedBuilder().setColor(env.defaultAccentColor).setTitle(title).setDescription(description).setTimestamp();
}

export function createNowPlayingPanel(track) {
  return createBasePanel(
    `${EMOJIS.music} لوحة التشغيل`,
    `${EMOJIS.play} **الأغنية الحالية:** ${track.title}\n${EMOJIS.video} **المصدر:** ${track.source}`
  )
    .addFields(
      { name: `${EMOJIS.queue} عدد العناصر`, value: `${track.queueLength}`, inline: true },
      { name: `${EMOJIS.ok} بواسطة`, value: track.requestedBy, inline: true },
      { name: `${EMOJIS.jam} الرابط`, value: track.url, inline: false }
    )
    .setFooter({ text: `${EMOJIS.search} YouTube / Spotify / Apple Music` });
}

export function createQueuePanel(queueText) {
  return createBasePanel(`${EMOJIS.queue} لوحة قائمة التشغيل`, queueText);
}

export function createHelpPanel() {
  return createBasePanel(
    `${EMOJIS.bot} لوحة الأوامر`,
    [
      `${EMOJIS.voice} لازم تكون داخل روم صوتي قبل !play أو !video`,
      '`!play <song|url>` تشغيل من YouTube/Spotify/AppleMusic',
      '`!queue` عرض القائمة',
      '`!shuffle` خلط القائمة',
      '`!loop` تبديل loop (off/track/queue)',
      '`!move <from> <to>` نقل عنصر',
      '`!volume <1-200>` تغيير الصوت',
      '`!autoplay` تفعيل/إيقاف autoplay',
      '`!247` تفعيل/إيقاف 24/7',
      '`!setdj @role` تعيين DJ role',
      '`!ping` عرض latency'
    ].join('\n')
  );
}

export function createJoystickPanel() {
  return createBasePanel('🕹️ Joystick Menu', 'Use the buttons: Pause/Resume, Skip, Stop, Loop, Shuffle.');
}

export function createErrorPanel(message) {
  return new EmbedBuilder().setColor(0xe74c3c).setTitle(`${EMOJIS.warning} خطأ في التشغيل`).setDescription(message).setTimestamp();
}

export function createControlButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('play_pause').setLabel(`${EMOJIS.pause} Pause/Resume`).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('skip').setLabel(`${EMOJIS.next} Skip`).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('stop').setLabel(`${EMOJIS.stop} Stop`).setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('joystick').setLabel(`${EMOJIS.joystick} Joystick`).setStyle(ButtonStyle.Secondary)
  );
}

export function createJoystickButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('joy_pause').setLabel('Pause/Resume').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('joy_skip').setLabel('Skip').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('joy_stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('joy_loop').setLabel('Loop').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('joy_shuffle').setLabel('Shuffle').setStyle(ButtonStyle.Secondary)
  );
}
