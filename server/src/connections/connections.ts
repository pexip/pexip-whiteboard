import type { Connection } from './Connection'

let connections: Connection[] = []

const setConnections = (conns: Connection[]): void => {
  connections = conns
}

const getConnections = (): Connection[] => {
  return connections
}

const addConnection = (conn: Connection): void => {
  connections.push(conn)
}

const getConnectionByParticipant = (participantUuid: string): Connection | null => {
  return connections.find((conn) => conn.participantUuid === participantUuid) ?? null
}

const getConnectionsByConference = (conference: string): Connection[] | null => {
  return connections.filter((conn) => conn.conference === conference) ?? null
}

const removeConnection = (conn: Connection): void => {
  connections.forEach((c, index) => {
    if (c.participantUuid === conn.participantUuid) {
      connections.splice(index, 1)
    }
  })
}

export {
  addConnection,
  setConnections,
  getConnections,
  getConnectionByParticipant,
  getConnectionsByConference,
  removeConnection
}
