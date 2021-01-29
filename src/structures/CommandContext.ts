import Worker from "../clustering/worker/Worker"
import { APIMessage, RESTPostAPIChannelMessageJSONBody } from "discord-api-types";

import { Embed } from './Embed'
import { MessageTypes } from "../rest/resources/Messages";

export class CommandContext {
  public args: string[] = []

  constructor (private worker: Worker, public message: APIMessage) {}

  get guild () {
    return this.worker.guilds.get(this.message.guild_id)
  }

  /**
   * Replies to the invoking message
   * @param data Data for message
   */
  reply (data: MessageTypes) {
    return this.worker.api.messages.send(this.message.channel_id, data, {
      message_id: this.message.id,
      channel_id: this.message.channel_id,
      guild_id: this.message.guild_id
    })
  }

  /**
   * Sends a message in the same channel as invoking message
   * @param data Data for message
   */
  send (data: MessageTypes) {
    return this.worker.api.messages.send(this.message.channel_id, data)
  }

  /**
   * Deletes the invoking message
   */
  delete () {
    return this.worker.api.messages.delete(this.message.channel_id, this.message.id)
  }

  get embed () {
    return new Embed((embed, reply) => {
      if (reply) this.reply(embed)
      else this.send(embed)
    })
  }
}