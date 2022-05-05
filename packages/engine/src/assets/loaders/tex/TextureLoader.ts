import { ImageBitmapLoader, ImageLoader, Loader, LoadingManager, RGBAFormat, Texture } from 'three'

import { isWebWorker } from '../../../common/functions/getEnvironment'

export class TextureLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager)
  }

  load(url, onLoad, onProgress, onError) {
    const texture = new Texture()
    const loader = new (isWebWorker ? ImageBitmapLoader : ImageLoader)(this.manager)
    loader.setCrossOrigin(this.crossOrigin)
    loader.setPath(this.path)
    if (isWebWorker) {
      ;(loader as ImageBitmapLoader).setOptions({ imageOrientation: 'flipY' })
    }
    loader.load(
      url,
      (image) => {
        texture.image = image
        texture.needsUpdate = true
        if (onLoad !== undefined) {
          onLoad(texture)
        }
      },
      onProgress,
      onError
    )
    return texture
  }
}
