import { NodeIO, Texture } from '@gltf-transform/core'
import { MeshGPUInstancing, MeshoptCompression, MeshQuantization, TextureBasisu } from '@gltf-transform/extensions'
import { dedup, prune, quantize, reorder } from '@gltf-transform/functions'
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

export default function ModelTransformLoader() {
  const io = new NodeIO()
  io.registerExtensions([MeshGPUInstancing, MeshoptCompression, MeshQuantization, TextureBasisu])
  io.registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder
  })

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
