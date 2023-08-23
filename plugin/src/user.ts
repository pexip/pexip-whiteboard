import type { Participant } from '@pexip/plugin-api'

declare enum CallType {
  audio = 'audio',
  video = 'video',
  api = 'api'
}

interface InfinityParticipant {
  callType: CallType
  canControl: boolean
  canChangeLayout: boolean
  canDisconnect: boolean
  canMute: boolean
  canTransfer: boolean
  canFecc: boolean
  canRaiseHand: boolean
  canSpotlight: boolean
  displayName?: string
  handRaisedTime: number
  identity: string
  isCameraMuted: boolean
  isEndpoint?: boolean
  isExternal: boolean
  isIdpAuthenticated?: boolean
  isGateway: boolean
  isHost: boolean
  isMainVideoDroppedOut: boolean
  isMuted: boolean
  isPresenting: boolean
  isSpotlight: boolean
  isStreaming: boolean
  isVideoSilent: boolean
  isWaiting: boolean
  needsPresentationInMix: boolean
  protocol: 'api' | 'webrtc' | 'sip' | 'rtmp' | 'h323' | 'mssip' | ''
  raisedHand: boolean
  role: 'chair' | 'guest'
  rxPresentation: boolean
  serviceType?: 'connecting' | 'waiting_room' | 'ivr' | 'conference' | 'lecture' | 'gateway' | 'test_call'
  spotlightOrder: number
  startAt: Date
  startTime: number
  uri: string
  uuid: string
  vendor?: string
}

let user: InfinityParticipant

const setUser = (participant: InfinityParticipant): void => {
  /**
   * TODO: Adapt this part. Now instead of the participant we have an object
   * with the following structure:
   * {
   *   "id": "main",
   *   "participant": {...}
   * }
   */
  user = (participant as any).participant as Participant
}

const getUser = (): InfinityParticipant => {
  return user
}

export {
  setUser,
  getUser
}
