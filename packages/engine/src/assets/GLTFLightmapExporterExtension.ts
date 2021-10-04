import { GLTFExporterExtension } from './GLTFExporterExtension'
export class GLTFLightmapExporterExtension extends GLTFExporterExtension {
  onRegister() {
    this.exporter.addHook(
      'addMaterialProperties',
      () => true,
      (material, materialDef) => {
        if (material.lightMap) {
          materialDef.extensions.MOZ_lightmap = {
            index: this.exporter.processTexture(material.lightMap),
            texCoord: 1,
            intensity: material.lightMapIntensity
          }
          this.exporter.extensionsUsed.MOZ_lightmap = true
        }
      }
    )
  }
}
