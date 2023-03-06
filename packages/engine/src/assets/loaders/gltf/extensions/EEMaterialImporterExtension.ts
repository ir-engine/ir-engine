import { Color, Material, Texture } from 'three'

import { getState } from '@etherealengine/hyperflux'

import {
  materialIdToDefaultArgs,
  materialIdToFactory,
  protoIdToFactory,
  prototypeFromId
} from '../../../../renderer/materials/functions/MaterialLibraryFunctions'
import { getMaterialLibrary, MaterialLibraryState } from '../../../../renderer/materials/MaterialLibrary'
import { EEMaterialExtensionType } from '../../../exporters/gltf/extensions/EEMaterialExporterExtension'
import { GLTFLoaderPlugin, GLTFParser } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export class EEMaterialImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_material'

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
    const extension: EEMaterialExtensionType = materialDef.extensions[this.name]
    const defaultArgs = getMaterialLibrary().materials[extension.uuid].value
      ? materialIdToDefaultArgs(extension.uuid)!
      : prototypeFromId(extension.prototype).arguments
    return Promise.all(
      Object.entries(extension.args).map(async ([k, v]) => {
        switch (defaultArgs[k]?.type) {
          case undefined:
            break
          case 'texture':
            if (!!v) {
              await parser.assignTexture(materialParams, k, v)
            }
            break
          case 'color':
            if (v && !(v as Color).isColor) {
              materialParams[k] = new Color(v)
              break
            }
          default:
            materialParams[k] = v
            break
        }
      })
    )
  }
}
