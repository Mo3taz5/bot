import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel
} from '@discordjs/voice';
import * as play from 'play-dl';

export class VoicePlaybackService {
  constructor() {
    this.guildSessions = new Map();
  }

  getSession(guildId) {
    if (!this.guildSessions.has(guildId)) {
      const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
      });

      this.guildSessions.set(guildId, {
        player,
        connection: null
      });
    }

    return this.guildSessions.get(guildId);
  }

  async connect(voiceChannel) {
    const guildId = voiceChannel.guild.id;
    const session = this.getSession(guildId);

    const existing = getVoiceConnection(guildId);
    session.connection = existing
      || joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

    await entersState(session.connection, VoiceConnectionStatus.Ready, 20_000);
    session.connection.subscribe(session.player);

    return session;
  }

  onIdle(guildId, callback) {
    const session = this.getSession(guildId);
    session.player.removeAllListeners(AudioPlayerStatus.Idle);
    session.player.on(AudioPlayerStatus.Idle, callback);
  }

  async playTrack(guildId, url) {
    const session = this.getSession(guildId);
    const stream = await play.stream(url, { discordPlayerCompatibility: true });
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });

    session.player.play(resource);
  }

  pause(guildId) {
    const session = this.getSession(guildId);
    session.player.pause();
  }

  resume(guildId) {
    const session = this.getSession(guildId);
    session.player.unpause();
  }

  stop(guildId) {
    const session = this.getSession(guildId);
    session.player.stop(true);

    if (session.connection) {
      session.connection.destroy();
      session.connection = null;
    }
  }
}
