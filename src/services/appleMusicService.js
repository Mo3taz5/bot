export class AppleMusicService {
  constructor(fetchImpl = fetch) {
    this.fetch = fetchImpl;
  }

  async resolveTrack(input) {
    if (!input.includes('music.apple.com/')) {
      return null;
    }

    try {
      const url = new URL(input);
      const titleFromPath = decodeURIComponent(url.pathname.split('/').pop() || '').replace(/-/g, ' ');
      if (titleFromPath) {
        return { title: titleFromPath, source: 'Apple Music URL' };
      }
    } catch {
      return null;
    }

    return null;
  }
}
