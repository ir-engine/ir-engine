import { Material } from 'three'

import { materialTypeToDefaultArgs, materialTypeToFactory } from '../../../../renderer/materials/Utilities'
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
    return factory
      ? (function (args) {
          return factory(args).material
        } as unknown as typeof Material)
      : null
  }

  extendMaterialParams(materialIndex: number, materialParams: { [_: string]: any }) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const pending = []
    const extension = materialDef.extensions[this.name]
    const defaultArgs = materialTypeToDefaultArgs(extension.type)!
    Object.entries(extension.args).map(async ([k, v]) => {
      materialParams[k] = v
    })
    return Promise.all(
      Object.entries(defaultArgs)
        .filter(([k, v]) => v.type === 'texture' && materialParams[k])
        .map(async ([k, v]) => parser.assignTexture(materialParams, k, materialParams[k]))
    )
  }
}
