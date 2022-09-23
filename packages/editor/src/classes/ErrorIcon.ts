import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three'
import { NearestFilter } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'

let errorTexturePromise = null! as Promise<Texture | null>
let errorTexture = null as Texture | null

export default class ErrorIcon extends Mesh {
  static async load() {
    if (errorTexturePromise) {
      return errorTexturePromise
    }
    errorTexturePromise = AssetLoader.loadAsync('/static/editor/media-error.png').then((texture) => {
      if (!texture) return null
      texture.magFilter = NearestFilter
      return texture
    })
    errorTexture = await errorTexturePromise
    return errorTexture
  }

  constructor() {
    if (!errorTexture) throw new Error('ErrorIcon must be loaded before it can be used. Await ErrorIcon.load()')

    const geometry = new PlaneGeometry()
    const material = new MeshBasicMaterial()
    material.map = errorTexture
    material.side = DoubleSide
    material.transparent = true
    material.needsUpdate = true
    super(geometry, material)
    this.name = 'ErrorIcon'
    this.type = 'ErrorIcon'
  }
}
