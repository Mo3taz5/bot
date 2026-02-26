export class MusicPlayer {
  constructor({ youtubeService, spotifyService, appleMusicService }) {
    this.youtubeService = youtubeService;
    this.spotifyService = spotifyService;
    this.appleMusicService = appleMusicService;
    this.guildState = new Map();
  }

  getState(guildId) {
    if (!this.guildState.has(guildId)) {
      this.guildState.set(guildId, {
        queue: [],
        isPaused: false,
        loopMode: 'off',
        autoplay: false,
        mode247: false,
        djRoleId: null,
        volume: 70
      });
    }

    return this.guildState.get(guildId);
  }

  async addTrack(guildId, input, requestedBy) {
    const state = this.getState(guildId);
    const spotifyTrack = await this.spotifyService.resolveTrack(input);
    const appleTrack = await this.appleMusicService.resolveTrack(input);
    const query = spotifyTrack?.title || appleTrack?.title || input;
    const ytTrack = await this.youtubeService.searchVideo(query);

    const track = {
      ...ytTrack,
      title: spotifyTrack?.title || appleTrack?.title || ytTrack.title,
      requestedBy
    };

    state.queue.push(track);

    return {
      track,
      nowPlaying: this.getNowPlaying(guildId),
      shouldAutoStart: state.queue.length === 1
    };
  }

  popNext(guildId) {
    const state = this.getState(guildId);
    if (state.queue.length === 0) return null;

    const current = state.queue.shift();
    if (state.loopMode === 'track') {
      state.queue.unshift(current);
    } else if (state.loopMode === 'queue') {
      state.queue.push(current);
    }

    return this.getNowPlaying(guildId);
  }

  skip(guildId) {
    return this.popNext(guildId);
  }

  shuffle(guildId) {
    const state = this.getState(guildId);
    if (state.queue.length <= 2) return false;
    const head = state.queue[0];
    const tail = state.queue.slice(1);
    for (let i = tail.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [tail[i], tail[j]] = [tail[j], tail[i]];
    }
    state.queue = [head, ...tail];
    return true;
  }

  move(guildId, from, to) {
    const state = this.getState(guildId);
    if ([from, to].some((n) => Number.isNaN(n) || n < 2 || n > state.queue.length)) return false;
    const [item] = state.queue.splice(from - 1, 1);
    state.queue.splice(to - 1, 0, item);
    return true;
  }

  removeAt(guildId, index) {
    const state = this.getState(guildId);
    if (Number.isNaN(index) || index < 2 || index > state.queue.length) {
      return null;
    }

    return state.queue.splice(index - 1, 1)[0];
  }

  clear(guildId) {
    const state = this.getState(guildId);
    state.queue = [];
    state.isPaused = false;
  }

  stop(guildId) {
    this.clear(guildId);
  }

  togglePause(guildId) {
    const state = this.getState(guildId);
    state.isPaused = !state.isPaused;
    return state.isPaused;
  }

  cycleLoopMode(guildId) {
    const state = this.getState(guildId);
    const modes = ['off', 'track', 'queue'];
    const idx = modes.indexOf(state.loopMode);
    state.loopMode = modes[(idx + 1) % modes.length];
    return state.loopMode;
  }

  setVolume(guildId, value) {
    const state = this.getState(guildId);
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 200) return null;
    state.volume = parsed;
    return parsed;
  }

  getVolume(guildId) {
    return this.getState(guildId).volume;
  }

  toggleAutoplay(guildId) {
    const state = this.getState(guildId);
    state.autoplay = !state.autoplay;
    return state.autoplay;
  }

  isAutoplayEnabled(guildId) {
    return this.getState(guildId).autoplay;
  }

  toggle247(guildId) {
    const state = this.getState(guildId);
    state.mode247 = !state.mode247;
    return state.mode247;
  }

  is247Enabled(guildId) {
    return this.getState(guildId).mode247;
  }

  setDjRole(guildId, roleId) {
    this.getState(guildId).djRoleId = roleId;
  }

  hasDjPermission(guildId, member) {
    const roleId = this.getState(guildId).djRoleId;
    if (!roleId) return true;
    return member.permissions.has('ManageGuild') || member.roles.cache.has(roleId);
  }

  getNowPlaying(guildId) {
    const state = this.getState(guildId);
    const current = state.queue[0];
    if (!current) return null;
    return { ...current, queueLength: state.queue.length };
  }

  getQueueSummary(guildId) {
    const state = this.getState(guildId);
    if (state.queue.length === 0) return 'Queue is empty.';
    return state.queue
      .map((track, index) => `${index === 0 ? '▶️' : `${index + 1}.`} ${track.title}`)
      .join('\n');
  }
}
