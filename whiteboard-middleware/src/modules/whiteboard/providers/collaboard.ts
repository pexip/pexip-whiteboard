import config from 'config'
import { v4 as uuidv4 } from 'uuid'
import Debug from 'debug'

const debug = Debug('whiteboard-middleware:collaboard')

const uniqueDeviceId = uuidv4()

const url: string = config.get('whiteboard.url')
const username: string = config.get('whiteboard.username')
const password: string = config.get('whiteboard.password')
const appUrl: string = config.get('whiteboard.appUrl')
const appVersion: string = config.get('whiteboard.appVersion')

interface ProjectData {
  CanvasSizeRatio: number
  ProjectId: number
  Description: string
  Type: number
  ContainerUri: string
  BackgroundColor: string
  CreatedByUser: string
  CreatedByUniqueMachineId: string
  CreationDate: string
  UpdatedByUser: string
  LastUpdate: string
  Presenter: string | null
}

interface Project {
  Project: ProjectData
  ThumbnailUrl: string
  Permission: number
  IsLicensed: true
  LastAccessDate: string
  NumberOfParticipants: number
}

const createCollaboardLink = async (conference: string): Promise<string> => {
  const authToken = await authenticateWithPassword()
  let project: Project | null = null
  let end = false
  const pageSize = 20
  let pageNumber = 1
  while (!end && project == null) {
    const projects = await getProjects(authToken, pageSize, pageNumber)
    project = projects.find((project: Project) => project.Project.Description === conference)
    if (projects.length < pageSize) {
      end = true
    } else {
      pageNumber++
    }
  }
  if (project != null) {
    await deleteProject(authToken, project.Project.ProjectId)
  }
  const projectId = await createProject(authToken, conference)
  const link = await createInvitationLink(authToken, projectId)
  return link
}

/**
 * Obtain an access token using for that the username and password.
 * @returns Return only the AuthorizationToken
 */
const authenticateWithPassword = async (): Promise<string> => {
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
  if (result.status !== 200) {
    throw new Error('Cannot authenticate in Collaboard')
  }
  debug(result)
  return (await result.json()).AuthorizationToken
}

/**
 * Obtain all the available projects for the authenticated user.
 * @param authToken - Token that was obtained in the authentication process.
 * @returns
 */
const getProjects = async (authToken: string, pageSize: number, pageNumber: number): Promise<any> => {
  const result = await fetch(`${url}/api/public/v1.0/CollaborationHub/GetMyProjects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      UniqueDeviceId: uniqueDeviceId,
      AppVer: appVersion,
      PageSize: pageSize,
      PageNumber: pageNumber,
      WantsCount: true,
      SpaceId: null
    })
  })
  if (result.status === 200) {
    const jsonResult = await result.json()
    debug(jsonResult)
    return jsonResult.Results
  }
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
  if (result.status !== 200) {
    throw Error('Cannot delete a collaboard project')
  }
}

/**
 * Create a new empty project in collaboard.
 * @param authToken - Token that was obtained in the authentication process.
 * @param projectName - Name for the project that will be used in the description.
 * @returns JSON object with the new project.
 */
const createProject = async (authToken: string, projectName: string): Promise<number> => {
  const result = await fetch(`${url}/api/public/v1.0/CollaborationHub/CreateProject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      UniqueDeviceId: uniqueDeviceId,
      AppVer: appVersion,
      Description: projectName,
      SpaceId: null
    })
  })
  if (result.status !== 200) {
    throw Error('Cannot create a Collaboard project')
  }
  const jsonResult = await result.json()
  debug(jsonResult)
  return jsonResult.ProjectId
}

/**
 * Create an invitation link that can be shared with authenticated users.
 * @param projectId - Id of the project that we want to share.
 * @returns Invitation link in a string.
 */
const createInvitationLink = async (authToken: string, projectId: number): Promise<string> => {
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
      InvitationUrl: `${appUrl}/acceptProjectInvitation`
    })
  })
  if (result.status !== 200) {
    throw Error('Cannot create invitation to a collaboard project')
  }
  const jsonResult = await result.json()
  debug(jsonResult)
  return jsonResult.InvitationUrl
}

export {
  createCollaboardLink
}
