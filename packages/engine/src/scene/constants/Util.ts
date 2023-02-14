import jsPath from 'path'
import { CompressedTexture, CubeTexture, CubeTextureLoader, PMREMGenerator, Texture, TextureLoader } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DDSLoader } from '../../assets/loaders/dds/DDSLoader'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'

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

export const loadCompressedCubeMapTexture = (
  path: string,
  onLoad: (texture: CubeTexture) => void,
  onProgress?: (event: ProgressEvent<EventTarget>) => void,
  onError?: (event: ErrorEvent) => void
): void => {
  const loadTexturesPromise = new Promise<Texture[]>(async (resolve, reject) => {
    const fileNames = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz']
    const textures = fileNames.map(async (fileName) => {
      const filePath = jsPath.join(path, `${fileName}.ktx2`)
      const result = (await AssetLoader.loadAsync(filePath)) as Texture
      return result
    })
    resolve(Promise.all(textures))
  })
  loadTexturesPromise.then((textures) => {
    const cubemap = new CubeTexture(textures)
    onLoad(cubemap)
  })
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
