import { Shard } from './Shard'
import WebSocket from 'ws'
import { GatewayDispatchEvents, GatewayDispatchPayload, GatewayHelloData, GatewayOpcodes, GatewaySendPayload } from 'discord-api-types'

/**
 * Structure in charge of managing Discord communcation over websocket
 */
export class DiscordSocket {
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
  public selfClose = false

  private op7 = false

  constructor (private shard: Shard) {}

  public close (code: number, reason: string, report = true): void {
    if (!this.op7) this.shard.worker.log(`Shard ${this.shard.id} closing with ${code} & ${reason}`)
    if (report) this.selfClose = true

    this.ws?.close(code, reason)
  }

  async spawn (): Promise<void> {
    this.shard.worker.debug(`Shard ${this.shard.id} is spawning`)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.close(1012, 'Starting again', false)
    this.ws = null
    this.connected = false
    this.heartbeatRetention = 0
    this.waitingHeartbeat = false
    this.dying = false
    if (this.hbInterval) clearInterval(this.hbInterval)

    try {
      this.ws = new WebSocket(this.shard.worker.options.ws + '?v=' + String(this.shard.worker.options.rest?.version ?? 8))
    } catch (err) {
      if (this.connectTimeout) clearTimeout(this.connectTimeout)

      this.shard.restart(true, 1013)
    }

    this.connectTimeout = setTimeout(() => {
      if (!this.connected) return this.shard.restart(true, 1013, 'Didn\'t Connect in Time')
    }, 60e3)

    this.ws
      ?.on('message', (data) => this._handleMessage(data as Buffer))
      .once('close', (code, reason) => this.onClose(code, reason))
      .on('error', (err) => this.shard.worker.debug(`Received WS error on shard ${this.shard.id}: ${err.name} / ${err.message}`))
  }

  public _send (data: GatewaySendPayload): void {
    if (this.ws?.readyState !== this.ws?.OPEN) return
    this.ws?.send(JSON.stringify(data))
  }

  private _handleMessage (data: Buffer): void {
    const msg: GatewayDispatchPayload = JSON.parse(data.toString('utf-8'))

    if (msg.s) this.sequence = msg.s

    if (msg.op === GatewayOpcodes.Dispatch) {
      if ([GatewayDispatchEvents.Ready, GatewayDispatchEvents.Resumed].includes(msg.t)) {
        if (msg.t === GatewayDispatchEvents.Resumed) {
          if (this.op7) {
            this.op7 = false
          } else this.shard.worker.log(`Shard ${this.shard.id} resumed at sequence ${this.sequence ?? 0}`)
        }
        this.connected = true
        this.resuming = false
        clearTimeout(this.connectTimeout as NodeJS.Timeout)
      }
      if (msg.t === GatewayDispatchEvents.Ready) this.sessionID = msg.d.session_id

      void this.shard.emit(msg.t as any, msg.d)

      this.shard.worker.emit('*', msg as any)

      if ([GatewayDispatchEvents.Ready, GatewayDispatchEvents.GuildCreate, GatewayDispatchEvents.GuildDelete].includes(msg.t)) return

      this.shard.worker.emit(msg.t as any, msg.d)
    } else if (msg.op === GatewayOpcodes.Heartbeat) {
      this._heartbeat()
    } else if (msg.op === GatewayOpcodes.Reconnect) {
      this.op7 = true
      this.shard.restart(false, 1012, 'Opcode 7 Restart')
    } else if (msg.op === GatewayOpcodes.InvalidSession) {
      setTimeout(() => {
        if (!this.resuming) this.shard.restart(!msg.d, 1002, 'Invalid Session')
        else {
          this.shard.worker.debug(`Shard ${this.shard.id} could not resume, sending a fresh identify`)
          this.resuming = false
          this._sendIdentify()
        }
      }, Math.ceil(Math.random() * 5) * 1000)
    } else if (msg.op === GatewayOpcodes.Hello) {
      if (this.resuming && (!this.sessionID || !this.sequence)) {
        this.shard.worker.debug('Cancelling resume because of missing session info')

        this.resuming = false
        this.sequence = null
        this.sessionID = null
      }

      this.shard.worker.debug(`Received HELLO on shard ${this.shard.id}. ${this.resuming ? '' : 'Not '}Resuming. (Heartbeat @ 1/${(msg.d as unknown as GatewayHelloData).heartbeat_interval / 1000}s)`)

      if (this.resuming) {
        this._send({
          op: GatewayOpcodes.Resume,
          d: {
            token: this.shard.worker.options.token,
            session_id: this.sessionID as string,
            seq: this.sequence as number
          }
        })
      } else {
        this._sendIdentify()
      }
      this.hbInterval = setInterval(() => this._heartbeat(), (msg.d as unknown as GatewayHelloData).heartbeat_interval)
      this.waitingHeartbeat = false
      this.heartbeatRetention = 0
      this._heartbeat()
    } else if (msg.op === GatewayOpcodes.HeartbeatAck) {
      this.shard.worker.debug(`Heartbeat acknowledged on shard ${this.shard.id}`)
      this.heartbeatRetention = 0
      this.shard.ping = Date.now() - (this.waitingHeartbeat as number)

      this.waitingHeartbeat = false
      this.heartbeatRetention = 0
    }
  }

  private _sendIdentify (): void {
    this._send({
      op: GatewayOpcodes.Identify,
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

  private _heartbeat (): void {
    this.shard.worker.debug(`Heartbeat @ ${this.sequence ?? 'none'}. Retention at ${this.heartbeatRetention} on shard ${this.shard.id}`)
    if (this.waitingHeartbeat) {
      this.heartbeatRetention++

      if (this.heartbeatRetention > 5) return this.shard.restart(false, 1012, 'Not Receiving Heartbeats')
    }
    this._send({
      op: GatewayOpcodes.Heartbeat,
      d: this.sequence
    })
    this.waitingHeartbeat = Date.now()
  }

  private onClose (code: number, reason: string): void {
    this.shard.emit('CLOSED', code, reason)
    if (this.selfClose) {
      this.shard.worker.debug(`Self closed with code ${code}`)
      this.selfClose = false
    } else this.shard.worker.log(`Shard ${this.shard.id} closed with ${code} & ${reason || 'No Reason'}`)

    if (code === 1006) this.resuming = true

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
