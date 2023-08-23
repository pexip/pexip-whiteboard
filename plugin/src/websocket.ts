import { config } from './config'
import { WebSocketMessageType } from './types/WebSocketMessageType'
import {
  showCreatedSuccessfulPanel,
  showInvitedPanel,
  showErrorPanel
} from './panel'
import { setWhiteboardLink } from './whiteboardLink'
import { getPlugin } from './plugin'

let ws: WebSocket
let reconnectTimeout: NodeJS.Timeout

const connectWebSocket = (conference: string, participantUuid: string): void => {
  const server = config.server
  ws = new WebSocket(`${server}/ws/${conference}/${participantUuid}`)
  ws.onmessage = onWebSocketMessage
  ws.onclose = (event) => {
    if (!event.wasClean) {
      tryReconnect(conference, participantUuid)
    }
  }
}

const disconnectWebSocket = (): void => {
  clearTimeout(reconnectTimeout)
  ws.close()
}

const getWebSocket = (): WebSocket => {
  return ws
}

const onWebSocketMessage = async (event: any): Promise<void> => {
  console.log(event)
  const message = JSON.parse(event.data)
  switch (message.type) {
    case WebSocketMessageType.Created: {
      const link: string = message.body.link
      const shouldSendMessage = message.body.sendChatMessage === true
      setWhiteboardLink(link)
      if (shouldSendMessage) {
        await getPlugin().conference.sendMessage({
          payload: `Shared a new whiteboard: ${link}`
        })
      }
      await showCreatedSuccessfulPanel(link)
      break
    }
    case WebSocketMessageType.Invited: {
      const link = message.body.link
      setWhiteboardLink(link)
      await showInvitedPanel(link)
      break
    }
    case WebSocketMessageType.Error: {
      const error = message.body
      await showErrorPanel(error)
      break
    }
  }
}

const tryReconnect = (conference: string, participantUuid: string): void => {
  const timeout = 5000
  console.log(`Trying to reconnect whiteboard websocket in ${timeout / 1000}s`)
  reconnectTimeout = setTimeout(() => {
    connectWebSocket(conference, participantUuid)
  }, timeout)
}

export {
  connectWebSocket,
  disconnectWebSocket,
  getWebSocket
}
