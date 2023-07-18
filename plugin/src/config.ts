interface Config {
  collaboardApiUrl: string
  collaboardApiVersion: string
  collaboardWebAppUrl: string
  infinityV31: boolean
}

const response = await fetch('./config.json');
const config: Config = await response.json();

export {
  config
}
