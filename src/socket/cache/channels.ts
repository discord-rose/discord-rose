import Collection from '@discordjs/collection';
import Worker from '../../clustering/worker/Worker';
import { InternalEvents } from './InternalEvents';

export function channels (events: InternalEvents, worker: Worker) {
  worker.channels = new Collection()

  events.add('CHANNEL_CREATE', (channel) => {
    worker.channels.set(channel.id, channel)
  })

  events.add('CHANNEL_UPDATE', (channel) => {
    const currentChannel = worker.channels.get(channel.id)

    currentChannel.name = channel.name
    currentChannel.type = channel.type
    currentChannel.position = channel.position
    currentChannel.topic = channel.topic
    currentChannel.nsfw = channel.nsfw
    currentChannel.rate_limit_per_user = channel.rate_limit_per_user
    currentChannel.bitrate = channel.bitrate
    currentChannel.user_limit = channel.user_limit
    currentChannel.permission_overwrites = channel.permission_overwrites
    currentChannel.parent_id = channel.parent_id
    
    worker.channels.set(channel.id, currentChannel)
  })

  events.add('CHANNEL_DELETE', (channel) => {
    worker.channels.delete(channel.id)
  })
}