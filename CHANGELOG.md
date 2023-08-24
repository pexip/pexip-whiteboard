# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.0] - 2023-08-24

Support of multiple scenarios and add state in the back-end.

### Added

- Support for v32 and v33.
- Support when the plugin is served from the same domain and different domains.
- Keep track of the whiteboard link in the back-end. This way if another user enters the conference, he will see a Prompt to open a pop-up with the whiteboard.
- Guests have a new button in the toolbar to open the pop-up with the whiteboard.
- Delete the whiteboard once the last user leaves the conference. 

### Fixed

- Decrease the size of the Collaboard icon.

## [1.0.0] - 2023-07-27
  
First version of the Pexip Whiteboard.

### Added

- Distributed in plugin and server parts.
- Collaboard provider.
- Conceptboard provider.
- Configuration files for plugin and server.
- Validate `conference` and `participantUuid` in Infinity.
- Try to auto-reconnect WebSocket each 5 seconds if it gets disconnected. 