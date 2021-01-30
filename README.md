# Discord-Rose

## The simple library for advanced users.

### Discord-Rose is not yet fully released, breaking changes can and will be introduced at a moments notice. We do not recommend creating a production bot with the library just yet.

# Creating a bot

Discord-Rose requires the use of a master process, this will run all of your clusters, this is also where you pass options

The master process will handle passing every option to it's many workers, you don't need to code options into every worker.

## General Structure

**/master.js**
```js
const Master = require('discord-rose/master')
const path = require('path')

const master = new Master(path.resolve('./worker.js'), {
  token: 'BOT TOKEN'
})

master.start()
```

**/worker.js**
```js
const Worker = require('discord-rose/worker')

const worker = new Worker()

// At this point worker is just all Discord interaction

worker.on('MESSAGE_CREATE', (message) => {
  console.log(message.content)
})
```

# Caching
Discord-Rose comes with caching fully customizable. There is a .cache option in your MasterOptions
```js
{ // defaults
  guilds: true,
  roles: true,
  channels: true,
  self: true, // caches own member object, good for permissions
  members: false, // be warned, these two options
  presence: false, // require special intents
  messages: false,
  reactions: false
}
```
If you want to disable cache entirely, you can set `MasterOptions.cache` to `false`

# Using the API

Everything to do with the API in Discord-Rose is fairly raw, other than some methods like sending messages to take simpler args, there's no further parsing.

Every API interface is added to what we call `resources`, these resources are on the `RestManager` aka `Worker.api` and `Master.rest`

Current resources:
- `api.channels`
- `api.messages`
- `api.misc`

These all have typings so type them out to see what functions there are, for example, here's how to send a message.
```js
worker.api.messages.send(channel_id, 'Hello world!')
```
Or edit a channel
```js
worker.api.channels.edit(channel_id, {
  name: 'poggers-mate'
})
```

For the most part, every paramater is raw Discord, so check out the official Discord docs for what paramaters to pass, (there are typings for parameters too).

# Command Handler

You obviously don't need to use it, but Discord-Rose has a built in command handler as there's a distinct lack of classes with methods. This can be confusing at times, however with commands, a special CommandContext is passed along to your command. Here's how to use the command handler:

```js
const worker = new Worker()

worker.commands
  .setPrefix('!')
  .add({
    command: 'hello',
    exec: (ctx) => {
      ctx.reply('World!') // replies inline
    }
  }) // you can daisy chain .add()
  .add({
    command: 'test',
    exec: (ctx) => {
      ctx.delete() // delete's the invoking message
      ctx.send(':evilpepe: bye bye message') // sends a message in the same channel
    }
  })
```

## Current CommandContext methods/properties:

| Name              | Description
| ----------------- | --------------------------------------------
| `.args`           | Array of arguments after the initial command
| `.guild`          | Guild (if in cache) where the message was ran
| `.channel`        | Channel (if in cache) where the message was ran
| `.reply(msg)`     | Replies inline to the messaege
| `.send(msg)`      | Sends a message to the same channel
| `.delete()`       | Deletes the invoking command
| `.hasPerms(perm)` | Whether or not the invoking user has `perm` (doesn't work well if role/guild cache is off)
| `.myPerms(perm)`  | Whether or not the bot has `perm` (doesn't work well if role/guild cache is off)
| `.embed`          | Starts the embed creation process, shown below:

### CommandContext Embeds

```js
ctx.embed // creates a new embed
  .title('Embed title')
  .description('Embed description')
  .send() // sends back to the context telling it to send
```
There are other functions for embeds, check the typings.

### Custom Prefix

The `CommandHandler.setPrefix()` method can also take an (optionally async) method to decide prefixes depending on the data in the message. For example a per-guild prefix:
```js
worker.commands
  .setPrefix(async message => {
    const prefix = await DB.collection('prefixes').get(message.guild_id)

    return prefix
  })
```