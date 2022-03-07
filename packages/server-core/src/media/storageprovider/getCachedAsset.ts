import config from '../../appconfig'

export const getCachedAsset = (path: string, cacheDomain: string, clientFetch = false) => {
  if (!cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')
  if (config.server.storageProvider === 'local' && clientFetch) cacheDomain = 'localhost:8642'
  return new URL(path ?? '', 'https://' + cacheDomain).href
}
