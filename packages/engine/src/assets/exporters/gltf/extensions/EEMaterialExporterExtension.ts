import { CubeTexture, Material, Texture } from 'three'

import { extractDefaults, materialToDefaultArgs } from '../../../../renderer/materials/functions/Utilities'
import { MaterialLibrary } from '../../../../renderer/materials/MaterialLibrary'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export type EEMaterialExtensionType = {
  uuid: string
  name: string
  prototype: string
  args: { [field: string]: any }
}

export default class EEMaterialExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'EE_material'
    this.matCache = new Map()
  }

  matCache: Map<any, any>

  writeMaterial(material: Material, materialDef) {
    const argData = materialToDefaultArgs(material)
    if (!argData) return
    const result: any = {}
    Object.entries(argData).map(([k, v]) => {
      switch (v.type) {
        case 'texture':
          if (material[k]) {
            if ((material[k] as CubeTexture).isCubeTexture) return //for skipping environment maps which cause errors
            const mapDef = { index: this.writer.processTexture(material[k]) }
            this.writer.applyTextureTransform(mapDef, material[k])
            result[k] = mapDef
          } else result[k] = material[k]
          break
        default:
          result[k] = material[k]
          break
      }
    })
    delete materialDef.pbrMetallicRoughness
    delete materialDef.normalTexture
    delete materialDef.emissiveTexture
    delete materialDef.emissiveFactor
    materialDef.extensions = materialDef.extensions ?? {}
    materialDef.extensions[this.name] = {
      uuid: material.uuid,
      name: material.name,
      prototype: MaterialLibrary.materials.get(material.uuid)?.prototype ?? material.type,
      args: { ...result }
    }
    this.writer.extensionsUsed[this.name] = true
  }
}
