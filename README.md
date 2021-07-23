# Discord-Rose

## The simple Discord library for advanced users.

# Installation

Run `npm i --save discord-rose`

## Links

[Wiki](https://github.com/discord-rose/discord-rose/wiki) [Docs](https://rose.js.org)

[Support Server](https://discord.gg/EdpA6qRHhs)

[NPM](https://npmjs.com/package/discord-rose), [GitHub](https://github.com/discord-rose/discord-rose)

# Simple bot

You can easily use the `SingleWorker` class for easy use of discord-rose, for scaled solution, look [below](#scaled-bot)

**./index.js**
```js
const { SingleWorker } = require('discord-rose')

const worker = new SingleWorker({
  token: 'BOT TOKEN'
})

worker.commands
  .prefix('!')
  .add({
    command: 'hello',
    exec: (ctx) => {
      ctx.reply('World!')
    }
  })
```

# Scaled Bot

You can instead use a `Master` & `Worker` solution, one master managing multiple workers/clusters, which hold x amount of shards, making it much more efficient.

**./master.js**
```js
const { Master } = require('discord-rose')
const path = require('path')

const master = new Master(path.resolve(__dirname, './worker.js'), {
  token: 'BOT TOKEN'
})

master.start()
```

**./worker.js**
```js
const { Worker } = require('discord-rose')

const worker = new Worker()

worker.commands
  .prefix('!')
  .add({
    command: 'hello',
    exec: (ctx) => {
      ctx.reply('World!')
    }
  })
```
Do `node ./master.js` and you're off to the races. Scaled automatically.

*Do note if your bot only ever fits into 1 cluster (< 5000 servers by default), you should consider using [SingleWorker](#simple-bot) since master & worker introduce more process overhead*


You can even easily implement [slash commands](https://github.com/discord-rose/discord-rose/wiki/Slash-Commands) directly within message commands.

## Ready to take it to the next level? Take a look out our [Wiki](https://github.com/discord-rose/discord-rose/wiki)
