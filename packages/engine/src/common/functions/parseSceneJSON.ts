import { config } from '@etherealengine/common/src/config'

export const sceneRelativePathIdentifier = '__$project$__'
export const sceneCorsPathIdentifier = '__$cors-proxy$__'
const storageProviderHost = config.client.fileServer ?? `https://localhost:8642`
const corsPath = config.client.cors.serverPort ? config.client.cors.proxyUrl : `https://localhost:3029`

export const parseStorageProviderURLs = (data: any) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = parseStorageProviderURLs(val)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        data[key] = `${storageProviderHost}/projects` + data[key].replace(sceneRelativePathIdentifier, '')
      }
      if (val.startsWith(sceneCorsPathIdentifier)) {
        data[key] = data[key].replace(sceneCorsPathIdentifier, corsPath)
      }
    }
  }
  return data
}

export const cleanStorageProviderURLs = (data: any) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = cleanStorageProviderURLs(val)
    }
    if (typeof val === 'string') {
      if (val.includes(storageProviderHost + '/projects')) {
        data[key] = val.replace(storageProviderHost + '/projects', sceneRelativePathIdentifier)
      } else if (val.startsWith(config.client.cors.proxyUrl)) {
        data[key] = val.replace(config.client.cors.proxyUrl, sceneCorsPathIdentifier)
      }
    }
  }
  return data
}
