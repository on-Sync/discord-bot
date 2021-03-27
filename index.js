const Discord = require('discord.js'),
  Distube = require('distube'),
  TOKEN = require('./config/token.json'),
  Setup = require('./config/setup.json'),
  Embed = require('./config/embed.json'),
  ID = TOKEN.ID,
  prefix = Setup.prefix;

// Create a new Bot
const bot = new Discord.Client();
// Create a new DisTube
const distube = new Distube(bot, { searchSongs: true, emitNewSongOnly: true });

bot.on('message', msg => {
  const content = msg.content.toUpperCase();
  if( content.startsWith("HEY") ){
    msg.reply("Welcome!");
    msg.channel.send({ embed: Embed.Default2 });
    msg.channel.send(`<div>dd</div>`);
  }

  
  if (!msg.content.startsWith(prefix)) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift();
  
  if (command == "play")
    distube.play(msg, args.join(" "));

  if (["repeat", "loop"].includes(command))
    distube.setRepeatMode(msg, parseInt(args[0]));

  if (command == "stop") {
    distube.stop(msg);
    msg.channel.send("Stopped the music!");
  }

  if (command == "skip")
    distube.skip(msg);

  if (command == "queue") {
    let queue = distube.getQueue(msg);
    msg.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
        `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
    ).slice(0, 10).join("\n"));
  }

  if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`].includes(command)) {
    let filter = distube.setFilter(msg, command);
    msg.channel.send("Current queue filter: " + (filter || "Off"));
  }
  });

  // Queue status template
  const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

  // DisTube event listeners, more in the documentation page
  distube
  .on("playSong", (msg, queue, song) => msg.channel.send(
    `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
  ))
  .on("addSong", (msg, queue, song) => msg.channel.send(
    `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
  ))
  .on("playList", (msg, queue, playlist, song) => msg.channel.send(
    `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
  ))
  .on("addList", (msg, queue, playlist) => msg.channel.send(
    `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
  ))
  // DisTubeOptions.searchSongs = true
  .on("searchResult", (msg, result) => {
    let i = 0;
    msg.channel.send(
      `\`\`\`Elm\n${result.map(song => `${++i}) ${song.name} - [${song.formattedDuration}]`).join("\n")}\n\`\`\``);
  })
  // DisTubeOptions.searchSongs = true
  .on("searchCancel", (msg) => msg.channel.send(`Searching canceled`))
  .on("error", (msg, e) => {
    console.error(e)
    msg.channel.send("An error encountered: " + e);
  });

// Access
bot.login(ID);