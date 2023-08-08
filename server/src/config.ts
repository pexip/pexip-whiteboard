import config from 'config'
import { Provider } from './whiteboard/providers/Provider'

interface ConfigProvider {
  id: string
  url: string
  username?: string
  password?: string
  appUrl?: string
  appVersion?: string
}

const checkConfig = (): void => {
  if (!config.has('server.address')) {
    throw new Error('Server Address not present in config file.')
  }
  if (!config.has('server.port')) {
    throw new Error('Server port not present in config file.')
  }
  if (!config.has('infinity.url')) {
    throw new Error('Infinity URL not present in config file.')
  }
  if (!config.has('infinity.username')) {
    throw new Error('Infinity username not present in config file.')
  }
  if (!config.has('infinity.password')) {
    throw new Error('Infinity password not present in config file.')
  }
  if (!config.has('whiteboard.providers')) {
    throw new Error('Whiteboard providers not present in config file.')
  }
  const providers: ConfigProvider[] = config.get('whiteboard.providers')
  if (providers.length === 0) {
    throw new Error('Whiteboard providers are not present in config file.')
  }
  if (providers.length > 1 && !config.has('whiteboard.defaultProvider')) {
    throw new Error('Whiteboard providers are more than one, but defaultProvider not present in config file.')
  }
  providers.forEach((provider) => {
    if (!Object.values(Provider).includes(provider.id as Provider)) {
      throw new Error(`Whiteboard provider id should be one of the following: ${Object.values(Provider).join(', ')}.`)
    }
    if (provider.url == null) {
      throw new Error('Whiteboard provider url not present in config file.')
    }
    if (provider.id === Provider.Collaboard) {
      if (provider.username == null) {
        throw new Error('Whiteboard provider username for Collaboard not present in config file.')
      }
      if (provider.password == null) {
        throw new Error('Whiteboard provider password for Collaboard not present in config file.')
      }
      if (provider.appUrl == null) {
        throw new Error('Whiteboard provider appUrl for Collaboard not present in config file.')
      }
      if (provider.appVersion == null) {
        throw new Error('Whiteboard provider appVersion for Collaboard not present in config file.')
      }
    }
  })
}

export {
  checkConfig
}

export type {
  ConfigProvider
}
