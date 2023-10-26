interface Config {
  server: string
  provider?: string
  userAuthentication?: boolean
}

const response = await fetch('./config.json')
const config: Config = await response.json()

export {
  config
}
