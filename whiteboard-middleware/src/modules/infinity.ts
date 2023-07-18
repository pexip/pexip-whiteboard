import config from 'config'
import Debug from 'debug'

const debug = Debug('whiteboard-middleware:infinity')

interface InfinityParticipant {
  bandwidth: number
  call_direction: string
  call_quality: string
  call_tag: string
  call_uuid: string
  conference: string
  connect_time: string
  conversation_id: string
  destination_alias: string
  display_name: string
  encryption: string
  has_media: true
  id: string
  idp_uuid: string
  is_direct: boolean
  is_disconnect_supported: boolean
  is_idp_authenticated: boolean
  is_mute_supported: boolean
  is_muted: boolean
  is_on_hold: boolean
  is_presentation_supported: boolean
  is_presenting: boolean
  is_recording: boolean
  is_streaming: boolean
  is_transcribing: boolean
  is_transfer_supported: boolean
  license_count: number
  license_type: string
  media_node: string
  parent_id: string
  participant_alias: string
  protocol: string
  proxy_node: string
  remote_address: string
  remote_port: number
  resource_uri: string
  role: string
  rx_bandwidth: number
  service_tag: string
  service_type: string
  signalling_node: string
  source_alias: string
  system_location: string
  tx_bandwidth: number
  vendor: string
}

const checkIfParticipantIsAllowed = async (conference: string, participantUuid: string): Promise<void> => {
  let participants: InfinityParticipant[] = []
  try {
    participants = await getParticipants(conference)
  } catch (error: any) {
    throw new Error('Cannot verify conference')
  }
  const participant = participants.find((participant) => participant.call_uuid === participantUuid)
  if (participant == null) {
    throw new Error(`Participant ${participantUuid} cannot be found in conference ${conference}`)
  }
  if (participant.role !== 'chair') {
    throw new Error(`Participant ${participantUuid} doesn't have enough permissions`)
  }
}

const getParticipants = async (conference: string): Promise<InfinityParticipant[]> => {
  const url: string = config.get('infinity.url')
  const username: string = config.get('infinity.username')
  const password: string = config.get('infinity.password')

  debug(`Getting participants for conferece "${conference}"`)
  const response = await fetch(url + '/api/admin/status/v1/participant/?conference=' + conference, {
    headers: {
      Authorization: `Basic ${btoa(username + ':' + password)}`
    }
  })
  debug(response)

  let error = ''
  let participants = []
  switch (response.status) {
    case 200: {
      const result = await response.json()
      participants = result.objects
      break
    }
    case 401: {
      error = 'Cannot authenticate in Infinity'
      break
    }
    default: {
      error = 'Cannot access to Infinity'
      break
    }
  }
  if (error !== '') {
    throw new Error(error)
  } else {
    return participants
  }
}

export {
  checkIfParticipantIsAllowed
}
