import type WebSocket from 'ws'

export interface Connection {
  ws: WebSocket
  conference: string
  participantUuid: string
}
