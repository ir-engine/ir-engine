import { ExporterExtension } from './ExporterExtension'

export class LightmapExporterExtension extends ExporterExtension {
  writeMaterial(material, materialDef) {
    if (material.lightMap) {
      materialDef.extensions.MOZ_lightmap = {
        index: this.writer.processTexture(material.lightMap),
        texCoord: 1,
        intensity: material.lightMapIntensity
      }
      this.writer.extensionsUsed.MOZ_lightmap = true
    }
  }
}
