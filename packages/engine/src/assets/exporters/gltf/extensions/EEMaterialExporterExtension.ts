import { Material } from 'three'

import { extractDefaults, materialToDefaultArgs } from '../../../../renderer/materials/Utilities'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class EEMaterialExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer, {})
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
          result[k] = material[k]?.source?.data?.src ?? null
          break
        default:
          result[k] = material[k]
          break
      }
    })
    materialDef.extensions = materialDef.extensions ?? {}
    materialDef.extensions.EE_material = {
      ...result
    }
    this.writer.extensionsUsed.EE_material = true
  }
}
