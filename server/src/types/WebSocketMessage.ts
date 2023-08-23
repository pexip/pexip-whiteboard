import type { WebsocketMessageType } from './WebSocketMessageType'
import type { WebSocketMessageBody } from './WebSocketMessageBody'

export interface WebSocketMessage {
  type: WebsocketMessageType
  body?: WebSocketMessageBody
}
