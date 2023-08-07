import { addConnection, getConnectionByParticipant, getConnections, getConnectionsByConference, removeConnection, setConnections } from './connections'

import type { Connection } from '../../types/Connection'
import type { WebSocket } from 'ws'

beforeEach(() => {
  setConnections([])
})

describe('addConnection', () => {
  it('should add the connection to the array', () => {
    const newConnection: Connection = {
      ws: null as unknown as WebSocket,
      conference: 'my-conference',
      participantUuid: 'my-participant-uuid'
    }
    addConnection(newConnection)
    expect(getConnections()).toStrictEqual([newConnection])
  })
})

describe('getConnectionByParticipant', () => {
  const participantUuid = 'my-participant-uuid'
  const connection: Connection = {
    ws: null as unknown as WebSocket,
    conference: 'my-conference',
    participantUuid
  }

  beforeEach(() => {
    setConnections([connection])
  })

  it('should recover the connection for the participant UUID', () => {
    const conn = getConnectionByParticipant(participantUuid)
    expect(conn).toStrictEqual(connection)
  })

  it('should return null if the participant UUID doesn\'t exist', () => {
    const participantUuid = 'unknown'
    const conn = getConnectionByParticipant(participantUuid)
    expect(conn).toBeNull()
  })
})

describe('getConnectionsByConference', () => {
  const conference = 'my-conference'
  const connection1: Connection = {
    ws: null as unknown as WebSocket,
    conference,
    participantUuid: 'my-participant-uuid1'
  }
  const connection2: Connection = {
    ws: null as unknown as WebSocket,
    conference,
    participantUuid: 'my-participant-uuid2'
  }
  const connection3: Connection = {
    ws: null as unknown as WebSocket,
    conference: 'other-conference',
    participantUuid: 'my-participant-uuid3'
  }

  beforeEach(() => {
    setConnections([connection1, connection2, connection3])
  })

  it('should recover all the connections for that conference', () => {
    const conns = getConnectionsByConference(conference)
    expect(conns).toStrictEqual([connection1, connection2])
  })

  it('should return an empty array if the conference doesn\'t exist', () => {
    const wrongConference = 'wrong-conference'
    const conns = getConnectionsByConference(wrongConference)
    expect(conns).toStrictEqual([])
  })
})

describe('removeConnection', () => {
  const conference = 'my-conference'
  const connection1: Connection = {
    ws: null as unknown as WebSocket,
    conference,
    participantUuid: 'my-participant-uuid1'
  }
  const connection2: Connection = {
    ws: null as unknown as WebSocket,
    conference,
    participantUuid: 'my-participant-uuid2'
  }
  const connection3: Connection = {
    ws: null as unknown as WebSocket,
    conference,
    participantUuid: 'my-participant-uuid3'
  }

  beforeEach(() => {
    setConnections([connection1, connection2, connection3])
  })

  it('should be able to remove the first element', () => {
    removeConnection(connection1)
    expect(getConnections()).toStrictEqual([connection2, connection3])
  })

  it('should be able to remove the element in the middle', () => {
    removeConnection(connection2)
    expect(getConnections()).toStrictEqual([connection1, connection3])
  })

  it('should be able to remove the last element', () => {
    removeConnection(connection3)
    expect(getConnections()).toStrictEqual([connection1, connection2])
  })
})
