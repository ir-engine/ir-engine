import {
  Extension,
  ExtensionProperty,
  IProperty,
  Nullable,
  PropertyType,
  ReaderContext,
  Texture,
  TextureInfo,
  WebIO,
  WriterContext
} from '@gltf-transform/core'
import { MeshGPUInstancing, MeshoptCompression, MeshQuantization, TextureBasisu } from '@gltf-transform/extensions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import { FileLoader } from 'three'

export type ModelTransformParameters = {
  useMeshopt: boolean
  useMeshQuantization: boolean
  textureFormat: 'default' | 'jpg' | 'ktx2' | 'png' | 'webp'
  maxTextureSize: number
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
export default function ModelTransformLoader() {
  const io = new WebIO()
  io.registerExtensions([MeshGPUInstancing, MeshoptCompression, MeshQuantization, TextureBasisu])
  io.registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder
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
    get prev(): string | undefined {
      return transformHistory.length > 0 ? transformHistory[0] : undefined
    }
  }
}
