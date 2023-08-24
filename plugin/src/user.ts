import type { Participant } from '@pexip/plugin-api'
import { setVersion } from './infinityVersion'

let user: Participant

const setUser = (participant: Participant): void => {
  user = participant
}

const getUser = (): Participant => {
  return user
}

/**
 * Adapt the participant to different version of Infinity. For v32 we received
 * the participant directly, but now we receive some like this for participantJoined,
 * participantLeft and me.
 * {
 *   "id": "main",
 *   "participant": {...}
 * }
 */
const getCleanParticipant = (participant: any): Participant => {
  if (participant.uuid != null) {
    return participant
  } else {
    setVersion('33')
    return (participant.participant as Participant)
  }
}

export {
  setUser,
  getUser,
  getCleanParticipant
}
