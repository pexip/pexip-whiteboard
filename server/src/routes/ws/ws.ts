import express from 'express'

import { handleNewConnection } from './handleNewConnection'

const router = express.Router()

const wsRouter = (): any => {
  router.ws('/:conference/:participantUuid', (ws, req) => {
    handleNewConnection(ws, req)
  })
  return router
}

export { wsRouter }
