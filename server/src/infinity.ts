import config from 'config'
import Debug from 'debug'

const debug = Debug('whiteboard-server:infinity')

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

const url: string = config.get('infinity.url')
const username: string = config.get('infinity.username')
const password: string = config.get('infinity.password')

const checkInfinityConnection = async (): Promise<void> => {
  let response: Response
  debug('Checking Infinity connection...')
  try {
    response = await fetch(`${url}/api/admin/status/v1/management_vm/`, {
      headers: {
        Authorization: `Basic ${btoa(username + ':' + password)}`
      }
    })
  } catch (error) {
    throw new Error('Cannot access Infinity. Check the URL.')
  }

  switch (response.status) {
    case 200: {
      debug('Infinity connection OK!')
      break
    }
    case 401: {
      throw new Error('Cannot authenticate in Infinity.')
    }
    default: {
      throw new Error('Cannot access Infinity.')
    }
  }

  const contentType = response.headers.get('Content-Type')
  if (contentType !== 'application/json') {
    throw new Error('Cannot authenticate to Infinity. Maybe because SSO is enable in this account.')
  }

  const result = await response.json()
  const managementNodes = result.objects
  if (managementNodes == null || managementNodes.length < 1) {
    throw new Error('Cannot connect to Infinity.')
  }
}

const checkIfParticipantIsAllowed = async (conference: string, participantUuid: string): Promise<void> => {
  let participants: InfinityParticipant[] = []
  try {
    participants = await getParticipants(conference)
  } catch (error: any) {
    throw new Error('Cannot verify conference.')
  }
  const participant = participants.find((participant) => participant.call_uuid === participantUuid)
  if (participant == null) {
    throw new Error(`Participant "${participantUuid}" cannot be found in conference ${conference}.`)
  }
  if (participant.role !== 'chair') {
    throw new Error(`Participant "${participantUuid}" doesn't have enough permissions.`)
  }
}

const getParticipants = async (conference: string): Promise<InfinityParticipant[]> => {
  debug(`Getting participants for conference "${conference}"`)
  let response: Response
  try {
    response = await fetch(`${url}/api/admin/status/v1/participant/?conference=${conference}`, {
      headers: {
        Authorization: `Basic ${btoa(username + ':' + password)}`
      }
    })
  } catch (error) {
    throw new Error('Cannot access Infinity.')
  }

  switch (response.status) {
    case 200: {
      const result = await response.json()
      debug(result)
      const participants = result.objects
      return participants
    }
    case 401: {
      throw new Error('Cannot authenticate in Infinity.')
    }
    default: {
      throw new Error('Cannot access Infinity.')
    }
  }
}

export {
  checkInfinityConnection,
  checkIfParticipantIsAllowed
}
