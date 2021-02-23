# Discord-Rose

## The simple Discord library for advanced users.

# Discord-Rose is not yet fully released, breaking changes can and will be introduced at a moments notice. We do not recommend creating a production bot with the library just yet.

# Installation

Run `npm i --save discord-rose`

## Links

[Wiki](https://github.com/discord-rose/discord-rose/wiki) **IMPORTANT**

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
  .setPrefix('!'),
  .add({
    command: 'hello',
    exec: (ctx) => {
      ctx.reply('World!')
    }
  })
```
Do `node ./master.js` and you're off to the races. Scaled automatically.

## Ready to take it to the next level? Take a look out our [Wiki](https://github.com/discord-rose/discord-rose/wiki)