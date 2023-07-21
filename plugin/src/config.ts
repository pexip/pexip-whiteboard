interface Config {
  server: string
  whiteboardProvider?: string
}

const response = await fetch('./config.json');
const config: Config = await response.json();

export {
  config
}
