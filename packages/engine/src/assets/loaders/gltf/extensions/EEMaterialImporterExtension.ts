import { Material } from 'three'

import { materialTypeToFactory } from '../../../../renderer/materials/Utilities'
import { GLTFLoaderPlugin, GLTFParser } from '../GLTFLoader'

export class EEMaterialImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_material'

  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex: number) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return null
    const eeMaterial = materialDef.extensions[this.name]
    const factory = materialTypeToFactory(eeMaterial.type)
    return factory ? (((args) => factory(args).material) as unknown as typeof Material) : null
  }

  extendMaterialParams(materialIndex: number, materialParams: { [_: string]: any }) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const pending = []
    const extension = materialDef.extensions[this.name]
    Object.entries(extension.args).map(([k, v]) => {
      materialParams[k] = v
    })
    return Promise.resolve()
  }
}
