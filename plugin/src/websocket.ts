import { config } from './config'
import { WebSocketMessageType } from './types/WebSocketMessageType'
import {
  showCreatedSuccessfulPanel,
  showInvitedPanel,
  showErrorPanel
} from './panel'
import { getPlugin } from './plugin'
import { setPopUpLink } from './popUp'
import { setButtonLink } from './button'

let ws: WebSocket
let reconnectTimeout: NodeJS.Timeout
let pingPongInterval: NodeJS.Timeout

const connectWebSocket = (conference: string, participantUuid: string): void => {
  const server = config.server
  ws = new WebSocket(`${server}/ws/${conference}/${participantUuid}`)
  ws.onmessage = onWebSocketMessage
  ws.onclose = (event) => {
    if (!event.wasClean) {
      tryReconnect(conference, participantUuid)
    }
  }
  ws.onopen = (event) => {
    pingPongInterval = setInterval(sendPing, 30000)
  }
}

const disconnectWebSocket = (): void => {
  clearTimeout(reconnectTimeout)
  clearInterval(pingPongInterval)
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
      setPopUpLink(link)
      if (shouldSendMessage) {
        await getPlugin().conference.sendMessage({
          payload: `Shared a new whiteboard: ${link}`
        })
      }
      await showCreatedSuccessfulPanel(link)
      await setButtonLink(link)
      break
    }
    case WebSocketMessageType.Invited: {
      const link = message.body.link
      setPopUpLink(link)
      await showInvitedPanel(link)
      await setButtonLink(link)
      break
    }
    case WebSocketMessageType.Error: {
      const error = message.body
      await showErrorPanel(error)
      break
    }
    case WebSocketMessageType.PONG: {
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

const sendPing = (): void => {
  ws.send(JSON.stringify({ type: WebSocketMessageType.PING }))
}

export {
  connectWebSocket,
  disconnectWebSocket,
  getWebSocket
}
