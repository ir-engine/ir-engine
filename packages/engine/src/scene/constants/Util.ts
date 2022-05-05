import { CubeTextureLoader, PMREMGenerator, TextureLoader } from 'three'

import { EngineRenderer } from '../../renderer/WebGLRendererSystem'

export const negx = 'negx.jpg'
export const negy = 'negy.jpg'
export const negz = 'negz.jpg'
export const posx = 'posx.jpg'
export const posy = 'posy.jpg'
export const posz = 'posz.jpg'

export const cubeTextureLoader = new CubeTextureLoader()
export const textureLoader = new TextureLoader()
let pmremGenerator: PMREMGenerator

export const getPmremGenerator = (): PMREMGenerator => {
  if (!pmremGenerator) pmremGenerator = new PMREMGenerator(EngineRenderer.instance.renderer)
  return pmremGenerator
}
