import {
  connectWebSocket,
  disconnectWebSocket,
  getWebSocket
} from './websocket'
import { getUser, setUser } from './user'
import { getPlugin } from './plugin'
import type { Participant } from '@pexip/plugin-api'

let conference: string

const subscribeEvents = (): void => {
  const plugin = getPlugin()

  plugin.events.me.add((participant) => {
    setUser(participant)
  })

  plugin.events.authenticatedWithConference.add(({ conferenceAlias }) => {
    conference = conferenceAlias
  })

  plugin.events.participantJoined.add((participant) => {
    const participantUuid = getUser().uuid
    /**
     * TODO: Adapt this part. Now instead of the participant we have an object
     * with the following structure:
     * {
     *   "id": "main",
     *   "participant": {...}
     * }
     */
    if (((participant as any).participant as Participant).uuid === participantUuid) {
      if (getWebSocket() != null) {
        disconnectWebSocket()
      }
      connectWebSocket(conference, participantUuid)
    }
  })

  plugin.events.participantLeft.add((participant) => {
    /**
     * TODO: Adapt this part. Now instead of the participant we have an object
     * with the following structure:
     * {
     *   "id": "main",
     *   "participant": {...}
     * }
     */
    if (((participant as any).participant as Participant).uuid === getUser().uuid) {
      disconnectWebSocket()
    }
  })
}

export {
  subscribeEvents
}
