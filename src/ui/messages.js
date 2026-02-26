import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { env } from '../config/env.js';

const EMOJIS = {
  music: '🎵',
  video: '🎬',
  search: '🔎',
  play: '▶️',
  pause: '⏸️',
  stop: '⏹️',
  next: '⏭️',
  queue: '📜',
  ok: '✅',
  warning: '⚠️',
  bot: '🤖',
  voice: '🎧'
};

function createBasePanel(title, description) {
  return new EmbedBuilder()
    .setColor(env.defaultAccentColor)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

export function createNowPlayingPanel(track) {
  return createBasePanel(
    `${EMOJIS.music} لوحة التشغيل`,
    `${EMOJIS.play} **الأغنية الحالية:** ${track.title}\n${EMOJIS.video} **المصدر:** ${track.source}`
  )
    .addFields(
      { name: `${EMOJIS.queue} عدد العناصر`, value: `${track.queueLength}`, inline: true },
      { name: `${EMOJIS.ok} بواسطة`, value: track.requestedBy, inline: true },
      { name: '🔗 الرابط', value: track.url, inline: false }
    )
    .setFooter({ text: `${EMOJIS.search} YouTube API + Spotify Resolver` });
}

export function createQueuePanel(queueText) {
  return createBasePanel(`${EMOJIS.queue} لوحة قائمة التشغيل`, queueText);
}

export function createHelpPanel() {
  return createBasePanel(
    `${EMOJIS.bot} لوحة الأوامر`,
    [
      `${EMOJIS.voice} لازم تكون داخل روم صوتي قبل !play أو !video`,
      '`!play <song|url>` ▶️ تشغيل أغنية أو رابط',
      '`!video <query>` 🎬 بحث فيديو وتشغيل الصوت',
      '`!queue` 📜 عرض قائمة التشغيل',
      '`!skip` ⏭️ تخطي الأغنية الحالية',
      '`!stop` ⏹️ إيقاف ومسح القائمة'
    ].join('\n')
  );
}

export function createErrorPanel(message) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle(`${EMOJIS.warning} خطأ في التشغيل`)
    .setDescription(message)
    .setTimestamp();
}

export function createControlButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('play_pause')
      .setLabel(`${EMOJIS.pause} إيقاف/استكمال`)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('skip')
      .setLabel(`${EMOJIS.next} تخطي`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('stop')
      .setLabel(`${EMOJIS.stop} إيقاف`)
      .setStyle(ButtonStyle.Danger)
  );
}
