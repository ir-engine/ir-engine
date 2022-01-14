import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, DoubleSide, Texture } from 'three'
import { RGBAFormat, NearestFilter } from 'three'
import loadTexture from '@xrengine/engine/src/assets/functions/loadTexture'

let errorTexturePromise = null! as Promise<Texture | null>
let errorTexture = null as Texture | null

export default class ErrorIcon extends Mesh {
  static async load() {
    if (errorTexturePromise) {
      return errorTexturePromise
    }
    errorTexturePromise = loadTexture('/static/editor/media-error.png').then((texture) => {
      if (!texture) return null
      texture.format = RGBAFormat
      texture.magFilter = NearestFilter
      return texture
    })
    errorTexture = await errorTexturePromise
    return errorTexture
  }

  constructor() {
    if (!errorTexture) throw new Error('ErrorIcon must be loaded before it can be used. Await ErrorIcon.load()')

    const geometry = new PlaneBufferGeometry()
    const material = new MeshBasicMaterial()
    material.map = errorTexture
    material.side = DoubleSide
    material.transparent = true
    super(geometry, material)
    this.name = 'ErrorIcon'
    this.type = 'ErrorIcon'
  }
}
