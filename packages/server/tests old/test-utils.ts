/**
 * Test Utility functions
 */
import url from 'url'
import config from '../../server-core/src/appconfig'

export function getUrl(pathname?: string): string {
  const parts = url.parse(config.client.url)

  return url.format({
    hostname: parts.hostname,
    protocol: parts.protocol,
    port: parts.port,
    pathname
  })
}
