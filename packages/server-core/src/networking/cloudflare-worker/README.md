# IR Engine Cloudflare Worker for P2P Signaling

This directory contains the Cloudflare Worker script used for P2P WebRTC signaling in IR Engine. The worker provides a serverless signaling solution that offloads WebRTC negotiation from the main instance-signaling API.

## Overview

The Cloudflare Worker acts as a signaling server for WebRTC connections between peers. It stores and forwards WebRTC offers, answers, and ICE candidates between peers, allowing them to establish direct P2P connections.

## Deployment

To deploy the worker to Cloudflare:

1. Install Wrangler CLI:
   ```
   npm install -g wrangler
   ```

2. Log in to your Cloudflare account:
   ```
   wrangler login
   ```

3. Create an R2 bucket for storing signaling data:
   ```
   wrangler r2 bucket create ir-engine-signaling
   ```

4. Create a `wrangler.toml` file in the same directory as the worker script:
   ```toml
   name = "ir-engine-signaling"
   main = "cloudflare-worker.js"
   compatibility_date = "2023-05-18"

   [[r2_buckets]]
   binding = "SIGNALING_BUCKET"
   bucket_name = "ir-engine-signaling"
   ```

5. Deploy the worker:
   ```
   wrangler publish
   ```

6. After deployment, you'll get a URL for your worker (e.g., `https://ir-engine-signaling.your-account.workers.dev`). Use this URL in your client configuration.

## Configuration

In your client application, you need to configure the CloudflareSignalingNetworkState component to use your worker URL:

```typescript
import { CloudflareSignalingNetworkState } from '@ir-engine/client-core/src/transports/p2p/CloudflareSignalingNetworkState'

// Connect to an instance using Cloudflare signaling
CloudflareSignalingNetworkState.connectToCloudflareInstance({
  id: instanceId,
  locationId: locationId,
  workerUrl: 'https://ir-engine-signaling.your-account.workers.dev'
})
```

## Security Considerations

- The worker includes rate limiting to prevent abuse
- You can configure allowed origins in the worker environment variables
- For production use, consider adding authentication to the worker

## Environment Variables

The worker supports the following environment variables:

- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `ORIGIN_QUOTA`: Maximum number of connections per origin per month

## Monitoring

You can monitor your worker's usage in the Cloudflare dashboard. The R2 bucket usage is also visible there.

## Troubleshooting

- If connections fail, check the browser console for errors
- Verify that the worker URL is correct and accessible
- Check that the R2 bucket is properly configured
- Ensure that CORS is properly configured if you're restricting origins
