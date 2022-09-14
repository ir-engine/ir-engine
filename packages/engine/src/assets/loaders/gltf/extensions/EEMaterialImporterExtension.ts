import { Material } from 'three'

import {
  materialIdToDefaultArgs,
  materialIdToFactory,
  protoIdToFactory,
  prototypeFromId
} from '../../../../renderer/materials/functions/Utilities'
import { MaterialLibrary } from '../../../../renderer/materials/MaterialLibrary'
import { EEMaterialExtensionType } from '../../../exporters/gltf/extensions/EEMaterialExporterExtension'
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
    const eeMaterial: EEMaterialExtensionType = materialDef.extensions[this.name]
    const factory = protoIdToFactory(eeMaterial.prototype)
    return factory
      ? (function (args) {
          const material = factory(args)
          material.uuid = eeMaterial.uuid
          return material
        } as unknown as typeof Material)
      : null
  }

  extendMaterialParams(materialIndex: number, materialParams: { [_: string]: any }) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const pending = []
    const extension: EEMaterialExtensionType = materialDef.extensions[this.name]
    const defaultArgs = MaterialLibrary.materials.has(extension.uuid)
      ? materialIdToDefaultArgs(extension.uuid)!
      : prototypeFromId(extension.prototype).arguments
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
