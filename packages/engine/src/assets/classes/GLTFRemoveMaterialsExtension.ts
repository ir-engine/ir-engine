import type { GLTFParser } from '../loaders/gltf/GLTFLoader'

export class GLTFRemoveMaterialsExtension {
  name = 'EXT_remove_materials'
  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }
  async beforeRoot() {
    const parser = this.parser
    const json = parser.json
    json.images = []
    json.textures = []
    json.materials = []
    json.samplers = []
    json.meshes.forEach((mesh) => {
      mesh.primitives.forEach((primitive) => {
        delete primitive.material
      })
    })
  }
  loadImage() {
    return null
  }
  loadMaterial() {
    return null
  }
  loadTexture() {
    return null
  }
}
