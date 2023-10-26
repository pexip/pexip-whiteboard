# Pexip Whiteboard

This project is used to integrate the Web App 3 with different whiteboard providers. The goal of this project is that a user can click on a button and automatically he/she can share a whiteboard with the rest of the participants.

To accomplish this task we need two pieces:

- **Server:** This is the back-end and will communicate with Pexip Infinity Management Node API and the Whiteboard provider API. The plugin will use the server through a WebSocket.
- **Plugin:** This is the front-end part and it will communicate with the back-end through WebSockets to create a whiteboard and share the link with the rest of the participants.

## Server

The file `default.json` defines the configuration for this back-end service. We can customize the following parameters:

| Parameter | Description |
|-----------|-------------|
| server.address | Ip to bind the server. |
| server.port | Port to bind the server. |
| infinity.url | URL of the Infinity Management Node. |
| infinity.username | Username for the Infinity Manager Node. |
| infinity.password | Password for the Infinity Manager Node. |
| whiteboard.defaultProvider | Indicates the whiteboard provider to use in case the plugin doesn't specify one. |
| whiteboard.providers | An array with all the available whiteboard providers. |
| whiteboard.providers[].id | The id of the whiteboard provider to use. We have two options: `collaboard` or `conceptboard`. |
| whiteboard.providers[].url | URL to the whiteboard API.|
| whiteboard.providers[].username | **Only for Collaboard.** Username to authenticate in the whiteboard API.|
| whiteboard.providers[].password | **Only for Collaboard.** Password to the whiteboard API. |
| whiteboard.providers[].appUrl | **Only for Collaboard.** URL for the Collaboard Web App. |
| whiteboard.providers[].appVersion | **Only for Collaboard.** Version of the Collaboard Web App.|
| sendLinkToChat | Send the Whiteboard link created by the conference to the chat. The user that will send the link will be the same that created the whiteboard.
| validateInfinityConference | No validate the conference and participantUuid into Infinity. | 
| verifyCertificates | Ignore the certificates from other servers (Infinity and whiteboard provider). This should always be `true` in production. |

### How to use

The first step is to go to the plugin folder:

```
cd plugin
```

We will install all necessary dependencies with:

```
npm i
```

And run the app:

````
npm start
````

This will launch the developer server in http://localhost:3000.

To print additional messages in the console, we can launch the server in `DEBUG` mode. To do this we should run the following code:

```
DEBUG=whiteboard-server:* npm start
```

If we want to create a production package, we can
run the following command:

```
npm run build
```

There is also a `docker-compose` and  `Dockerfile` to launch the server in a container.

## Plugin

The plugin has a configuration file that defines the location of the `server`:

```json
{
  "server": <URL to the server>,
  "whiteboardProvider": <collaboard | conceptboard>
}
```

### How to use

The first step is to go to the plugin folder:

```
cd plugin
```

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