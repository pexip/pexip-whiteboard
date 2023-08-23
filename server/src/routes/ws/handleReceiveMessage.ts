import config from 'config'
import path from 'path'
import { createWhiteboardLink } from '../../whiteboard/whiteboard'
import { checkIfParticipantIsAllowed } from '../../infinity'
import { WebsocketMessageType } from '../../types/WebSocketMessageType'
import { getConnectionsByConference } from '../../connections/connections'
import { getLogger, logWs } from '../../logger'
import { sendMessage } from './sendMessage'

import type { Connection } from '../../connections/Connection'
import type { Provider } from '../../whiteboard/providers/Provider'
import type { WebSocketMessageBody } from '../../types/WebSocketMessageBody'

const logger = getLogger(path.basename(__filename))

const handleReceiveMessage = async (conn: Connection, msg: string): Promise<void> => {
  const msgParsed = JSON.parse(msg)
  let error = ''
  switch (msgParsed.type) {
    case WebsocketMessageType.Create: {
      try {
        const provider = msgParsed.body
        const link = await handleCreateWhiteboard(conn, provider)
        notifyWhiteboardCreated(conn, link)
      } catch (e: any) {
        error = e.message
      }
      break
    }
    default: {
      error = 'Unsupported message type'
    }
  }
  if (error !== '') {
    const msg = sendMessage(conn, WebsocketMessageType.Error, error)
    logWs({
      logger,
      level: 'error',
      connection: conn,
      message: error,
      body: msg
    })
  }
}

const handleCreateWhiteboard = async (conn: Connection, provider: Provider): Promise<string> => {
  if (!config.has('validateInfinityConference') || config.get('validateInfinityConference')) {
    await checkIfParticipantIsAllowed(conn.conference, conn.participantUuid)
  }
  if (provider == null) {
    provider = getDefaultProvider()
  }
  const link = await createWhiteboardLink(conn, provider)
  return link
}

const notifyWhiteboardCreated = (conn: Connection, link: string): void => {
  const connections = getConnectionsByConference(conn.conference)
  connections?.forEach((c: Connection) => {
    const isCreator = c.participantUuid === conn.participantUuid
    const type = isCreator ? WebsocketMessageType.Created : WebsocketMessageType.Invited
    const body: WebSocketMessageBody = {
      link
    }
    const isSendToChatActive: boolean = config.has('sendChatMessage') && config.get('sendChatMessage')
    if (isCreator && isSendToChatActive) {
      body.sendChatMessage = true
    }
    const msg = sendMessage(c, type, body)
    logWs({
      logger,
      connection: conn,
      message: 'Message Sent',
      body: msg
    })
  })
}

const getDefaultProvider = (): Provider => {
  return config.get('whiteboard.defaultProvider') ?? config.get('whiteboard.providers[0].id')
}

export { handleReceiveMessage }
