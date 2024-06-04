import { iOS } from '@etherealengine/spatial/src/common/functions/isMobile'
import { ImageLoader, LoadingManager, Texture } from 'three'
import { Loader } from '../base/Loader'

class TextureLoader extends Loader<Texture> {
  constructor(manager?: LoadingManager) {
    super(manager)
  }

  async setupTextureForIOS(src: string): Promise<string> {
    return new Promise(async (resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' //browser will yell without this
      img.src = src
      await img.decode() //new way to wait for image to load
      // Initialize the canvas and it's size
      const canvas = document.createElement('canvas') //dead dom elements? Remove after Three loads them
      const ctx = canvas.getContext('2d')

      // Set width and height
      const originalWidth = img.width
      const originalHeight = img.height

      let resizingFactor = 1
      if (originalWidth >= originalHeight) {
        if (originalWidth > 1024) {
          resizingFactor = 1024 / originalWidth
        }
      } else {
        if (originalHeight > 1024) {
          resizingFactor = 1024 / originalHeight
        }
      }

      const canvasWidth = originalWidth * resizingFactor
      const canvasHeight = originalHeight * resizingFactor

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Draw image and export to a data-uri
      ctx?.drawImage(img, 0, 0, canvasWidth, canvasHeight)
      const dataURI = canvas.toDataURL()

      // Do something with the result, like overwrite original
      resolve(dataURI)
    })
  }

  override async load(
    url: string,
    onLoad: (loadedTexture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {
    if (iOS) {
      url = await this.setupTextureForIOS(url)
    }

    const texture = new Texture()
    const loader = new ImageLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)
    loader.load(
      url,
      (image) => {
        texture.image = image
        texture.needsUpdate = true
        onLoad(texture)
      },
      onProgress,
      onError
    )
  }
}

export { TextureLoader }
