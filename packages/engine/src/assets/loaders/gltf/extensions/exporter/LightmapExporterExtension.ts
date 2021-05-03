import { ExporterExtension } from "./ExporterExtension";
export class LightmapExporterExtension extends ExporterExtension {
  onRegister() {
    this.exporter.addHook(
      "addMaterialProperties",
      () => true,
      (material, materialDef) => {
        if (material.lightMap) {
          materialDef.extensions.XREngine_lightmap = {
            index: this.exporter.processTexture(material.lightMap),
            texCoord: 1,
            intensity: material.lightMapIntensity
          };
          this.exporter.extensionsUsed.XREngine_lightmap = true;
        }
      }
    );
  }
}
