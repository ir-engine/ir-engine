export const getCachedAsset = (path: string, cacheDomain: string) => {
  return path && cacheDomain ? new URL(path, 'https://' + cacheDomain).href : ''
}
