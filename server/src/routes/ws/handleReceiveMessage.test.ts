import { handleReceiveMessage } from './handleReceiveMessage'
import { WebsocketMessageType } from '../../types/WebSocketMessageType'
import { setConnections } from '../../connections/connections'

import type { WebSocket } from 'ws'
import type { Connection } from '../../connections/Connection'
import type { WebSocketMessage } from '../../types/WebSocketMessage'

const mockCreateWhiteboardLink = jest.fn((conn, msg) => conn.conference)
jest.mock('../../whiteboard/whiteboard', () => ({
  createWhiteboardLink: (conn: Connection, msg: string) => mockCreateWhiteboardLink(conn, msg)
}))

const mockSendMessage = jest.fn()
jest.mock('./sendMessage', () => ({
  sendMessage: (conn: Connection, type: WebsocketMessageType, body: string) => mockSendMessage(conn, type, body)
}))

const conn: Connection = {
  ws: {
    send: jest.fn()
  } as unknown as WebSocket,
  conference: 'my-conference',
  participantUuid: 'participantUuid'
}

const conn1: Connection = {
  ws: {
    send: jest.fn()
  } as unknown as WebSocket,
  conference: 'my-conference',
  participantUuid: 'participantUuid1'
}

const conn2: Connection = {
  ws: {
    send: jest.fn()
  } as unknown as WebSocket,
  conference: 'my-conference',
  participantUuid: 'participantUuid2'
}

const conn3: Connection = {
  ws: {
    send: jest.fn()
  } as unknown as WebSocket,
  conference: 'my-conference1',
  participantUuid: 'participantUuid3'
}

describe('handleReceiveMessage', () => {
  beforeEach(() => {
    mockCreateWhiteboardLink.mockClear()
    mockSendMessage.mockClear()
  })
  it('should call handleCreateWhiteboardLink to create the link', async () => {
    const provider = 'conceptboard'
    const msg: WebSocketMessage = {
      type: WebsocketMessageType.Create,
      body: provider
    }
    await handleReceiveMessage(conn, JSON.stringify(msg))
    expect(mockCreateWhiteboardLink).toBeCalledTimes(1)
    expect(mockCreateWhiteboardLink).toBeCalledWith(conn, provider)
  })

  it('should select the defaultProvider if it isn\'t include in the request', async () => {
    const conn: Connection = {
      ws: {
        send: jest.fn()
      } as unknown as WebSocket,
      conference: 'my-conference',
      participantUuid: 'participantUuid'
    }
    const msg: WebSocketMessage = {
      type: WebsocketMessageType.Create
    }
    await handleReceiveMessage(conn, JSON.stringify(msg))
    expect(mockCreateWhiteboardLink).toBeCalledTimes(1)
    expect(mockCreateWhiteboardLink).toBeCalledWith(conn, 'collaboard')
  })

  it('should send messages to all participants', async () => {
    const msg: WebSocketMessage = {
      type: WebsocketMessageType.Create
    }
    setConnections([conn, conn1, conn2, conn3])
    await handleReceiveMessage(conn, JSON.stringify(msg))
    expect(mockSendMessage).toBeCalledTimes(3)
    expect(mockSendMessage).toBeCalledWith(conn, WebsocketMessageType.Created, {
      link: conn.conference
    })
    expect(mockSendMessage).toBeCalledWith(conn1, WebsocketMessageType.Invited, {
      link: conn.conference
    })
    expect(mockSendMessage).toBeCalledWith(conn2, WebsocketMessageType.Invited, {
      link: conn.conference
    })
  })

  it('should deliver an error message if the whiteboard cannot be created', async () => {
    const msg: WebSocketMessage = {
      type: WebsocketMessageType.Create
    }
    setConnections([conn, conn1, conn2, conn3])
    mockCreateWhiteboardLink.mockRejectedValue({ message: 'error' })
    await handleReceiveMessage(conn, JSON.stringify(msg))
    expect(mockSendMessage).toBeCalledTimes(1)
    expect(mockSendMessage).toBeCalledWith(conn, WebsocketMessageType.Error, 'error')
  })

  it('should send an error if the WebSocketMessageType is not supported', async () => {
    const msg: WebSocketMessage = {
      type: 'unknown' as WebsocketMessageType
    }
    setConnections([conn, conn1, conn2, conn3])
    await handleReceiveMessage(conn, JSON.stringify(msg))
    expect(mockSendMessage).toBeCalledTimes(1)
    expect(mockSendMessage).toBeCalledWith(conn, WebsocketMessageType.Error, 'Unsupported message type')
  })
})
