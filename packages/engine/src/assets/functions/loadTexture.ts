import { TextureLoader } from 'three'
import { isClient } from '../../common/functions/isClient'
import { corsAnywhereUrl } from '@xrengine/client-core/src/util/cors'

export default function loadTexture(src, textureLoader: any = new TextureLoader()) {
  return new Promise((resolve, reject) => {
    if (!isClient) resolve(null)
    textureLoader.load(corsAnywhereUrl(src), resolve, null, (error) =>
      reject(new Error(`Error loading texture "${src}"`))
    )
  })
}
