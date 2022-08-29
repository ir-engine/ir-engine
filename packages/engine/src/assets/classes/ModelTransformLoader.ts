import {
  Document,
  Extension,
  ExtensionProperty,
  IProperty,
  NodeIO,
  Nullable,
  PropertyType,
  ReaderContext,
  Texture,
  TextureInfo,
  WebIO,
  WriterContext
} from '@gltf-transform/core'
import {
  DracoMeshCompression,
  LightsPunctual,
  MaterialsClearcoat,
  MaterialsEmissiveStrength,
  MaterialsPBRSpecularGlossiness,
  MaterialsSpecular,
  MaterialsTransmission,
  MaterialsUnlit,
  MeshGPUInstancing,
  MeshoptCompression,
  MeshQuantization,
  TextureBasisu,
  TextureTransform
} from '@gltf-transform/extensions'
import fetch from 'cross-fetch'
import draco3d from 'draco3dgltf'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import { FileLoader } from 'three'

export type ModelTransformParameters = {
  useDraco: boolean
  useMeshopt: boolean
  useMeshQuantization: boolean
  textureFormat: 'default' | 'jpg' | 'ktx2' | 'png' | 'webp'
  maxTextureSize: number
  modelFormat: 'glb' | 'gltf'
}

const EXTENSION_NAME = 'MOZ_lightmap'

interface IMOZLightmap extends IProperty {
  lightMap: Texture
  lightMapInfo: TextureInfo
  lightMapIntensity: number
}

export class MOZLightmap extends ExtensionProperty {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'Lightmap'
  public declare parentTypes: [PropertyType.MATERIAL]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'Lightmap'
    this.parentTypes = [PropertyType.MATERIAL]
  }

  protected getDefaults(): Nullable<IMOZLightmap> {
    return Object.assign(super.getDefaults() as IProperty, {
      lightMap: null,
      lightMapInfo: new TextureInfo(this.graph, 'lightMapInfo'),
      lightMapIntensity: 1.0
    })
  }
}

export class MOZLightmapExtension extends Extension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  read(readerContext: ReaderContext): this {
    const materialDefs = readerContext.jsonDoc.json.materials || []
    materialDefs.forEach((def, idx) => {
      if (def.extensions && def.extensions[EXTENSION_NAME]) {
        readerContext.materials[idx].setExtension(EXTENSION_NAME, new MOZLightmap(this.document.getGraph()))
      }
    })
    return this
  }
  write(writerContext: WriterContext): this {
    const json = writerContext.jsonDoc
    this.document
      .getRoot()
      .listMaterials()
      .forEach((material) => {
        if (material.getExtension<MOZLightmap>(EXTENSION_NAME)) {
          const matIdx = writerContext.materialIndexMap.get(material)!
          const matDef = json.json.materials![matIdx]
          matDef.extensions = matDef.extensions || {}
          //matDef.extensions[EXTENSION_NAME] = {}
        }
      })
    return this
  }
}

const transformHistory: string[] = []
export default async function ModelTransformLoader() {
  const io = new NodeIO(fetch, {}).setAllowHTTP(true)
  io.registerExtensions([
    LightsPunctual,
    MaterialsSpecular,
    MaterialsClearcoat,
    MaterialsPBRSpecularGlossiness,
    MaterialsUnlit,
    MaterialsEmissiveStrength,
    MaterialsTransmission,
    DracoMeshCompression,
    MeshGPUInstancing,
    MeshoptCompression,
    MeshQuantization,
    TextureBasisu,
    TextureTransform
  ])
  io.registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule()
  })

  io.registerExtensions([MOZLightmapExtension])
  return {
    io,
    load: async (src, noHistory = false) => {
      const loader = new FileLoader()
      loader.setResponseType('arraybuffer')
      const data = (await loader.loadAsync(src)) as ArrayBuffer
      if (!noHistory) transformHistory.push(src)
      return io.readBinary(new Uint8Array(data))
    },
    //load: io.read,
    get prev(): string | undefined {
      return transformHistory.length > 0 ? transformHistory[0] : undefined
    }
  }
}
