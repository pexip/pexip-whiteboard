import path from 'path'
import { Provider } from './providers/Provider'
import {
  checkCollaboardConnection,
  createCollaboardLink,
  deleteCollaboardLink
} from './providers/collaboard'
import {
  checkConceptboardConnection,
  createConceptboardLink,
  deleteConceptboardLink
} from './providers/conceptboard'
import { getLogger } from '../logger'

import type { Connection } from '../connections/Connection'
import type { WhiteboardInfo } from './WhiteboardInfo'

const logger = getLogger(path.basename(__filename))

let whiteboardList: WhiteboardInfo[] = []

const checkWhiteboardConnection = async (provider: Provider): Promise<void> => {
  switch (provider) {
    case Provider.Collaboard: {
      logger.info('Checking Collaboard connection...')
      await checkCollaboardConnection()
      logger.info('Collaboard connection OK!')
      break
    }
    case Provider.Conceptboard: {
      logger.info('Checking Conceptboard connection...')
      await checkConceptboardConnection()
      logger.info('Conceptboard connection OK!')
      break
    }
    default:
      throw new Error('Unknown whiteboard provider')
  }
}

const getWhiteboardLink = (conference: string): string | null => {
  const whiteboardInfo = whiteboardList.find((whiteboardInfo) => whiteboardInfo.conference === conference)
  return whiteboardInfo != null ? whiteboardInfo.whiteboardLink : null
}

const createWhiteboardLink = async (conn: Connection, provider: Provider): Promise<string> => {
  const conference = conn.conference
  let whiteboardInfo: WhiteboardInfo
  switch (provider) {
    case Provider.Collaboard: {
      whiteboardInfo = await createCollaboardLink(conference)
      break
    }
    case Provider.Conceptboard: {
      whiteboardInfo = await createConceptboardLink(conference)
      break
    }
    default: {
      throw new Error('Unknown whiteboard provider')
    }
  }
  whiteboardList.push(whiteboardInfo)
  return whiteboardInfo.whiteboardLink
}

const deleteWhiteboardLink = async (conference: string): Promise<void> => {
  const index = whiteboardList.findIndex((whiteboard) => whiteboard.conference === conference)
  const whiteboardInfo = whiteboardList[index]

  whiteboardList.splice(index, 1)

  switch (whiteboardInfo.provider) {
    case Provider.Collaboard: {
      await deleteCollaboardLink(whiteboardInfo)
      break
    }
    case Provider.Conceptboard: {
      await deleteConceptboardLink(whiteboardInfo)
      break
    }
    default: {
      throw new Error('Unknown whiteboard provider')
    }
  }
}

const setWhiteboardList = (list: WhiteboardInfo[]): void => {
  whiteboardList = list
}

export {
  checkWhiteboardConnection,
  getWhiteboardLink,
  createWhiteboardLink,
  deleteWhiteboardLink,
  setWhiteboardList
}
