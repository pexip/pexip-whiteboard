import express from 'express'
import path from 'path'
import logger from 'morgan'
import config from 'config'
import ExpressWs from 'express-ws'

import wsRouter from './routes/ws'
import { Provider } from './modules/whiteboard/providers/provider'

if (!config.has('server.address')) {
  console.error('Server Address not present in config file')
  process.exit(1)
}
if (!config.has('server.port')) {
  console.error('Server port not present in config file')
  process.exit(1)
}
if (!config.has('infinity.url')) {
  console.error('Infinity URL not present in config file')
  process.exit(1)
}
if (!config.has('infinity.username')) {
  console.error('Infinity username not present in config file')
  process.exit(1)
}
if (!config.has('infinity.password')) {
  console.error('Infinity password not present in config file')
  process.exit(1)
}
if (!config.has('whiteboard.provider')) {
  console.error('Whiteboard provider not present in config file')
  process.exit(1)
}
if (!config.has('whiteboard.url')) {
  console.error('Whiteboard URL not present in config file')
  process.exit(1)
}
if (!config.has('whiteboard.username')) {
  console.error('Whiteboard username not present in config file')
  process.exit(1)
}
if (!config.has('whiteboard.password')) {
  console.error('Whiteboard password not present in config file')
  process.exit(1)
}

const provider: string = config.get('whiteboard.provider')
if (!Object.values(Provider).includes(provider as Provider)) {
  console.error(`Whiteboard provider should be one of the following: ${Object.values(Provider).join(', ')}.`)
  process.exit(1)
}

if (config.has('verifyCertificates') && config.get('verifyCertificates') === false) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const address: string = config.get('server.address')
const port: string = config.get('server.port')

const app = express()
ExpressWs(app)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/ws', wsRouter())

app.listen(parseInt(port), address)

console.log(`Listening on ${address}:${port}`)
