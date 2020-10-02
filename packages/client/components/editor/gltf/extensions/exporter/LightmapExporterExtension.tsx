import { ExporterExtension } from "./ExporterExtension";
export class LightmapExporterExtension extends ExporterExtension {
  onRegister() {
    this.exporter.addHook(
      "addMaterialProperties",
      () => true,
      (material, materialDef) => {
        if (material.lightMap) {
          //eslint-disable-next-line @typescript-eslint/camelcase
          materialDef.extensions.XR3_lightmap = {
            index: this.exporter.processTexture(material.lightMap),
            texCoord: 1,
            intensity: material.lightMapIntensity
          };
          //eslint-disable-next-line @typescript-eslint/camelcase
          this.exporter.extensionsUsed.XR3_lightmap = true;
        }
      }
    );
  }
}
