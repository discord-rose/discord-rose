# Discord-Rose

## The simple library for advanced users.

# Discord-Rose is not yet fully released, breaking changes can and will be introduced at a moments notice. We do not recommend creating a production bot with the library just yet.

# Installation

Run `npm i --save discord-rose`

## Requirements

- A coding software that has support for typings, this library lacks documentation as it's entirely just a proxy to raw Discord, the typings allow you to see what you have to fill.
- A full read of this README. I know it's long, but to get the general gist, please just read the full thing
- [The discord docs](https://discord.com/developers/docs)

## Links

[Support Server](https://discord.gg/EdpA6qRHhs)

[NPM](https://npmjs.com/package/discord-rose), [GitHub](https://github.com/discord-rose/discord-rose)

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

## Options

| Property               | Type                | Default            | Description
-------------------------|---------------------|--------------------|------------------------------------------
| token                  | string              | none               | Discord bot token to connect with
| shards                 | number or 'auto'    | 'auto'             | Amount of shards to spawn, leave auto to automatically fetch
| shardsPerCluster       | number              | 5                  | Amount of shards per cluster to spawn
| intents                | number or Intents[] | undefined          | What intents to use, set to `undefined` to use non-priveleged intents and `true` to enable all
| shardOffset            | number              | 0                  | Amount of shards to add after requesting shards
| cache                  | CacheOptions        | Default            | [CacheOptions](#caching)
| cacheControl           | CacheControlOptions | None               | [Cache Control](#cache-control)
| log                    | function(string)    | console.log        | Log function supplied with debug messages, set to false to disable internal logging
| ws                     | string              | Default            | Forcefully set WS URL, defaults to one gotten from gateway endpoint

## Extra worker functions

### `Worker.setStatus(type: string, name: string, status?: string, url?: string)`

Sets the status easily, for example
```js
worker.setStatus('playing', 'Rocket League', 'online')
```
*Note: running this at the start of the file is possible, it waits until READY before executing*

### `Worker.guildShard(id: Snowflake)` Returns Shard

Gets the shard in charge of the guild via it's ID

### `Worker.getMembers(id: Snowflake)` Returns a collection of guild members mapped by user ID

Gets every member in the guild via the websocket, needs GUILD_MEMBERS intent.

# Caching
Discord-Rose comes with caching fully customizable. There is a .cache option in your MasterOptions
```js
{ // defaults
  guilds: true,
  roles: true,
  channels: true,
  self: true, // caches own member object, good for permissions
  members: false, // be warned, these two options
  messages: false
}
```
If you want to disable cache entirely, you can set `MasterOptions.cache` to `false`

- `.guilds` defines Worker.guilds which is key'd by Guild ID and value'd by said guild's data
- `.roles` defines Worker.guildRoles which is key'd by Guild ID and value'd by a collection, this collection is key'd by role ID and value'd by said role's data
- `.channels` defines Worker.channels which is key'd by Channel ID and value'd by said channel's data
- `.self` defines Worker.selfMember which is key'd by Guild ID and value'd by the clients subsequent member data in that server
- `.members` defines Worker.members which is key'd by Guild ID and value'd by a collection, this collection is key'd by user ID and their member's data within the guild
- `.messages` defines Worker.messages which is key'd by Channel ID and value'd by a collection, this collection is key'd by message ID and said message's data

## Cache Control

In order to optimize performance, the library offers the ability to only cache properties you really truly need.

We absolutely recommend you do this, because most of the times, you rarely need more than 10% of the properties Discord provides you.

Current the possible to control caches are `.guilds` `.roles` `.channels` and `.members` They can be changed via the MasterOptions.`cacheControl` option

For example, only letting through some cache properties for guilds:

```js
const master = new Master('file.js', {
  // ... rest of MasterOptions
  cacheControl: {
    guilds: ['name', 'owner_id', 'region'] // only will cache these properties
  }
})
```
*Note: all vital information, like ID's and things like role.guild_id, will be maintained no matter what*

Properties that aren't kept that you might want to keep but aren't enabled by default: `role.permissions`, ...

# Using the API

Everything to do with the API in Discord-Rose is fairly raw, other than some methods like sending messages to take simpler args, there's no further parsing.

Every API interface is added to what we call `resources`, these resources are on the `RestManager` aka `Worker.api` and `Master.rest`

Current resources:
- `api.channels`
- `api.messages`
- `api.members`
- `api.guilds`
- `api.users`
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
    aliases: ['h'] // you can also add aliases!
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

*`.command` and .`aliases`[] can also be RegExp statements*

*`.setPrefix()` can also take an array of prefixes*

## Command Handler Options

Command handler options can be set via the CommandHandler.options(opts) method *which can be daisy chained*

The options are

| Option           | Type                               | Default | Description
|------------------|------------------------------------|---------|----------
| `.default`       | [CommandOptions](#command-handler) | none    | Sets the default properties, other than .exec, .command, .aliases, useful for [middlewares](#middlewares)
| `.bots`          | boolean                            | false   | Whether bots can run commands
| `.mentionPrefix` | boolean                            | true    | Whether or not to use @Bot as a default additional prefix

For example

```js
worker.commands
  .options({
    bots: true
  })
  .add({...})
```
Will allow for bots run commands

## Middlewares

CommandHandler comes with the .middleware() function which can be daisy chained as well.
This will make this function run everytime before a command is executed, which should return a boolean about whether or not the command should run.

You can also `throw new Error('message')` to send an error via traditional error logging.

Middleware functions are supplied with ctx, here's an example of usage

#### Admin locked commands

```js
worker.commands
  .middleware((ctx) => {
    if (ctx.command.adminOnly) {
      if (!isAdmin(ctx.message.author)) return false // return false because they're not an admin

      // or you can tell the user

      if (isAdmin(ctx.message.author)) {
        throw new Error("You're not an admin!") // responds to user with message
      }
    }

    return true // return true to allow execution of command
  })
  .add({ // for example a restart command should be admin only
    command: 'restart',
    exec: () => process.exit(), 
    adminOnly: true // set this custom property
  })
```

The usage for middlewares are essentially infinite, you can do anything from admin locks to cooldowns without repeating code.

### In-house middlewares

Here are some in-house made middlewares made by the same people making this library.

- [Cooldown](https://npmjs.com/@discord-rose/cooldown-middleware) Adds the ability to add individual cooldown timers to your code.
- [Permissions](https://npmjs.com/@discord-rose/permissions-middleware) Adds the ability to check if your bot or the user running a command has required permissions
- [Flags](https://npmjs.com/@discord-rose/flags-middleware) Adds the parsing of simple CLI esc command flags, like `!hello --world` will add ctx.flags = { world: true }
- [Admin lock](https://npmjs.com/@discord-rose/admin-middleware) Super simple, and definitely easy to do yourself, but a built in admin middleware

*And more to come! Have any ideas? Let us know in the issues tab*

## Current CommandContext methods/properties:

| Name              | Description
| ----------------- | --------------------------------------------
| `.command`        | Original command options
| `.worker`         | Worker object
| `.args`           | Array of arguments after the initial command
| `.guild`          | Guild (if in cache) where the message was ran
| `.channel`        | Channel (if in cache) where the message was ran
| `.member`         | Member who ran the command
| `.me`             | Bot's member within the executing guild
| `.prefix`         | The prefix the command was ran with
| `.reply(msg)`     | Replies inline to the messaege
| `.send(msg)`      | Sends a message to the same channel
| `.dm(msg)`        | DM's the user who ran the command
| `.sendFile(file)` | Sends a file to the channel, file being `{ name: 'name.ext', buffer: Buffer }`
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

*Note: if you want to use the command handler using separate files, in TypeScript, you can import command options like such*

**/commands/help.ts**
```ts
import { CommandOptions } from 'discord-rose/dist/structures/CommandHandler'

export default {
  command: 'help',
  aliases: ['h'],
  exec: (ctx) => {
    // ...
  }
} as CommandOptions // this will enable types!
```

# Cross cluster communication

As the bot is clustered, there comes some challenges, like managing things that are simply not apart of the same process.

Introducing Worker`.comms`, .comms is the entry point for all things cluster communication

## Information Functions

### `comms.getGuild(id: Snowflake)`

Fetches a guild from it's clusters cache

*Example*
```js
const guild = await worker.comms.getGuild('399688888739692552')
console.log(guild.name) // JPBBots
```

### `comms.broadcastEval(code: string)` *Note: worker = Worker*

Runs code on every bot cluster, returns an array of responses or errors

### `comms.masterEval(code: string)` *Note: master = Master*

Runs code on the master process

## Utility Functions

### `comms.sendWebhook(id: Snowflake, token: string, data: Message)`

Sends a webhook via the master process, immensely useful if you use webhooks a lot, useful to avoid hitting ratelimits and getting in trouble for it.

## Management Functions

### `comms.destroy()`

Destroys entire bot process by killing the master process

### `comms.log(msg: string)`

Logs a message to the MasterOptions.log

### `comms.restartCluster(id: ClusterID)`

Restarts cluster by it's ID

### `comms.restartShard(id: ShardID)`

Restarts a shard by it's ID

# In TypeScript

Using the bot in TypeScript is relatively simple.

You can easily add types by declaring a module change to `discord-rose/dist/typings/lib`

For examples;

```ts
declare module 'discord-rose/dist/typings/lib' {
  // Really nice, changing the worker in all instances
  // Like if you have your own class you want to be globally typed
  type Worker = MyWorkerClass

  // These two are nice for middleware stuff
  // Adding an option to CommandOptions
  interface CommandOptions {
    test?: boolean
  }
  // Adding a function to CommandContext
  interface CommandContext {
    func: (thing: string) => ...
  }
}
```