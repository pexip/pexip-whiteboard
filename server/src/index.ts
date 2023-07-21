import express from 'express'
import path from 'path'
import logger from 'morgan'
import config from 'config'
import ExpressWs from 'express-ws'

import { checkConfig } from './config'
import type { ConfigProvider } from './config'
import wsRouter from './routes/ws'
import { checkInfinityConnection } from './infinity'
import { checkWhiteboardConnection } from './whiteboard/whiteboard'
import type { Provider } from './whiteboard/providers/provider'

const main = async (): Promise<void> => {
  checkConfig()

  if (config.has('verifyCertificates') && config.get('verifyCertificates') === false) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }

  await checkInfinityConnection()
  const providers: ConfigProvider[] = config.get('whiteboard.providers')
  for (let i = 0; i < providers.length; i++) {
    await checkWhiteboardConnection(providers[i].id as Provider)
  }

  const address: string = config.get('server.address')
  const port: string = config.get('server.port')

  // TODO: Purge all old whiteboards

  const app = express()
  ExpressWs(app)

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(express.static(path.join(__dirname, 'public')))

  app.use('/ws', wsRouter())

  app.listen(parseInt(port), address)

  console.log(`Listening on ${address}:${port}`)
}

main().catch((error) => {
  console.error(`Error: ${error.message as string}`)
  process.exit(1)
})
