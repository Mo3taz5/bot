import * as play from 'play-dl';

const YT_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YT_VIDEO_URL = 'https://www.googleapis.com/youtube/v3/videos';

function extractVideoId(input) {
  try {
    const parsed = new URL(input);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '') || null;
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export class YouTubeService {
  constructor(apiKey, fetchImpl = fetch) {
    this.apiKey = apiKey;
    this.fetch = fetchImpl;
  }

  async fallbackSearch(query) {
    const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });
    const item = results?.[0];
    if (!item?.url) {
      throw new Error('تعذر العثور على نتيجة تشغيل من يوتيوب');
    }

    return {
      id: item.id,
      title: item.title,
      url: item.url,
      source: 'YouTube play-dl fallback'
    };
  }

  async getVideoById(videoId) {
    if (!this.apiKey) {
      return this.fallbackSearch(`https://www.youtube.com/watch?v=${videoId}`);
    }

    const url = new URL(YT_VIDEO_URL);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('id', videoId);
    url.searchParams.set('key', this.apiKey);

    const response = await this.fetch(url.toString());
    if (!response.ok) {
      return this.fallbackSearch(`https://www.youtube.com/watch?v=${videoId}`);
    }

    const data = await response.json();
    const item = data.items?.[0];
    if (!item) {
      return this.fallbackSearch(`https://www.youtube.com/watch?v=${videoId}`);
    }

    return {
      id: item.id,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      source: 'YouTube URL'
    };
  }

  async searchVideo(query) {
    const directVideoId = extractVideoId(query);
    if (directVideoId) {
      return this.getVideoById(directVideoId);
    }

    if (!this.apiKey) {
      return this.fallbackSearch(query);
    }

    const url = new URL(YT_SEARCH_URL);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('type', 'video');
    url.searchParams.set('key', this.apiKey);

    const response = await this.fetch(url.toString());
    if (!response.ok) {
      return this.fallbackSearch(query);
    }

    const data = await response.json();
    const item = data.items?.[0];
    if (!item) {
      return this.fallbackSearch(query);
    }

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'YouTube API'
    };
  }
}
