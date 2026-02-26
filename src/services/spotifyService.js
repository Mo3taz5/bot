import { getData } from 'spotify-url-info';

export class SpotifyService {
  async resolveTrack(input) {
    if (!input.includes('open.spotify.com/')) {
      return null;
    }

    const metadata = await getData(input);
    if (!metadata?.name) {
      throw new Error('Unable to read Spotify track metadata');
    }

    const artist = metadata.artists?.[0]?.name || 'Unknown Artist';
    return {
      title: `${metadata.name} - ${artist}`,
      source: 'Spotify API Metadata'
    };
  }
}
