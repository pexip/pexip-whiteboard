# Plugin: Collaboard for Web App 3

## Introduction

This plugin will create a new button for `host` users. If a `host` click on it, he will ask
to introduce his Collaboard credentials (only works with username/password). After this, the system will perform
the following actions under the hood:

* Uses the username and password to create an `access_token` from Collaboard that
will be used in the following requests.
* Creates a new empty whiteboard with the name `pexip-whiteboard`. In case it already
exists, it will delete it and create it again.
* Creates an invitation link and send it to the other participants, using for that
the message API.

For a general user (`host` and `guest`), the plugin will subscribe to the message
API and display a prompt in case it receive a message with the following format:

```javascript
{
  type: 'whiteboard-invitation',
  data: <invitation-url>
}
```

In this prompt the user will have a button to open a new tab with the link from
the invitation. Once the new tab is opened, the user should have to introduce
their Collaboard credentials in case he hasn't already logged in. This use can
log in with any of the available methods: username/password, SSO or 2FA.

## Pre-requisites

All this requires are for the `host` that starts the whiteboard. Other participants
don't have these kind of limitations.

### Authentication

The first limitation is that it only works with basic authentication, so we have
to create an account with username and password. We cannot use SSO or 2FA for the
`host` user that starts the whiteboard.

### CORS

To avoid the CORS issues we will have to use Chrome and install an extension that
override the CORS security mechanism. Again, this is only necessary for the host users
that start the whiteboard:

* CORS Unblock: https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino?hl=en

Don't forget to uninstall or deactivate the extension after the demo.

## How to use it

We will install all necessary dependencies with:

```
npm i
```

And run the app:

````
npm start
````

This will launch the developer server in http://localhost:5173 and we can access
the plugin through the following url: https://infinity-connect.pexip.rocks/

If we want to create a production package that can be uploaded to infinity, we can
run the following command:

```
npm run build
```

## Configure Content Security Policy (CSP)

To configure the CSP header you have to open the Management Node interface, go to Platform > Global Settings > Security > HTTP Content Security Policy Header.

Default CSP:

``
upgrade-insecure-requests; default-src 'self'; frame-src 'self' https://telemetryservice.firstpartyapps.oaspapps.com/telemetryservice/telemetryproxy.html https://*.microsoft.com https://*.office.com; style-src 'self' 'unsafe-inline' https://*.microsoft.com https://*.office.com; object-src 'self'; font-src 'self' https://*.microsoft.com https://*.office.com; img-src 'self' https://www.adobe.com data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoft.com https://*.office.com https://ajax.aspnetcdn.com https://api.keen.io; media-src 'self' blob:; connect-src 'self' https://*.microsoft.com https://*.office.com https://example.com;
```

You will have to make the following modification:

- Add the collaboardApiUrl to the 'connect-src' section.

```
upgrade-insecure-requests; default-src 'self'; frame-src 'self' https://telemetryservice.firstpartyapps.oaspapps.com/telemetryservice/telemetryproxy.html https://*.microsoft.com https://*.office.com; style-src 'self' 'unsafe-inline' https://*.microsoft.com https://*.office.com; object-src 'self'; font-src 'self' https://*.microsoft.com https://*.office.com; img-src 'self' https://www.adobe.com data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoft.com https://*.office.com https://ajax.aspnetcdn.com https://api.keen.io; media-src 'self' blob:; connect-src 'self' https://*.microsoft.com https://*.office.com https://example.com https://api.collaboard.app;
```