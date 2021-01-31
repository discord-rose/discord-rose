import { Shard } from "./Shard"
import WebSocket from 'ws'
import { EventEmitter } from 'events'
import { GatewayDispatchEvents, GatewayDispatchPayload, GatewayHelloData, GatewayIdentifyData, GatewayOPCodes, GatewayResumeData, GatewaySendPayload } from "discord-api-types"

export class DiscordSocket extends EventEmitter {
  private connectTimeout: NodeJS.Timeout
  private sequence: number
  private sessionID: string
  private hbInterval: NodeJS.Timeout
  private waitingHeartbeat: false | number
  private heartbeatRetention: number

  public ws: WebSocket
  public connected: boolean
  public resuming: boolean = false
  public dying: boolean = false

  constructor (private shard: Shard) { super() }

  async spawn (resolve?: () => void) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close(1005)
    this.ws = null
    this.connected = false
    this.heartbeatRetention = 0
    this.waitingHeartbeat = false
    this.dying = false
    if (this.hbInterval) clearInterval(this.hbInterval)

    if (resolve) this.once('READY', () => resolve())

    this.ws = new WebSocket(this.shard.worker.options.ws)

    this.connectTimeout = setTimeout(() => {
      if (!this.connected) return this.shard.restart(true, 1013, 'Didn\'t Connect in Time')
    }, 30e3)

    this.ws.on('message', (data) => this._handleMessage(data))
    this.ws.once('close', (code, reason) => this.close(code, reason))
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

      this.shard.worker.emit(msg.t, msg.d)
    } else if (msg.op === GatewayOPCodes.Heartbeat) {
      this._heartbeat()
    } else if (msg.op === GatewayOPCodes.Reconnect) {
      this.shard.restart(false, 1012, 'Opcode 7 Restart')
    } else if (msg.op === GatewayOPCodes.InvalidSession) {
      this.shard.restart(!msg.d, 1002, 'Invalid Session')
    } else if (msg.op === GatewayOPCodes.Hello) {
      if (this.resuming) {
        this._send({
          op: GatewayOPCodes.Resume,
          d: {
            token: this.shard.worker.options.token,
            session_id: this.sessionID,
            seq: this.sequence
          }
        })
        this.shard.worker.log(`Shard ${this.shard.id} resuming.`)
      } else {
        this._send({
          op: GatewayOPCodes.Identify, 
          d: {
            shard: [this.shard.id, this.shard.worker.options.shards as number],
            intents: this.shard.worker.options.intents as number,
            token: this.shard.worker.options.token,
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

      if (this.heartbeatRetention > 5) return this.shard.restart(false, 1006, 'Not Receiving Heartbeats')
    }
    this._send({
      op: GatewayOPCodes.Heartbeat, 
      d: this.sequence
    })
    this.waitingHeartbeat = Date.now()
  }

  private close (code: number, reason: string) {
    this.shard.worker.log(`Shard ${this.shard.id} closed with ${code} & ${reason || 'No Reason'}`)

    if (this.dying) this.shard.register()
    else this.spawn()
  }

  kill () {
    this.dying = true
    this.resuming = false
    this.sequence = null
    this.sessionID = null
  }
}