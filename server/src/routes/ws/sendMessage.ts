import type { Connection } from '../../connections/Connection'
import type { WebSocketMessage } from '../../types/WebSocketMessage'
import type { WebsocketMessageType } from '../../types/WebSocketMessageType'
import type { WebSocketMessageBody } from '../../types/WebSocketMessageBody'

const sendMessage = (conn: Connection, type: WebsocketMessageType, body: WebSocketMessageBody): object => {
  const msg: WebSocketMessage = {
    type,
    body
  }
  conn.ws.send(JSON.stringify(msg))
  return msg
}

export { sendMessage }
