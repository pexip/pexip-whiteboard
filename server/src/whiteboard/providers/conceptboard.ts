import config from 'config'
import type { ConfigProvider } from '../../config'
import { Provider } from './provider'
import Debug from 'debug'

const debug = Debug('whiteboard-middleware:conceptboard')

const providers: ConfigProvider[] = config.get('whiteboard.providers')
const provider = providers.find((provider) => provider.id === Provider.Conceptboard)

if (provider == null) {
  throw new Error('Cannot find provider config for Conceptboard.')
}

const url = provider.url

const checkConceptboardConnection = async (): Promise<void> => {}

const createConceptboardLink = async (conference: string): Promise<string> => {
  const response = await fetch(`${url}/new`)
  if (response.status !== 200) {
    throw new Error('Cannot create the whiteboard')
  }
  debug('Created Concepboard whiteboard')
  return response.url
}

export {
  checkConceptboardConnection,
  createConceptboardLink
}
