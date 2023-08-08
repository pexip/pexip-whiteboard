import { handleNewConnection } from './handleNewConnection'
import { setWhiteboardList } from '../../whiteboard/whiteboard'
import { Provider } from '../../whiteboard/providers/Provider'
import { WebsocketMessageType } from '../../types/WebsocketMessageType'
import { setConnections } from '../../connections/connections'

import type { WebSocket } from 'ws'
import type { Connection } from '../../connections/Connection'
import type { Request } from 'express'

const mockAddConnection = jest.fn()
jest.mock('../../connections/connections', () => ({
  ...jest.requireActual('../../connections/connections'),
  addConnection: (conn: Connection) => mockAddConnection(conn)
}))

const mockSendMessage = jest.fn()
jest.mock('./sendMessage', () => ({
  sendMessage: (conn: Connection, type: WebsocketMessageType, body: string) => mockSendMessage(conn, type, body)
}))

const conn1: Connection = {
  ws: {
    on: jest.fn(),
    send: jest.fn()
  } as unknown as WebSocket,
  conference: 'my-conference',
  participantUuid: 'participantUuid1'
}

const conn2: Connection = {
  ws: {
    on: jest.fn(),
    send: jest.fn()
  } as unknown as WebSocket,
  conference: 'my-conference',
  participantUuid: 'participantUuid2'
}

const conn3: Connection = {
  ws: {
    on: jest.fn(),
    send: jest.fn()
  } as unknown as WebSocket,
  conference: 'my-conference1',
  participantUuid: 'participantUuid3'
}

describe('handleNewConnection', () => {
  it('should save the new connection in the array of connections', () => {
    const ws: WebSocket = {
      on: jest.fn(),
      send: jest.fn()
    } as unknown as WebSocket
    const req: Request = {
      params: {
        conference: 'my-conference',
        participantUuid: 'my-participant-uuid'
      }
    } as unknown as Request
    handleNewConnection(ws, req)
    expect(mockAddConnection).toBeCalledTimes(1)
    expect(mockAddConnection).toBeCalledWith({
      ws,
      conference: req.params.conference,
      participantUuid: req.params.participantUuid
    })
  })

  it('should subscribe to the on close and message events', () => {
    const ws: WebSocket = {
      on: jest.fn(),
      send: jest.fn()
    } as unknown as WebSocket
    const req: Request = {
      params: {
        conference: 'my-conference',
        participantUuid: 'my-participant-uuid'
      }
    } as unknown as Request
    handleNewConnection(ws, req)
    expect(ws.on).toBeCalledTimes(2)
    expect(ws.on).toBeCalledWith('close', expect.any(Function))
    expect(ws.on).toBeCalledWith('message', expect.any(Function))
  })

  it('should send an invitation if there is whiteboard active for that conference', () => {
    const ws: WebSocket = {
      on: jest.fn(),
      send: jest.fn()
    } as unknown as WebSocket
    const req: Request = {
      params: {
        conference: 'my-conference',
        participantUuid: 'my-participant-uuid'
      }
    } as unknown as Request
    const conn: Connection = {
      ws: {
        on: jest.fn(),
        send: jest.fn()
      } as unknown as WebSocket,
      conference: req.params.conference,
      participantUuid: req.params.participantUuid
    }
    setConnections([conn, conn1, conn2, conn3])
    setWhiteboardList([{
      conference: req.params.conference,
      provider: Provider.Conceptboard,
      whiteboardLink: 'link'
    }])
    handleNewConnection(ws, req)
    expect(mockSendMessage).toBeCalledTimes(1)
    expect(JSON.stringify(mockSendMessage.mock.calls[0][0])).toBe(JSON.stringify(conn))
    expect(mockSendMessage).toBeCalledWith(expect.anything(), WebsocketMessageType.Invited, 'link')
  })
})
