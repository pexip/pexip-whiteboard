import config from 'config'
import type { ConfigProvider } from '../../config'
import { Provider } from '../../types/Provider'
import { getLogger } from '../../logger'
import path from 'path'

const logger = getLogger(path.basename(__filename))

const providers: ConfigProvider[] = config.get('whiteboard.providers')
const provider = providers.find((provider) => provider.id === Provider.Conceptboard)

const url = provider?.url ?? ''

const checkConceptboardConnection = async (): Promise<void> => {
  // TODO: To implement
}

const createConceptboardLink = async (conference: string): Promise<string> => {
  const response = await fetch(`${url}/new`)
  if (response.status !== 200) {
    throw new Error('Cannot create the whiteboard')
  }
  logger.debug('Created Conceptboard link')
  return response.url
}

const deleteConceptboardLink = async (conference: string): Promise<void> => {
  // TODO: To implement
}

export {
  checkConceptboardConnection,
  createConceptboardLink,
  deleteConceptboardLink
}
