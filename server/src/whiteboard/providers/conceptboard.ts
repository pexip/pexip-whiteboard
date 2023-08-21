import path from 'path'
import config from 'config'
import { Provider } from './Provider'
import { getLogger } from '../../logger'

import type { ConfigProvider } from '../../config'
import type { WhiteboardInfo } from '../WhiteboardInfo'

const logger = getLogger(path.basename(__filename))

const providers: ConfigProvider[] = config.get('whiteboard.providers')
const provider = providers.find((provider) => provider.id === Provider.Conceptboard)

const url = provider?.url ?? ''

const checkConceptboardConnection = async (): Promise<void> => {
  // TODO: To implement
}

const createConceptboardLink = async (conference: string): Promise<WhiteboardInfo> => {
  const response = await fetch(`${url}/new`)
  if (response.status !== 200) {
    throw new Error('Cannot create the whiteboard')
  }
  logger.debug('Created Conceptboard link')
  return {
    conference,
    whiteboardId: '',
    whiteboardLink: response.url,
    provider: Provider.Conceptboard
  }
}

const deleteConceptboardLink = async (whiteboardInfo: WhiteboardInfo): Promise<void> => {
  // TODO: To implement
}

export {
  checkConceptboardConnection,
  createConceptboardLink,
  deleteConceptboardLink
}
