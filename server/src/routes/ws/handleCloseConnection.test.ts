import { handleCloseConnection } from './handleCloseConnection'

import type { WebSocket } from 'ws'
import type { Connection } from '../../connections/Connection'

const conn: Connection = {
  ws: null as unknown as WebSocket,
  conference: 'my-conference',
  participantUuid: 'participantUuid'
}

let connections: Connection[] = []

const mockDeleteWhiteboardLink = jest.fn(async (conference: string) => await Promise.resolve(null))
jest.mock('../../whiteboard/whiteboard', () => ({
  getWhiteboardLink: () => 'link',
  deleteWhiteboardLink: async (conference: string) => await mockDeleteWhiteboardLink(conference)
}))

const mockRemoveConnection = jest.fn()
jest.mock('../../connections/connections', () => ({
  getConnections: jest.fn(() => connections),
  removeConnection: (conn: Connection) => mockRemoveConnection(conn)
}))

describe('handleCloseConnection', () => {
  beforeEach(() => {
    mockDeleteWhiteboardLink.mockClear()
    mockRemoveConnection.mockClear()
    connections = [conn]
  })

  it('should call deleteWhiteboardLink', () => {
    handleCloseConnection(conn)
    expect(mockDeleteWhiteboardLink).toBeCalledTimes(1)
    expect(mockDeleteWhiteboardLink).toBeCalledWith(conn.conference)
  })

  it('should call removeConnection', () => {
    const conn: Connection = {
      ws: null as unknown as WebSocket,
      conference: 'my-conference',
      participantUuid: 'participantUuid'
    }
    handleCloseConnection(conn)
    expect(mockRemoveConnection).toBeCalledTimes(1)
    expect(mockRemoveConnection).toBeCalledWith(conn)
  })

  it('should call deleteWhiteboardLink even if deleteWhiteboardLink failed', () => {
    const conn: Connection = {
      ws: null as unknown as WebSocket,
      conference: 'my-conference',
      participantUuid: 'participantUuid'
    }
    mockDeleteWhiteboardLink.mockRejectedValue(null)
    handleCloseConnection(conn)
    expect(mockDeleteWhiteboardLink).toBeCalledTimes(1)
    expect(mockDeleteWhiteboardLink).toBeCalledWith(conn.conference)
    expect(mockRemoveConnection).toBeCalledTimes(1)
    expect(mockRemoveConnection).toBeCalledWith(conn)
  })
})
