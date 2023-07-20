import config from 'config'
import { Provider } from './whiteboard/providers/provider'

const checkConfig = (): void => {
  if (!config.has('server.address')) {
    throw new Error('Server Address not present in config file')
  }
  if (!config.has('server.port')) {
    throw new Error('Server port not present in config file')
  }
  if (!config.has('infinity.url')) {
    throw new Error('Infinity URL not present in config file')
  }
  if (!config.has('infinity.username')) {
    throw new Error('Infinity username not present in config file')
  }
  if (!config.has('infinity.password')) {
    throw new Error('Infinity password not present in config file')
  }
  if (!config.has('whiteboard.provider')) {
    throw new Error('Whiteboard provider not present in config file')
  }
  if (!config.has('whiteboard.url')) {
    throw new Error('Whiteboard URL not present in config file')
  }
  if (!config.has('whiteboard.username')) {
    throw new Error('Whiteboard username not present in config file')
  }
  if (!config.has('whiteboard.password')) {
    throw new Error('Whiteboard password not present in config file')
  }

  const provider: string = config.get('whiteboard.provider')
  if (!Object.values(Provider).includes(provider as Provider)) {
    throw new Error(`Whiteboard provider should be one of the following: ${Object.values(Provider).join(', ')}.`)
  }
  if (config.get('whiteboard.provider') === Provider.Collaboard) {
    if (!config.has('whiteboard.appUrl')) {
      throw new Error('Whiteboard appUrl not present in config file')
    }
    if (!config.has('whiteboard.appVersion')) {
      throw new Error('Whiteboard appVersion not present in config file')
    }
  }
}

export {
  checkConfig
}
