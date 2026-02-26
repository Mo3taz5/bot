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

  async getVideoById(videoId) {
    const url = new URL(YT_VIDEO_URL);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('id', videoId);
    url.searchParams.set('key', this.apiKey);

    const response = await this.fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    const item = data.items?.[0];
    if (!item) {
      throw new Error('تعذر الوصول للفيديو من رابط يوتيوب الحالي');
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

    const url = new URL(YT_SEARCH_URL);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('type', 'video');
    url.searchParams.set('key', this.apiKey);

    const response = await this.fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    const item = data.items?.[0];
    if (!item) {
      throw new Error('No results found on YouTube');
    }

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'YouTube API'
    };
  }
}
