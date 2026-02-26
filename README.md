# bot

بوت Discord موسيقى متقدم بواجهة Panel وإيموجيات مخصصة، مع تشغيل صوت فعلي ودعم YouTube / Spotify / Apple Music.

## Features
- Multi-platform: `!play` يدعم روابط/بحث YouTube + Spotify + Apple Music.
- Playback controls: `!play !stop !pause(button) !skip !shuffle !loop`.                             
- Interactive joystick: زر `🕹️ Joystick` يفتح قائمة تحكم مرئية بالأزرار.
- Queue management: عرض القائمة + حذف + نقل + خلط.
- Volume control: `!volume 1-200`.
- DJ Role: `!setdj @role` لتقييد أوامر الإدارة الموسيقية على دور DJ/Admin.
- Latency: `!ping`.
- 24/7 + autoplay: أوامر `!247` و `!autoplay`.

## Commands
- `!help`
- `!play <song|url>`
- `!video <query>`
- `!queue`
- `!now`
- `!move <from> <to>`
- `!remove <index>`
- `!shuffle`
- `!loop`
- `!volume <1-200>`
- `!autoplay`
- `!247`
- `!setdj @role`
- `!skip`
- `!stop`
- `!clear`
- `!ping`

## Setup
```env
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
YOUTUBE_API_KEY=... # اختياري (يوجد fallback تلقائي)
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
BOT_ACCENT_COLOR=3066993
```

```bash
npm install
npm start
```

## Notes
- YouTube API failure now auto-falls back to `play-dl` search.
- Emoji registry files:
  - `src/config/emoji-registry.md`
  - `src/config/customEmojis.js`
- Joystick controls are available via button in playback panel.
