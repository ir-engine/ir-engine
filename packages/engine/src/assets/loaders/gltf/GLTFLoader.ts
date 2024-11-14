/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { GLTF as GLTFDocument } from '@gltf-transform/core'
import {
  AnimationClip,
  Camera,
  Group,
  LoaderUtils,
  LoadingManager,
  Material,
  Mesh,
  Object3D,
  Scene,
  SkinnedMesh,
  Texture
} from 'three'

import { parseStorageProviderURLs } from '../../functions/parseSceneJSON'
import { FileLoader } from '../base/FileLoader'
import { Loader } from '../base/Loader'
import { DRACOLoader } from './DRACOLoader'
import {
  BINARY_EXTENSION_HEADER_MAGIC,
  EXTENSIONS,
  GLTFBinaryExtension,
  GLTFDracoMeshCompressionExtension,
  GLTFLightsExtension,
  GLTFMaterialsAnisotropyExtension,
  GLTFMaterialsClearcoatExtension,
  GLTFMaterialsEmissiveStrengthExtension,
  GLTFMaterialsIorExtension,
  GLTFMaterialsIridescenceExtension,
  GLTFMaterialsSheenExtension,
  GLTFMaterialsSpecularExtension,
  GLTFMaterialsTransmissionExtension,
  GLTFMaterialsUnlitExtension,
  GLTFMaterialsVolumeExtension,
  GLTFMeshGpuInstancing,
  GLTFMeshoptCompression,
  GLTFMeshQuantizationExtension,
  GLTFTextureAVIFExtension,
  GLTFTextureBasisUExtension,
  GLTFTextureTransformExtension,
  GLTFTextureWebPExtension
} from './GLTFExtensions'
import { GLTFParser } from './GLTFParser'
import { KTX2Loader } from './KTX2Loader'
import { MeshoptDecoder } from './meshopt_decoder'

export class GLTFLoader extends Loader {
  dracoLoader = null as null | DRACOLoader
  ktx2Loader = null as null | KTX2Loader
  meshoptDecoder = null as null | MeshoptDecoder

  pluginCallbacks = [] as any[]

  constructor(manager?: LoadingManager) {
    super(manager)

    this.register(function (parser) {
      return new GLTFMaterialsClearcoatExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFTextureBasisUExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFTextureWebPExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFTextureAVIFExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsSheenExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsTransmissionExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsVolumeExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsIorExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsEmissiveStrengthExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsSpecularExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsIridescenceExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMaterialsAnisotropyExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFLightsExtension(parser)
    })

    this.register(function (parser) {
      return new GLTFMeshoptCompression(parser)
    })

    this.register(function (parser) {
      return new GLTFMeshGpuInstancing(parser)
    })
  }

  load(url, onLoad, onProgress?, onError?, signal?) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this

    let resourcePath

    if (this.resourcePath !== '') {
      resourcePath = this.resourcePath
    } else if (this.path !== '') {
      resourcePath = this.path
    } else {
      resourcePath = LoaderUtils.extractUrlBase(url)
    }

    // Tells the LoadingManager to track an extra item, which resolves after
    // the model is fully loaded. This means the count of items loaded will
    // be incorrect, but ensures manager.onLoad() does not fire early.
    this.manager.itemStart(url)

    const _onError = function (e) {
      if (onError) {
        onError(e)
      } else {
        console.error(e)
      }

      scope.manager.itemError(url)
      scope.manager.itemEnd(url)
    }

    const loader = new FileLoader(this.manager)

    loader.setPath(this.path)
    loader.setResponseType('arraybuffer')
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    loader.load(
      url,
      function (data: string | ArrayBuffer | GLTFDocument.IGLTF) {
        const extensions = {}
        const textDecoder = new TextDecoder()
        let json: GLTFDocument.IGLTF

        if (typeof data === 'string') {
          json = JSON.parse(data)
        } else if ('byteLength' in data) {
          const magic = textDecoder.decode(new Uint8Array(data, 0, 4))

          if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
            try {
              extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data)
            } catch (error) {
              if (onError) onError(error)
              return
            }

            json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content)
          } else {
            try {
              json = JSON.parse(textDecoder.decode(data))
            } catch (error) {
              if (onError) onError(error)
              return
            }
          }
        } else {
          json = data
        }

        try {
          scope.parse(
            json,
            resourcePath,
            function (gltf) {
              onLoad(gltf)

              scope.manager.itemEnd(url)
            },
            _onError,
            url,
            extensions
          )
        } catch (e) {
          _onError(e)
        }
      },
      onProgress,
      _onError,
      signal
    )
  }

  setDRACOLoader(dracoLoader) {
    this.dracoLoader = dracoLoader
    return this
  }

  setDDSLoader() {
    throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')
  }

  setKTX2Loader(ktx2Loader) {
    this.ktx2Loader = ktx2Loader
    return this
  }

  setMeshoptDecoder(meshoptDecoder) {
    this.meshoptDecoder = meshoptDecoder
    return this
  }

  registerFirst(callback) {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.unshift(callback)
    }

    return this
  }

  register(callback) {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.push(callback)
    }

    return this
  }

  unregister(callback) {
    if (this.pluginCallbacks.indexOf(callback) !== -1) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1)
    }

    return this
  }

  // @ts-ignore
  parse(json: GLTFDocument.IGLTF, path, onLoad, onError, url = '', extensions) {
    const plugins = {}

    if (json.asset === undefined || (json.asset.version[0] as any as number) < 2) {
      if (onError) onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'))
      return
    }

    // Populate storage provider URLs
    parseStorageProviderURLs(json)

    const parser = new GLTFParser(json, {
      url,
      path: path || this.resourcePath || '',
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    })

    parser.fileLoader.setRequestHeader(this.requestHeader)

    for (let i = 0; i < this.pluginCallbacks.length; i++) {
      const plugin = this.pluginCallbacks[i](parser)

      if (!plugin.name) console.error('THREE.GLTFLoader: Invalid plugin found: missing name')

      plugins[plugin.name] = plugin

      // Workaround to avoid determining as unknown extension
      // in addUnknownExtensionsToUserData().
      // Remove this workaround if we move all the existing
      // extension handlers to plugin system
      extensions[plugin.name] = true
    }

    if (json.extensionsUsed) {
      for (let i = 0; i < json.extensionsUsed.length; ++i) {
        const extensionName = json.extensionsUsed[i]
        const extensionsRequired = json.extensionsRequired || []

        switch (extensionName) {
          case EXTENSIONS.KHR_MATERIALS_UNLIT:
            extensions[extensionName] = new GLTFMaterialsUnlitExtension()
            break

          case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader)
            break

          case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
            extensions[extensionName] = new GLTFTextureTransformExtension()
            break

          case EXTENSIONS.KHR_MESH_QUANTIZATION:
            extensions[extensionName] = new GLTFMeshQuantizationExtension()
            break

          default:
            if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === undefined) {
              console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".')
            }
        }
      }
    }

    parser.setExtensions(extensions)
    parser.setPlugins(plugins)
    parser.parse(onLoad, onError)
  }

  // parseAsync(data, path) {
  //   // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   const scope = this

  //   return new Promise(function (resolve, reject) {
  //     scope.parse(data, path, resolve, reject)
  //   })
  // }
}

export interface GLTF {
  animations: AnimationClip[]
  scene: Scene
  scenes: Scene[]
  cameras: Camera[]
  asset: {
    copyright?: string | undefined
    generator?: string | undefined
    version?: string | undefined
    minVersion?: string | undefined
    extensions?: any
    extras?: any
  }
  parser?: GLTFParser
  userData: any
}

export interface GLTFLoaderPlugin {
  beforeRoot?: (() => Promise<void> | null) | undefined
  afterRoot?: ((result: GLTF) => Promise<void> | null) | undefined
  loadMesh?: ((meshIndex: number) => Promise<Group | Mesh | SkinnedMesh> | null) | undefined
  loadBufferView?: ((bufferViewIndex: number) => Promise<ArrayBuffer> | null) | undefined
  loadMaterial?: ((materialIndex: number) => Promise<Material> | null) | undefined
  loadTexture?: ((textureIndex: number) => Promise<Texture> | null) | undefined
  getMaterialType?: ((materialIndex: number) => typeof Material | null) | undefined
  extendMaterialParams?:
    | ((materialIndex: number, materialParams: { [key: string]: any }) => Promise<any> | null)
    | undefined
  createNodeAttachment?: ((nodeIndex: number) => Promise<Object3D> | null) | undefined
}
