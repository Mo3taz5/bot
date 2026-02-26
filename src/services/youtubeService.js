const YT_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export class YouTubeService {
  constructor(apiKey, fetchImpl = fetch) {
    this.apiKey = apiKey;
    this.fetch = fetchImpl;
  }

  async searchVideo(query) {
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
