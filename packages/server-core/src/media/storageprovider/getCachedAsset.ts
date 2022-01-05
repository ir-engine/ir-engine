import config from '../../appconfig'
export const getCachedAsset = (path: string, cacheDomain: string) => {
  if (!cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')
  if (config.server.storageProvider === 'ipfs' && !process.env.TEST) {
    return new URL(path ?? '', 'https://' + cacheDomain + '/' + config.ipfs.fleekKeys.bucket + '/').href
  } else {
    return new URL(path ?? '', 'https://' + cacheDomain).href
  }
}
