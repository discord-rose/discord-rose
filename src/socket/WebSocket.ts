import { Shard } from "./Shard"
import WebSocket from 'ws'
import { EventEmitter } from 'events'
import { GatewayDispatchEvents, GatewayDispatchPayload, GatewayHelloData, GatewayIdentifyData, GatewayOPCodes, GatewayResumeData, GatewaySendPayload } from "discord-api-types"

export class DiscordSocket extends EventEmitter {
  private connectTimeout: NodeJS.Timeout
  private sequence: number
  private sessionID: string
  private hbInterval: NodeJS.Timeout
  private waitingHeartbeat: false|number = false
  private heartbeatRetention: number = 0

  public ws: WebSocket = null
  public connected: boolean = false
  public resuming: boolean = false

  constructor (private shard: Shard) { super() }

  async spawn (resolve: () => void) {
    this.once('READY', () => resolve())

    this.ws = new WebSocket(this.shard.client.options.ws)

    this.connected = false

    this.connectTimeout = setTimeout(() => {
      if (!this.connected) return this.shard.restart()
    }, 30e3)

    this.ws.on('message', (data) => this._handleMessage(data))
    this.ws.on('close', (code, reason) => this.close(code, reason))
  }

  private _send (data: GatewaySendPayload) {
    this.ws.send(JSON.stringify(data))
  }

  private _handleMessage (data: WebSocket.Data) {
    const msg: GatewayDispatchPayload = JSON.parse(data.toString('utf-8'))
    
    if (msg.s) this.sequence = msg.s

    if (msg.op === GatewayOPCodes.Dispatch) {
      if ([GatewayDispatchEvents.Ready, GatewayDispatchEvents.Resumed].includes(msg.t)) {
        this.connected = true
        clearTimeout(this.connectTimeout)
      }
      if (msg.t === GatewayDispatchEvents.Ready) this.sessionID = msg.d.session_id

      if ([GatewayDispatchEvents.GuildCreate, GatewayDispatchEvents.Ready].includes(msg.t)) return this.emit(msg.t, msg.d)

      this.shard.client.emit(msg.t, msg.d)
    } else if (msg.op === GatewayOPCodes.Heartbeat) {
      this._heartbeat()
    } else if (msg.op === GatewayOPCodes.Reconnect) {

    } else if (msg.op === GatewayOPCodes.InvalidSession) {

    } else if (msg.op === GatewayOPCodes.Hello) {
      if (this.resuming) {
        this._send({
          op: GatewayOPCodes.Resume,
          d: {
            token: this.shard.client.options.token,
            session_id: this.sessionID,
            seq: this.sequence
          }
        })
      } else {
        this._send({
          op: GatewayOPCodes.Identify, 
          d: {
            shard: [this.shard.id, this.shard.client.options.shards as number],
            intents: 32509,
            token: this.shard.client.options.token,
            properties: {
              $os: 'linux',
              $browser: 'Discord-Rose',
              $device: 'bot'
            }
          }
        })
      }
      this.hbInterval = setInterval(this._heartbeat.bind(this), (msg.d as unknown as GatewayHelloData).heartbeat_interval)
      this.waitingHeartbeat = false
      this.heartbeatRetention = 0
      // this._heartbeat()
    } else if (msg.op === GatewayOPCodes.HeartbeatAck) {
      this.heartbeatRetention = 0
      this.shard.ping = Date.now() - (this.waitingHeartbeat as number)
      
      this.waitingHeartbeat = false
      this.heartbeatRetention = 0
    }
  }

  private _heartbeat () {
    if (this.waitingHeartbeat) {
      this.heartbeatRetention++

      if (this.heartbeatRetention > 5) return this.shard.restart()
    }
    this._send({
      op: GatewayOPCodes.Heartbeat, 
      d: this.sequence
    })
    this.waitingHeartbeat = Date.now()
  }

  close (code: number, reason: string) {
    console.log(`Shard ${this.shard.id} with ${code} & ${reason}`)
  }
}