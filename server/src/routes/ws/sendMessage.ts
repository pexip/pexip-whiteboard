import type { Connection } from '../../types/Connection'
import type { WebSocketMessage } from '../../types/WebsocketMessage'
import type { WebsocketMessageType } from '../../types/WebsocketMessageType'

const sendMessage = (conn: Connection, type: WebsocketMessageType, body: any): object => {
  const msg: WebSocketMessage = {
    type,
    body
  }
  conn.ws.send(JSON.stringify(msg))
  return msg
}

export { sendMessage }
