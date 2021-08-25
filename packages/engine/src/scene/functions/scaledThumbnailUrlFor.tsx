import { Config } from '@xrengine/common/src/config'
export const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * scaledThumbnailUrlFor function component for providing url for scaled thumbnail.
 *
 * @author Robert Long
 * @param  {any} url    [contains thumbnail url]
 * @param  {any} width
 * @param  {any} height
 * @return {any}        [returns url to get scaled image]
 */

export const scaledThumbnailUrlFor = (url, width, height) => {
  return `${serverURL}/thumbnail/${url}?w=${width}&h=${height}`
}
