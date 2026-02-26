import dotenv from 'dotenv';

dotenv.config();

export const env = {
  discordToken: process.env.DISCORD_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  defaultAccentColor: Number(process.env.BOT_ACCENT_COLOR || 0x2ecc71)
};

export function validateEnv() {
  const required = ['discordToken'];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
