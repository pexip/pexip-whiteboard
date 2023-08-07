import { handleNewConnection } from './handleNewConnection'

import type { WebSocket } from 'ws'
import type { Connection } from '../../types/Connection'
import type { Request } from 'express'

const mockAddConnection = jest.fn()
jest.mock('./connections', () => ({
  addConnection: (conn: Connection) => mockAddConnection(conn)
}))

describe('handleNewConnection', () => {
  it('should save the new connection in the array of connections', () => {
    const ws: WebSocket = {
      on: jest.fn()
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
      on: jest.fn()
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
})
