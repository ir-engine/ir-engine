import { KHR_TEXTURE_TRANSFORM } from '@gltf-transform/extensions/src/constants'
import { Material, Texture } from 'three'

import { ExporterExtension } from './ExporterExtension'

export class LightmapExporterExtension extends ExporterExtension {
  constructor(writer) {
    super(writer)
    this.name = 'MOZ_lightmap'
  }

  writeMaterial(
    material: Material & {
      lightMap?: Texture
      lightMapIntensity?: number
    },
    materialDef
  ) {
    if (material.lightMap) {
      const lightMap = material.lightMap
      const offset = lightMap.offset.toArray()
      const scale = lightMap.repeat.toArray()
      const rotation = lightMap.rotation
      materialDef.extensions = materialDef.extensions ?? {}
      materialDef.extensions.MOZ_lightmap = {
        index: this.writer.processTexture(material.lightMap),
        texCoord: 1,
        intensity: material.lightMapIntensity,
        extensions: {
          [KHR_TEXTURE_TRANSFORM]: {
            offset,
            scale,
            rotation,
            texCoord: 1
          }
        }
      }
      this.writer.extensionsUsed.MOZ_lightmap = true
    }
  }
}
