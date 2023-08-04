import path from 'path'
import { Provider } from '../types/Provider'
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

import type { Connection } from '../types/Connection'

const logger = getLogger(path.basename(__filename))

interface WhiteboardInfo {
  conference: string
  whiteboardLink: string
  provider: Provider
}

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
  let link = ''
  switch (provider) {
    case Provider.Collaboard: {
      link = await createCollaboardLink(conference)
      break
    }
    case Provider.Conceptboard: {
      link = await createConceptboardLink(conference)
      break
    }
    default: {
      throw new Error('Unknown whiteboard provider')
    }
  }
  whiteboardList.push({
    conference,
    whiteboardLink: link,
    provider
  })
  return link
}

const deleteWhiteboardLink = async (conference: string): Promise<void> => {
  const index = whiteboardList.findIndex((whiteboard) => whiteboard.conference === conference)
  const whiteboardInfo = whiteboardList[index]

  whiteboardList.splice(index, 1)

  switch (whiteboardInfo.provider) {
    case Provider.Collaboard: {
      await deleteCollaboardLink(conference)
      break
    }
    case Provider.Conceptboard: {
      await deleteConceptboardLink(conference)
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
