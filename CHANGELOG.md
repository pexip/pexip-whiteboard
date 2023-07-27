# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.0] - 2023-07-27
  
First version of the Pexip Whiteboard.

### Added

- Distributed in plugin and server parts.
- Collaboard provider.
- Conceptboard provider.
- Configuration files for plugin and server.
- Validate `conference` and `participantUuid` in Infinity.
- Try to auto-reconnect WebSocket each 5 seconds if it gets disconnected. 