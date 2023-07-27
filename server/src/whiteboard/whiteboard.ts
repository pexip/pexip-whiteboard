import { Provider } from './providers/provider'
import {
  checkCollaboardConnection,
  createCollaboardLink
} from './providers/collaboard'
import {
  checkConceptboardConnection,
  createConceptboardLink
} from './providers/conceptboard'
import Debug from 'debug'

const debug = Debug('whiteboard-server:whiteboard')

const checkWhiteboardConnection = async (provider: Provider): Promise<void> => {
  switch (provider) {
    case Provider.Collaboard: {
      debug('Checking Collaboard connection...')
      await checkCollaboardConnection()
      debug('Collaboard connection OK!')
      break
    }
    case Provider.Conceptboard: {
      debug('Checking Conceptboard connection...')
      await checkConceptboardConnection()
      debug('Conceptboard connection OK!')
      break
    }
  }
}

const createWhiteboardLink = async (provider: Provider, conference: string): Promise<string> => {
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
  }
  return link
}

export {
  checkWhiteboardConnection,
  createWhiteboardLink
}
