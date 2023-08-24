import {
  connectWebSocket,
  disconnectWebSocket,
  getWebSocket
} from './websocket'
import { getCleanParticipant, getUser, setUser } from './user'
import { getPlugin } from './plugin'

let conference: string

const subscribeEvents = (): void => {
  const plugin = getPlugin()

  plugin.events.me.add((participant) => {
    setUser(getCleanParticipant(participant))
  })

  plugin.events.authenticatedWithConference.add(({ conferenceAlias }) => {
    conference = conferenceAlias
  })

  plugin.events.participantJoined.add((participant) => {
    const participantUuid = getUser().uuid
    if (getCleanParticipant(participant).uuid === participantUuid) {
      if (getWebSocket() != null) {
        disconnectWebSocket()
      }
      connectWebSocket(conference, participantUuid)
    }
  })

  plugin.events.participantLeft.add((participant) => {
    if (getCleanParticipant(participant).uuid === getUser().uuid) {
      disconnectWebSocket()
    }
  })
}

export {
  subscribeEvents
}
