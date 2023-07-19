import config from 'config'
import { Provider } from './providers/provider'
import { createCollaboardLink } from './providers/collaboard'
import { createConceptboardLink } from './providers/conceptboard'

const createWhiteboardLink = async (conference: string): Promise<string> => {
  const provider = config.get('whiteboard.provider')
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
  createWhiteboardLink
}
