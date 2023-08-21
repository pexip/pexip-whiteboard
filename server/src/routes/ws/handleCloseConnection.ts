import path from 'path'
import { getLogger, logWs } from '../../logger'
import { deleteWhiteboardLink } from '../../whiteboard/whiteboard'
import { getConnections, removeConnection } from '../../connections/connections'

import type { Connection } from '../../connections/Connection'

const logger = getLogger(path.basename(__filename))

const handleCloseConnection = (conn: Connection): void => {
  logWs({
    logger,
    connection: conn,
    message: 'Disconnected'
  })
  // If it's the last user, we delete the whiteboard
  const connections = getConnections()
  const participantsNumber = connections.filter((connection) => connection.conference === conn.conference).length
  if (participantsNumber === 1) {
    logger.info(`The last participant from conference "${conn.conference}" left.`)
    logger.info(`Removing whiteboard for "${conn.conference}...`)
    deleteWhiteboardLink(conn.conference).catch((e) => {
      logWs({
        logger,
        level: 'error',
        connection: conn,
        message: e
      })
    })
  }
  removeConnection(conn)
}

export { handleCloseConnection }
