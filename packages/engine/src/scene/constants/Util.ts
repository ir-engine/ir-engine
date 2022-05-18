import { CompressedTexture, CubeTexture, CubeTextureLoader, PMREMGenerator, TextureLoader } from 'three'

import { DDSLoader } from '../../assets/loaders/dds/DDSLoader'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'

export const negx = '/negx.jpg'
export const negy = '/negy.jpg'
export const negz = '/negz.jpg'
export const posx = '/posx.jpg'
export const posy = '/posy.jpg'
export const posz = '/posz.jpg'

export const cubeTextureLoader = new CubeTextureLoader()
const ddsTextureLoader = new DDSLoader()

export const textureLoader = new TextureLoader()
let pmremGenerator: PMREMGenerator

export const getPmremGenerator = (): PMREMGenerator => {
  if (!pmremGenerator) pmremGenerator = new PMREMGenerator(EngineRenderer.instance.renderer)
  return pmremGenerator
}
export const loadCubeMapTexture = (
  path: string,
  onLoad: (texture: CubeTexture) => void,
  onProgress?: (event: ProgressEvent<EventTarget>) => void,
  onError?: (event: ErrorEvent) => void
): void => {
  if (path[path.length - 1] === '/') path = path.slice(0, path.length - 1)
  cubeTextureLoader.setPath(path).load(
    [posx, negx, posy, negy, posz, negz],
    (texture) => {
      onLoad(texture)
      texture.dispose()
    },
    (res) => {
      if (onProgress) onProgress(res)
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}

export const loadDDSTexture = (
  path: string,
  onLoad: (texture: CompressedTexture) => void,
  onProgress?: (event: ProgressEvent<EventTarget>) => void,
  onError?: (event: ErrorEvent) => void
): void => {
  ddsTextureLoader.load(
    path,
    (texture) => {
      onLoad(texture)
      texture.dispose()
    },
    (res) => {
      if (onProgress) onProgress(res)
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}
