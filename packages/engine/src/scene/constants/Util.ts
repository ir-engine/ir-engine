import {
  Color,
  CompressedTexture,
  CubeTexture,
  CubeTextureLoader,
  DataTexture,
  PMREMGenerator,
  Texture,
  TextureLoader
} from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DDSLoader } from '../../assets/loaders/dds/DDSLoader'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'

export const textureLoader = new TextureLoader()

let pmremGenerator: PMREMGenerator

export const getPmremGenerator = (): PMREMGenerator => {
  if (!pmremGenerator) pmremGenerator = new PMREMGenerator(EngineRenderer.instance.renderer)
  return pmremGenerator
}

export const getRGBArray = (color: Color): Uint8Array => {
  const resolution = 64 // Min value required
  const size = resolution * resolution
  const data = new Uint8Array(4 * size)

  for (let i = 0; i < size; i++) {
    const stride = i * 4
    data[stride] = Math.floor(color.r * 255)
    data[stride + 1] = Math.floor(color.g * 255)
    data[stride + 2] = Math.floor(color.b * 255)
    data[stride + 3] = 255
  }

  return data
}

export const loadCubeMapTexture = (
  path: string,
  onLoad: (texture: CubeTexture) => void,
  onProgress?: (event: ProgressEvent<EventTarget>) => void,
  onError?: (event: ErrorEvent) => void
): void => {
  const negx = '/negx.jpg'
  const negy = '/negy.jpg'
  const negz = '/negz.jpg'
  const posx = '/posx.jpg'
  const posy = '/posy.jpg'
  const posz = '/posz.jpg'
  if (path[path.length - 1] === '/') path = path.slice(0, path.length - 1)
  const cubeTextureLoader = new CubeTextureLoader()
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
  const ddsTextureLoader = new DDSLoader()
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
