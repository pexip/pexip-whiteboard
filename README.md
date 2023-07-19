# Pexip Whiteboard

This project is used to integrate the Web App 3 with different whiteboard providers.

{
  "server": {
    "address": "0.0.0.0",
    "port": "3000"
  },
  "infinity": {
      "url": "https://192.168.1.100",
      "username": "admin",
      "password": "asterisk"
  },
  "whiteboard": {
      "provider": "collaboard",
      "url": "https://api.collaboard.app",
      "username": "marcoscereijo@gmail.com",
      "password": "WarCry1725!",
      "appUrl": "https://web.collaboard.app",
      "appVersion": "6.0.0"
  },
  "verifyCertificates": false
}

## Whiteboard Middleware

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

## Plugin