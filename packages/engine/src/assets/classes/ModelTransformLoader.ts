import {
  Extension,
  ExtensionProperty,
  NodeIO,
  PropertyType,
  ReaderContext,
  Texture,
  WriterContext
} from '@gltf-transform/core'
import {
  DracoMeshCompression,
  MeshGPUInstancing,
  MeshoptCompression,
  MeshQuantization,
  TextureBasisu
} from '@gltf-transform/extensions'
import { dedup, prune, quantize, reorder } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import { FileLoader } from 'three'

import { AssetType } from '../enum/AssetType'
import { AssetLoader } from './AssetLoader'

export type ModelTransformParameters = {
  useMeshopt: boolean
  useDraco: boolean
  useMeshQuantization: boolean
  textureFormat: 'default' | 'jpg' | 'ktx2' | 'webp'
}

const EXTENSION_NAME = 'MOZ_lightmap'

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
}

export class MOZLightmapExtension extends Extension {
  extensionName: string = EXTENSION_NAME

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
          matDef.extensions[EXTENSION_NAME] = {}
        }
      })
    return this
  }
}

export default async function ModelTransformLoader() {
  const io = new NodeIO()
  io.registerExtensions([MeshGPUInstancing, MeshoptCompression, MeshQuantization, TextureBasisu])
  io.registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder
  })

  //draco
  io.registerExtensions([DracoMeshCompression]).registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule()
  })

  io.registerExtensions([MOZLightmapExtension])

  const transformHistory: string[] = []
  return {
    io,
    load: async (src) => {
      const loader = new FileLoader()
      loader.setResponseType('arraybuffer')
      const data = (await loader.loadAsync(src)) as ArrayBuffer
      transformHistory.push(src)
      return io.readBinary(new Uint8Array(data))
    },
    get prev(): string | undefined {
      return transformHistory.length > 0 ? transformHistory[0] : undefined
    }
  }
}
