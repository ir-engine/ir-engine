import { sRGBEncoding, RGBFormat } from 'three'
import { GLTFLoaderExtension } from './GLTFLoaderExtension'
function getLightmap(materialDef) {
  return materialDef.extensions && materialDef.extensions[GLTFLightmapLoaderExtension.extensionName]
}

function shouldSetMaterialParams(_material, materialDef) {
  return getLightmap(materialDef)
}

export class GLTFLightmapLoaderExtension extends GLTFLoaderExtension {
  static extensionName = 'MOZ_lightmap'

  extensionNames = [GLTFLightmapLoaderExtension.extensionName]

  onLoad() {
    if (this.loader.usesExtension(GLTFLightmapLoaderExtension.extensionName)) {
      this.loader.addHook('setMaterialParams', shouldSetMaterialParams, this.setMaterialParams)
    }
  }
  setMaterialParams = async (material, materialDef) => {
    const lightmap = getLightmap(materialDef)
    if (lightmap) {
      material.lightMapIntensity = lightmap.intensity === undefined ? 1 : lightmap.intensity
      await this.loader.assignTexture(material, 'lightMap', lightmap, sRGBEncoding, RGBFormat)
    }
  }
}
