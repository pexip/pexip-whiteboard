# Pexip Whiteboard

This project is used to integrate the Web App 3 with different whiteboard providers. The goal of this project is that a user can click on a button and automatically he/she can share a whiteboard with the rest of the participants.

To accomplish this task we need two pieces:

- **Server:** This is the back-end and will communicate with Pexip Infinity Management Node API and the Whiteboard provider API. The plugin will use the server through a WebSocket.
- **Plugin:** This is the front-end part and it will communicate with the back-end through WebSockets to create a whiteboard and share the link with the rest of the participants.

## Server

This service communicates with the Web App 3 plugin through a WebSocket. The URL structure for the WebSocket endpoint is the following:

    /ws/<conference>/<participant_uuid>

And this is the structure of the messages:

```json
{
  "type": <MessageType>,
  "body": <Optional message>
}
```

The `MessageType` can be one of the following:

- `create`: It's used to indicate that this user wants to create a whiteboad and share the link with the rest of the user of the conference. The body in this case is empty.
- `created`: Indicates that the user created a whiteboard. The body contains a string with the link to the whiteboard.
- `invited`: Indicates that the user received a invitation for a whiteboard from another user. The body contains a string with the link to the whiteboard.
- `error`: This is used to indicate that something went wrong with the whiteboard creation. The message body will contain a string with the error description. 

Once somebody tries to share the whiteboard, it performs the following tasks:

- Verify that the `conference` exists.
- Verify that the `participant_uuid` is a member of the conference.
- Verify that the `participant_uuid` has the role `host`.
- Remove a whiteboard for `conference` if exists, since we want to start with a blank whiteboard.
- Create a whiteboard for `conference`.
- Create a link to share the whiteboard.
- Share the link through WebSocket with all the connected users of the same `conference`.  

The file `default.json` defines the configuration for this back-end service. We can customize the following parameters:

| Parameter | Description |
|-----------|-------------|
| server.address | Ip to bind the server. |
| server.port | Port to bind the server. |
| infinity.url | URL of the Infinity Management Node. |
| infinity.username | Username for the Infinity Manager Node. |
| infinity.password | Password for the Infinity Manager Node. |
| whiteboard.provider | Whiteboard provider to use. At this point two are availabe: `collaboard` and `conceptboard`. |
| whiteboard.url | URL to the whiteboard API.|
| whiteboard.username | Username to authenticate in the whiteboard API.|
| whiteboard.password | Password to the whiteboard API. |
| whiteboard.appUrl | **Only for Collaboard.** URL for the Collaboard Web App. |
| whiteboard.appVersion | **Only for Collaboard.** Version of the Collaboard Web App.|
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

If we want to create a production package that can be uploaded to infinity, we can
run the following command:

```
npm run build
```

## Plugin

The plugin has a configuration file that defines the location of the `server`:

```json
{
  "server": <URL to the server>
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