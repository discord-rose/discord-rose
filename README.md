# Discord-Rose

## The simple Discord library for advanced users.

# Installation

Run `npm i --save discord-rose`

## Links

[Wiki](https://github.com/discord-rose/discord-rose/wiki) [Docs](https://rose.js.org)

[Support Server](https://discord.gg/EdpA6qRHhs)

[NPM](https://npmjs.com/package/discord-rose), [GitHub](https://github.com/discord-rose/discord-rose)

# Simple bot

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
Note: You can even easily implement [slash commands](https://github.com/discord-rose/discord-rose/wiki/Slash-Commands) directly within message commands.

Do `node ./master.js` and you're off to the races. Scaled automatically.

## Ready to take it to the next level? Take a look out our [Wiki](https://github.com/discord-rose/discord-rose/wiki)

# Comparsions

Here we'll compare discord-rose to other known competitors, by server count.

## Memory Usage (RSS)

| Library          | 130k     | 50k       | 4k        | 500      | 100
|:----------------:|:--------:|:---------:|:---------:|:--------:|:----:
| Discord.js       | 20GB     | 13GB      | 6GB       | 3GB      | 2GB
| Eris             | 16GB     | 10GB      | 5GB       | 1GB      | 500MB
| Discord.js-light | 10GB     | 5GB       | 2GB       | 500MB    | 200MB
| **discord-rose** | **5GB**  | **1.5GB** | **200MB** | **80MB** | **50MB**