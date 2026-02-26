export class MusicPlayer {
  constructor({ youtubeService, spotifyService }) {
    this.youtubeService = youtubeService;
    this.spotifyService = spotifyService;
    this.guildState = new Map();
  }

  getState(guildId) {
    if (!this.guildState.has(guildId)) {
      this.guildState.set(guildId, {
        queue: [],
        isPaused: false
      });
    }

    return this.guildState.get(guildId);
  }

  async addTrack(guildId, input, requestedBy) {
    const state = this.getState(guildId);
    const spotifyTrack = await this.spotifyService.resolveTrack(input);
    const query = spotifyTrack ? spotifyTrack.title : input;
    const ytTrack = await this.youtubeService.searchVideo(query);

    const track = {
      ...ytTrack,
      title: spotifyTrack?.title || ytTrack.title,
      requestedBy
    };

    state.queue.push(track);

    return {
      track,
      nowPlaying: this.getNowPlaying(guildId),
      shouldAutoStart: state.queue.length === 1
    };
  }

  skip(guildId) {
    const state = this.getState(guildId);
    if (state.queue.length === 0) return null;
    state.queue.shift();
    return this.getNowPlaying(guildId);
  }

  stop(guildId) {
    const state = this.getState(guildId);
    state.queue = [];
    state.isPaused = false;
  }

  togglePause(guildId) {
    const state = this.getState(guildId);
    state.isPaused = !state.isPaused;
    return state.isPaused;
  }

  getNowPlaying(guildId) {
    const state = this.getState(guildId);
    const current = state.queue[0];
    if (!current) return null;

    return {
      ...current,
      queueLength: state.queue.length
    };
  }

  getQueueSummary(guildId) {
    const state = this.getState(guildId);

    if (state.queue.length === 0) {
      return 'Queue is empty.';
    }

    return state.queue
      .map((track, index) => `${index === 0 ? '▶️' : `${index + 1}.`} ${track.title}`)
      .join('\n');
  }
}
