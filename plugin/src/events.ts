import type { Plugin } from '@pexip/plugin-api'
import {
  connectWebSocket,
  disconnectWebSocket,
  getWebSocket
} from './websocket'
import { getUser, setUser } from './user'

let conference: string

const subscribeEvents = (plugin: Plugin): void => {
  plugin.events.me.add((participant) => {
    setUser(participant)
  })

  plugin.events.authenticatedWithConference.add(({ conferenceAlias }) => {
    conference = conferenceAlias
  })

  plugin.events.participantJoined.add((participant) => {
    const participantUuid = getUser().uuid
    if (participant.uuid === participantUuid) {
      if (getWebSocket() != null) {
        disconnectWebSocket()
      }
      connectWebSocket(conference, participantUuid)
    }
  })

  plugin.events.participantLeft.add((participant) => {
    if (participant.uuid === getUser().uuid) {
      disconnectWebSocket()
    }
  })
}

export {
  subscribeEvents
}
