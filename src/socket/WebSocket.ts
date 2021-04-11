import { Shard } from './Shard'
import WebSocket from 'ws'
import { Emitter } from '../utils/Emitter'
import { GatewayDispatchEvents, GatewayDispatchPayload, GatewayHelloData, GatewayOPCodes, GatewaySendPayload } from 'discord-api-types'
import { DiscordDefaultEventMap } from '../typings/Discord'

/**
 * Structure in charge of managing Discord communcation over websocket
 */
export class DiscordSocket extends Emitter<Pick<DiscordDefaultEventMap, 'READY' | 'GUILD_CREATE'>> {
  private connectTimeout?: NodeJS.Timeout
  private sequence: number | null = null
  private sessionID: string | null = null
  private hbInterval: NodeJS.Timeout | null = null
  private waitingHeartbeat: false | number = false
  private heartbeatRetention: number = 0

  public ws: WebSocket | null = null
  public connected: boolean = false
  public resuming: boolean = false
  public dying: boolean = false

  constructor (private shard: Shard) { super() }

  async spawn (): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close(1002)
    this.ws = null
    this.connected = false
    this.heartbeatRetention = 0
    this.waitingHeartbeat = false
    this.dying = false
    if (this.hbInterval) clearInterval(this.hbInterval)

    try {
      this.ws = new WebSocket(this.shard.worker.options.ws)
    } catch (err) {
      if (this.connectTimeout) clearTimeout(this.connectTimeout)

      this.shard.restart(true, 1013)
    }

    this.connectTimeout = setTimeout(() => {
      if (!this.connected) return this.shard.restart(true, 1013, 'Didn\'t Connect in Time')
    }, 60e3)

    this.ws?.on('message', (data) => this._handleMessage(data as Buffer))
    this.ws?.once('close', (code, reason) => this.close(code, reason))
  }

  public _send (data: GatewaySendPayload): void {
    if (this.ws?.readyState !== this.ws?.OPEN) return
    this.ws?.send(JSON.stringify(data))
  }

  private _handleMessage (data: Buffer): void {
    const msg: GatewayDispatchPayload = JSON.parse(data.toString('utf-8'))

    if (msg.s) this.sequence = msg.s

    if (msg.op === GatewayOPCodes.Dispatch) {
      if ([GatewayDispatchEvents.Ready, GatewayDispatchEvents.Resumed].includes(msg.t)) {
        this.connected = true
        clearTimeout(this.connectTimeout as NodeJS.Timeout)
      }
      if (msg.t === GatewayDispatchEvents.Ready) this.sessionID = msg.d.session_id

      if ([GatewayDispatchEvents.GuildCreate, GatewayDispatchEvents.Ready].includes(msg.t)) return void this.emit(msg.t as any, msg.d)

      this.shard.worker.emit('*', msg)

      if (msg.t === 'READY') return // To satisfy typings
      this.shard.worker.emit(msg.t, msg.d)
    } else if (msg.op === GatewayOPCodes.Heartbeat) {
      this._heartbeat()
    } else if (msg.op === GatewayOPCodes.Reconnect) {
      this.shard.restart(false, 1012, 'Opcode 7 Restart')
    } else if (msg.op === GatewayOPCodes.InvalidSession) {
      setTimeout(() => {
        this.shard.restart(!msg.d, 1002, 'Invalid Session')
      }, Math.ceil(Math.random() * 5) * 1000)
    } else if (msg.op === GatewayOPCodes.Hello) {
      if (this.resuming) {
        this._send({
          op: GatewayOPCodes.Resume,
          d: {
            token: this.shard.worker.options.token,
            session_id: this.sessionID as string,
            seq: this.sequence as number
          }
        })
        this.shard.worker.log(`Shard ${this.shard.id} resuming`)
      } else {
        this._send({
          op: GatewayOPCodes.Identify,
          d: {
            shard: [this.shard.id, this.shard.worker.options.shards],
            intents: this.shard.worker.options.intents,
            token: this.shard.worker.options.token,
            properties: {
              $os: 'linux',
              $browser: 'Discord-Rose',
              $device: 'bot'
            }
          }
        })
      }
      this.hbInterval = setInterval(() => this._heartbeat(), (msg.d as unknown as GatewayHelloData).heartbeat_interval)
      this.waitingHeartbeat = false
      this.heartbeatRetention = 0
      this._heartbeat()
    } else if (msg.op === GatewayOPCodes.HeartbeatAck) {
      this.heartbeatRetention = 0
      this.shard.ping = Date.now() - (this.waitingHeartbeat as number)

      this.waitingHeartbeat = false
      this.heartbeatRetention = 0
    }
  }

  private _heartbeat (): void {
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

  private close (code: number, reason: string): void {
    this.shard.worker.log(`Shard ${this.shard.id} closed with ${code} & ${reason || 'No Reason'}`)

    if (this.dying) void this.shard.register()
    else void this.spawn()
  }

  kill (): void {
    this.dying = true
    this.resuming = false
    this.sequence = null
    this.sessionID = null
  }
}
