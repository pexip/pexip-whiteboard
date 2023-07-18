import { config } from '../../config';

let authToken;
let uniqueDeviceId;

/**
 * Obtain an access token using for that the username and password.
 * @param username - The email that is used as username in collaboard.
 * @param password - The password to log in collaboard.
 * @returns The response with the AuthenticationToken, RefreshToken and username,
 *   between other things.
 */
const authenticateWithPassword = async (username: string, password: string) => {
  const token = btoa(username + ':' + password);
  const result = await fetch(`${config.collaboardApiUrl}/auth/api/Authorization/Authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`
    },
    body: JSON.stringify({
      "UniqueDeviceId": "c0bd411b-783c-42ef-b1f3-f5de2373538a",
      "AppVer": config.collaboardApiVersion
    })
  });
  return result;
}

const authenticateWithRefreshToken = async (refreshToken: string) => {
  const result = await fetch(`${config.collaboardApiUrl}/auth/api/Authorization/RefreshToken`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    }
  });
  return result;
}

const getAuthToken = () => {

}

const getUniqueDeviceId = () => {

}

export {
  authenticateWithPassword,
  authenticateWithRefreshToken,
  getAuthToken,
  getUniqueDeviceId
}
