/**
 * Test Utility functions
 */
import url from 'url'
import config from '../packages/server/config'

export function getUrl (pathname?: string): string {
  return url.format({
    hostname: config.server.hostname,
    protocol: 'http',
    port: config.server.port,
    pathname
  })
}
