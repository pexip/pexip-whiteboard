import config from 'config'
import { v4 as uuidv4 } from 'uuid'
import Debug from 'debug'

const debug = Debug('whiteboard-middleware:collaboard')

let authToken = ''
let refreshToken = ''
let uniqueDeviceId = uuidv4()

const url: string = config.get('whiteboard.url')
const username: string = config.get('whiteboard.username')
const password: string = config.get('whiteboard.password')
const appVersion: string = config.get('whiteboard.appVersion')

const createCollaboardLink = async (): Promise<string> => {
  // TODO: Check if the authentication
  const authToken = authenticateWithPassword()
  return await Promise.resolve('')
}

/**
 * Obtain an access token using for that the username and password.
 * @returns The response with the AuthenticationToken, RefreshToken and username,
 *   between other things.
 */
const authenticateWithPassword = async (): Promise<Response> => {
  const token = btoa(username + ':' + password)
  const result = await fetch(`${url}/auth/api/Authorization/Authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`
    },
    body: JSON.stringify({
      UniqueDeviceId: uniqueDeviceId,
      AppVer: appVersion
    })
  })
  debug(result)
  return result
}

const authenticateWithRefreshToken = async (refreshToken: string): Promise<Response> => {
  const result = await fetch(`${url}/auth/api/Authorization/RefreshToken`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`
    }
  })
  return result
}

/**
 * Obtain all the available projects for the authenticated user.
 * @param authToken - Token that was obtained in the authentication process.
 * @returns
 */
const getProjects = async (authToken: string): Promise<any> => {
  const result = await fetch(`${url}/api/public/v1.0/CollaborationHub/GetMyProjects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      UniqueDeviceId: uniqueDeviceId,
      AppVer: appVersion,
      PageSize: 20,
      PageNumber: 1,
      WantsCount: true,
      SpaceId: null
    })
  })
  if (result.status === 200) {
    const jsonResult = await result.json()
    return jsonResult.Results
  }
}

/**
 * Create a new empty project in collaboard.
 * @param authToken - Token that was obtained in the authentication process.
 * @param projectName - Name for the project that will be used in the description.
 * @returns JSON object with the new project.
 */
const createProject = async (authToken: string, projectName: string) => {
  const result = await fetch(`${url}/api/public/v1.0/CollaborationHub/CreateProject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      UniqueDeviceId: 'c0bd411b-783c-42ef-b1f3-f5de2373538a',
      AppVer: appVersion,
      Description: projectName,
      SpaceId: null
    })
  });
  if (result.status === 200) {
    const jsonResult = await result.json()
    return jsonResult
  }
  throw Error('Cannot create a Collaboard project')
}

/**
 * Remove a project from our collaboard account.
 * @param authToken - Token that was obtained in the authentication process.
 * @param projectId - Id of the project that we want to remove.
 * @returns Empty promise.
 */
const deleteProject = async (authToken: string, projectId: number): Promise<void> => {
  const result = await fetch(`${url}/api/public/v1.0/CollaborationHub/DeleteProject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      UniqueDeviceId: uniqueDeviceId,
      AppVer: appVersion,
      ProjectId: projectId
    })
  })
  if (result.status === 200) {
    return
  }
  throw Error('Cannot delete a collaboard project')
}

/**
 * Create an invitation link that can be shared with authenticated users.
 * @param projectId - Id of the project that we want to share.
 * @returns Invitation link in a string.
 */
const createInvitationLink = async (projectId: number): Promise<string> => {
  const result = await fetch(`${url}/api/CollaborationHub/CreateProjectInvitationLink`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      UniqueDeviceId: uniqueDeviceId,
      AppVer: appVersion,
      ProjectId: projectId,
      MemberPermission: 2,
      GuestPermission: 0,
      ValidForMinutes: 60,
      GuestIdentificationRequired: true,
      InvitationUrl: `${url}/acceptProjectInvitation`
    })
  })
  if (result.status === 200) {
    const jsonResult = await result.json()
    return jsonResult.InvitationUrl
  }
  throw Error('Cannot send invitation to a collaboard project')
}

export {
  createCollaboardLink
}
