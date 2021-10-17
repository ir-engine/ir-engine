import { CubeTextureLoader, RGBFormat } from 'three'
import { RethrownError } from '../functions/errors'
import i18n from 'i18next'

const negx = '/cubemap/negx.jpg'
const negy = '/cubemap/negy.jpg'
const negz = '/cubemap/negz.jpg'
const posx = '/cubemap/posx.jpg'
const posy = '/cubemap/posy.jpg'
const posz = '/cubemap/posz.jpg'
let cubeMapTexturePromise = null

const defaultCubeMapURLs = [posx, negx, posy, negy, posz, negz]

export let environmentMap = null

/**
 *
 * @author Robert Long
 * @returns
 */
export function loadEnvironmentMap(cubeMapURLs?: string[]) {
  if (cubeMapTexturePromise) {
    return cubeMapTexturePromise
  }
  cubeMapTexturePromise = new Promise((resolve, reject) => {
    cubeMapURLs = cubeMapURLs || defaultCubeMapURLs
    cubeMapTexturePromise = new CubeTextureLoader().load(
      cubeMapURLs,
      (texture) => {
        texture.format = RGBFormat
        environmentMap = texture
        resolve(texture)
      },
      null,
      (error) =>
        reject(
          new RethrownError(
            i18n.t('editor:envMapError', { files: cubeMapURLs.map((url) => `"${url}"`).join(', ') }),
            error
          )
        )
    )
  })
  return cubeMapTexturePromise
}
