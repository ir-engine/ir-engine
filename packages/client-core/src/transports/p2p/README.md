# P2P Signaling in IR Engine

This directory contains the implementation of P2P signaling for WebRTC connections in IR Engine. There are two main approaches:

1. **Instance Signaling API**: The default approach that uses the IR Engine server for signaling.
2. **Cloudflare Workers Signaling**: An alternative approach that offloads WebRTC signaling to Cloudflare Workers.

## Instance Signaling API

The Instance Signaling API is implemented in `PeerToPeerNetworkState.tsx`. It uses the IR Engine server's instance-signaling API to handle WebRTC signaling between peers.

## Cloudflare Workers Signaling

The Cloudflare Workers Signaling is implemented in `CloudflareSignalingNetworkState.tsx` and `CloudflareSignalingTransport.ts`. It uses a Cloudflare Worker to handle WebRTC signaling between peers, which offloads the signaling traffic from the IR Engine server.

### Benefits of Cloudflare Workers Signaling

- **Scalability**: Cloudflare Workers can handle a large number of signaling requests without impacting the IR Engine server.
- **Security**: WebRTC signaling is handled by a separate service, reducing the attack surface on the IR Engine server.
- **Performance**: Cloudflare's global network ensures low-latency signaling for users around the world.

## Configuration

### Server Configuration

To enable Cloudflare Workers Signaling, you can configure it in the server's configuration:

```json
{
  "server": {
    "cloudflareSignaling": {
      "enabled": true,
      "workerUrl": "https://your-worker-url.workers.dev"
    }
  }
}
```

Or set the following environment variables:

```
CLOUDFLARE_SIGNALING_ENABLED=true
CLOUDFLARE_SIGNALING_WORKER_URL=https://your-worker-url.workers.dev
```

### Client Usage

The client automatically detects if Cloudflare Workers Signaling is enabled based on the response from the instance-signaling API. If enabled, it will use the Cloudflare Worker for signaling instead of the instance-signaling API.

## Implementation Details

### PeerToPeerNetworkState

The `PeerToPeerNetworkState` component is responsible for managing P2P connections using the instance-signaling API. It:

1. Joins an instance by calling the instance-signaling API
2. Sets up WebRTC connections with other peers in the instance
3. Handles heartbeats to keep the connection alive

### CloudflareSignalingNetworkState

The `CloudflareSignalingNetworkState` component is responsible for managing P2P connections using Cloudflare Workers. It:

1. Creates a network for the instance
2. Sets up a `CloudflareSignalingTransport` to handle signaling
3. Manages peer connections based on signaling from the Cloudflare Worker

### CloudflareSignalingTransport

The `CloudflareSignalingTransport` class handles the communication with the Cloudflare Worker. It:

1. Polls the Cloudflare Worker for signaling messages
2. Sends signaling messages to other peers via the Cloudflare Worker
3. Notifies the `CloudflareSignalingNetworkState` when peers connect or disconnect

## Deployment

See the [Cloudflare Worker README](../../../server-core/src/networking/cloudflare-worker/README.md) for instructions on deploying the Cloudflare Worker.
