import { CubeTextureLoader, TextureLoader, PMREMGenerator } from 'three'
import { Engine } from '../../ecs/classes/Engine'

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
  if (!pmremGenerator) pmremGenerator = new PMREMGenerator(Engine.renderer)
  return pmremGenerator
}
