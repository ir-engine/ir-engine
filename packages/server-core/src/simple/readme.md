# ir-simple-api

A simple server API for iR Engine using feathers without a database.

- Currently requries installation as a project - this will be standalone via npm in the future

### Consuming the server API

Run the default server from a project with `ts-node --swc ../../../../server-core/src/simple/server.ts`

Alternatively, you can make a copy of server.ts with any customizations

Notes:

- Leaving certPath or keyPath null will disable SSL.
- Leaving the clientPort empty assumes a domain is used.

## Services

**/p2p-signaling** - A signaling service for peer to peer sessions

### Peer to Peer Signaling

Ensure the server has baseServices configured (or that at least the p2p-signaling service is configured)

Two react hooks are exposed that use iR Engine's common API interface (thus feathers hooks)

```ts
import { useSimpleAPI } from '@ir-engine/client-core/src/util/useSimpleAPI'

useSimpleAPI('https://localhost:3030') // server IP
```

Note: Currently the UserID is handled automatically, and persisted to local storage, such that page refreshes do not lose your user. This is obviously insecure, but a good enough stopgap prior to a dedicated user and authentication service.

## Todo

- Serve client build from API server
- Auth/User service, maybe requiring a database?
