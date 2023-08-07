import type { WebsocketMessageType } from './WebsocketMessageType'

export interface WebSocketMessage {
  type: WebsocketMessageType
  body?: any
}
