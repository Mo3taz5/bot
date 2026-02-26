export const BOT_EMOJIS = {
  musicbeat: '<:7670musicbeat:1476278786101346547>',
  spotify: '<:1969spotify:1476278709001519165>',
  spotifyAlt: '<:35248spotify:1476278829130448967>',
  spotifyQueueAdd: '<:8005spotifyqueueadd:1476278787653238858>',
  spotifyFavourite: '<:2841spotifyfavourite:1476278718287708391>',
  spotifyDownload: '<:6163spotifydownload:1476278756636229724>',
  listeningToMusic: '<:1712listeningtomusic:1476278707436912761>',
  wingedMusicNote: '<:1363_wingedmusicnote:1476278698033287270>',
  excitedMusicNote: '<:1625excitedmusicnote:1476278703813296230>',
  listentogetherwith: '<:2028listentogetherwith:1476278710507405524>',
  boombox: '<:7421_Boombox:1476278782678794240>',
  djpeepo: '<:5799djpeepo:1476278742920724663>',
  catjam: '<:5964catjam:1476278750378201260>',
  pepejam: '<:6850pepejam:1476278771098321088>',
  pusheenpiano: '<:6798pusheenpiano:1476278769286123600>',
  birdmusic: '<:8007birdmusic:1476278789251268824>',
  birdtriangle: '<:8007birdtriangle:1476278790828199946>',
  birdvibetriangle: '<:6094birdvibetriangle:1476278751741345873>',
  soundDark: '<:8853sounddark:1476278797799133377>',
  soundWhite: '<:8853soundwhite:1476278799409877157>',
  soundMuteDark: '<:8750soundmutedark:1476278795651780732>',
  soundMuteWhite: '<:1070soundmutewhite:1476278696607482049>',
  microphoneDark: '<:5920microphonedark:1476278747337330791>',
  microphoneWhite: '<:5920microphonewhite:1476278748742684744>',
  microphoneMuteDark: '<:7386microphonemutedark:1476278778140557564>',
  microphoneMuteWhite: '<:7612microphonemutewhite:1476278784280756386>',
  settingsDark: '<:9256settingsdark:1476278809580802058>',
  settingsWhite: '<:9256settingswhite:1476278810985894111>',
  accountConnected: '<:2727accountisconnected:1476278715012088011>',
  accountConnectedWhite: '<:4513accountisconnectedwhite:1476278729289240791>',
  accountNotConnected: '<:6548accountisnotconnected:1476278765482020864>',
  maintainCommands: '<:1625maintainscommands:1476278705473982494>',
  letsGo: '<:5592letsgo:1476278740232442012>',
  cooked: '<:1539cooked:1476278699363139647>',
  skull: '<:6740skull:1476278767948267715>'
};

export const EMOJI_REGISTRY_VERSION = 'moutazwn-1476278857228222534';

export function botEmoji(name, fallback = '') {
  return BOT_EMOJIS[name] || fallback;
}
