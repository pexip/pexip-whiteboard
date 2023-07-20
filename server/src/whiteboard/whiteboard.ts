import config from 'config'
import { Provider } from './providers/provider'
import {
  checkCollaboardConnection,
  createCollaboardLink
} from './providers/collaboard'
import {
  checkConceptboardConnection,
  createConceptboardLink
} from './providers/conceptboard'

const provider = config.get('whiteboard.provider')

const checkWhiteboardConnection = async (): Promise<void> => {
  switch (provider) {
    case Provider.Collaboard: {
      await checkCollaboardConnection()
      break
    }
    case Provider.Conceptboard: {
      await checkConceptboardConnection()
      break
    }
  }
}

const createWhiteboardLink = async (conference: string): Promise<string> => {
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
