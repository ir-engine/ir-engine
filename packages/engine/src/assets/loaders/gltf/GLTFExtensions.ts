/*********************************/
/********** EXTENSIONS ***********/
/*********************************/

import {
  Color,
  DirectionalLight,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearSRGBColorSpace,
  Matrix4,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PointLight,
  Quaternion,
  SRGBColorSpace,
  SpotLight,
  Vector2,
  Vector3
} from 'three'
import { ATTRIBUTES, WEBGL_COMPONENT_TYPES, WEBGL_CONSTANTS } from './GLTFConstants'
import { assignExtrasToUserData } from './GLTFLoaderFunctions'

export const EXTENSIONS = {
  KHR_BINARY_GLTF: 'KHR_binary_glTF',
  KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
  KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
  KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
  KHR_MATERIALS_IOR: 'KHR_materials_ior',
  KHR_MATERIALS_SHEEN: 'KHR_materials_sheen',
  KHR_MATERIALS_SPECULAR: 'KHR_materials_specular',
  KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
  KHR_MATERIALS_IRIDESCENCE: 'KHR_materials_iridescence',
  KHR_MATERIALS_ANISOTROPY: 'KHR_materials_anisotropy',
  KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
  KHR_MATERIALS_VOLUME: 'KHR_materials_volume',
  KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
  KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
  KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
  KHR_MATERIALS_EMISSIVE_STRENGTH: 'KHR_materials_emissive_strength',
  EXT_MATERIALS_BUMP: 'EXT_materials_bump',
  EXT_TEXTURE_WEBP: 'EXT_texture_webp',
  EXT_TEXTURE_AVIF: 'EXT_texture_avif',
  EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression',
  EXT_MESH_GPU_INSTANCING: 'EXT_mesh_gpu_instancing',
  EE_MATERIAL: 'EE_material'
}

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
export class GLTFLightsExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL

    // Object3D instance caches
    this.cache = { refs: {}, uses: {} }
  }

  _markDefs() {
    const parser = this.parser
    const nodeDefs = this.parser.json.nodes || []

    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex]

      if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== undefined) {
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light)
      }
    }
  }

  _loadLight(lightIndex) {
    const parser = this.parser
    const cacheKey = 'light:' + lightIndex
    let dependency = parser.cache.get(cacheKey)

    if (dependency) return dependency

    const json = parser.json
    const extensions = (json.extensions && json.extensions[this.name]) || {}
    const lightDefs = extensions.lights || []
    const lightDef = lightDefs[lightIndex]
    let lightNode

    const color = new Color(0xffffff)

    if (lightDef.color !== undefined)
      color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace)

    const range = lightDef.range !== undefined ? lightDef.range : 0

    switch (lightDef.type) {
      case 'directional':
        lightNode = new DirectionalLight(color)
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      case 'point':
        lightNode = new PointLight(color)
        lightNode.distance = range
        break

      case 'spot':
        lightNode = new SpotLight(color)
        lightNode.distance = range
        // Handle spotlight properties.
        lightDef.spot = lightDef.spot || {}
        lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0
        lightDef.spot.outerConeAngle =
          lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0
        lightNode.angle = lightDef.spot.outerConeAngle
        lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      default:
        throw new Error('THREE.GLTFLoader: Unexpected light type: ' + lightDef.type)
    }

    // Some lights (e.g. spot) default to a position other than the origin. Reset the position
    // here, because node-level parsing will only override position if explicitly specified.
    lightNode.position.set(0, 0, 0)

    lightNode.decay = 2

    assignExtrasToUserData(lightNode, lightDef)

    if (lightDef.intensity !== undefined) lightNode.intensity = lightDef.intensity

    lightNode.name = parser.createUniqueName(lightDef.name || 'light_' + lightIndex)

    dependency = Promise.resolve(lightNode)

    parser.cache.add(cacheKey, dependency)

    return dependency
  }

  getDependency(type, index) {
    if (type !== 'light') return

    return this._loadLight(index)
  }

  createNodeAttachment(nodeIndex) {
    const self = this
    const parser = this.parser
    const json = parser.json
    const nodeDef = json.nodes[nodeIndex]
    const lightDef = (nodeDef.extensions && nodeDef.extensions[this.name]) || {}
    const lightIndex = lightDef.light

    if (lightIndex === undefined) return null

    return this._loadLight(lightIndex).then(function (light) {
      return parser._getNodeRef(self.cache, lightIndex, light)
    })
  }
}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
export class GLTFMaterialsUnlitExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MATERIALS_UNLIT
  }

  getMaterialType() {
    return MeshBasicMaterial
  }

  extendParams(materialParams, materialDef, parser) {
    const pending = []

    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    const metallicRoughness = materialDef.pbrMetallicRoughness

    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor

        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace)
        materialParams.opacity = array[3]
      }

      if (metallicRoughness.baseColorTexture !== undefined) {
        pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture, SRGBColorSpace))
      }
    }

    return Promise.all(pending)
  }
}

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
export class GLTFMaterialsEmissiveStrengthExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const emissiveStrength = materialDef.extensions[this.name].emissiveStrength

    if (emissiveStrength !== undefined) {
      materialParams.emissiveIntensity = emissiveStrength
    }

    return Promise.resolve()
  }
}

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
export class GLTFMaterialsClearcoatExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    if (extension.clearcoatFactor !== undefined) {
      materialParams.clearcoat = extension.clearcoatFactor
    }

    if (extension.clearcoatTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatMap', extension.clearcoatTexture))
    }

    if (extension.clearcoatRoughnessFactor !== undefined) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor
    }

    if (extension.clearcoatRoughnessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture))
    }

    if (extension.clearcoatNormalTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture))

      if (extension.clearcoatNormalTexture.scale !== undefined) {
        const scale = extension.clearcoatNormalTexture.scale

        materialParams.clearcoatNormalScale = new Vector2(scale, scale)
      }
    }

    return Promise.all(pending)
  }
}

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
export class GLTFMaterialsIridescenceExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    if (extension.iridescenceFactor !== undefined) {
      materialParams.iridescence = extension.iridescenceFactor
    }

    if (extension.iridescenceTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'iridescenceMap', extension.iridescenceTexture))
    }

    if (extension.iridescenceIor !== undefined) {
      materialParams.iridescenceIOR = extension.iridescenceIor
    }

    if (materialParams.iridescenceThicknessRange === undefined) {
      materialParams.iridescenceThicknessRange = [100, 400]
    }

    if (extension.iridescenceThicknessMinimum !== undefined) {
      materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum
    }

    if (extension.iridescenceThicknessMaximum !== undefined) {
      materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum
    }

    if (extension.iridescenceThicknessTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'iridescenceThicknessMap', extension.iridescenceThicknessTexture)
      )
    }

    return Promise.all(pending)
  }
}

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export class GLTFMaterialsSheenExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_SHEEN
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    materialParams.sheenColor = new Color(0, 0, 0)
    materialParams.sheenRoughness = 0
    materialParams.sheen = 1

    const extension = materialDef.extensions[this.name]

    if (extension.sheenColorFactor !== undefined) {
      const colorFactor = extension.sheenColorFactor
      materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace)
    }

    if (extension.sheenRoughnessFactor !== undefined) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor
    }

    if (extension.sheenColorTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'sheenColorMap', extension.sheenColorTexture, SRGBColorSpace))
    }

    if (extension.sheenRoughnessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'sheenRoughnessMap', extension.sheenRoughnessTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export class GLTFMaterialsTransmissionExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    if (extension.transmissionFactor !== undefined) {
      materialParams.transmission = extension.transmissionFactor
    }

    if (extension.transmissionTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'transmissionMap', extension.transmissionTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export class GLTFMaterialsVolumeExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_VOLUME
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    materialParams.thickness = extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0

    if (extension.thicknessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'thicknessMap', extension.thicknessTexture))
    }

    materialParams.attenuationDistance = extension.attenuationDistance || Infinity

    const colorArray = extension.attenuationColor || [1, 1, 1]
    materialParams.attenuationColor = new Color().setRGB(
      colorArray[0],
      colorArray[1],
      colorArray[2],
      LinearSRGBColorSpace
    )

    return Promise.all(pending)
  }
}

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
export class GLTFMaterialsIorExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_IOR
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const extension = materialDef.extensions[this.name]

    materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5

    return Promise.resolve()
  }
}

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
export class GLTFMaterialsSpecularExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    materialParams.specularIntensity = extension.specularFactor !== undefined ? extension.specularFactor : 1.0

    if (extension.specularTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'specularIntensityMap', extension.specularTexture))
    }

    const colorArray = extension.specularColorFactor || [1, 1, 1]
    materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace)

    if (extension.specularColorTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'specularColorMap', extension.specularColorTexture, SRGBColorSpace)
      )
    }

    return Promise.all(pending)
  }
}

/**
 * Materials bump Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/EXT_materials_bump
 */
export class GLTFMaterialsBumpExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.EXT_MATERIALS_BUMP
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    materialParams.bumpScale = extension.bumpFactor !== undefined ? extension.bumpFactor : 1.0

    if (extension.bumpTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'bumpMap', extension.bumpTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Materials anisotropy Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
 */
export class GLTFMaterialsAnisotropyExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    if (extension.anisotropyStrength !== undefined) {
      materialParams.anisotropy = extension.anisotropyStrength
    }

    if (extension.anisotropyRotation !== undefined) {
      materialParams.anisotropyRotation = extension.anisotropyRotation
    }

    if (extension.anisotropyTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'anisotropyMap', extension.anisotropyTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * BasisU Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
 */
export class GLTFTextureBasisUExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_TEXTURE_BASISU
  }

  loadTexture(textureIndex) {
    const parser = this.parser
    const json = parser.json
    /*
    // if no texture at textureIndex, check if image exists
    if ( ! json.textures[textureIndex] && json.images[ textureIndex ]) {
      //if image exists, create textureDef for it
      json.textures[textureIndex] = {
        source: textureIndex,
        sampler: 0
      }
    }*/

    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[this.name]) {
      return null
    }

    const extension = textureDef.extensions[this.name]
    const loader = parser.options.ktx2Loader

    if (!loader) {
      if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
        throw new Error('THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures')
      } else {
        // Assumes that the extension is optional and that a fallback texture is present
        return null
      }
    }

    return parser.loadTextureImage(textureIndex, extension.source, loader)
  }
}

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
export class GLTFTextureWebPExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.EXT_TEXTURE_WEBP
    this.isSupported = null
  }

  loadTexture(textureIndex) {
    const name = this.name
    const parser = this.parser
    const json = parser.json

    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null
    }

    const extension = textureDef.extensions[name]
    const source = json.images[extension.source]

    let loader = parser.textureLoader
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri)
      if (handler !== null) loader = handler
    }

    return this.detectSupport().then(function (isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader)

      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error('THREE.GLTFLoader: WebP required by asset but unsupported.')
      }

      // Fall back to PNG or JPEG.
      return parser.loadTexture(textureIndex)
    })
  }

  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function (resolve) {
        const image = new Image()

        // Lossy test image. Support for lossy images doesn't guarantee support for all
        // WebP images, unfortunately.
        image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA'

        image.onload = image.onerror = function () {
          resolve(image.height === 1)
        }
      })
    }

    return this.isSupported
  }
}

/**
 * AVIF Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_avif
 */
export class GLTFTextureAVIFExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.EXT_TEXTURE_AVIF
    this.isSupported = null
  }

  loadTexture(textureIndex) {
    const name = this.name
    const parser = this.parser
    const json = parser.json

    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null
    }

    const extension = textureDef.extensions[name]
    const source = json.images[extension.source]

    let loader = parser.textureLoader
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri)
      if (handler !== null) loader = handler
    }

    return this.detectSupport().then(function (isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader)

      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error('THREE.GLTFLoader: AVIF required by asset but unsupported.')
      }

      // Fall back to PNG or JPEG.
      return parser.loadTexture(textureIndex)
    })
  }

  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function (resolve) {
        const image = new Image()

        // Lossy test image.
        image.src =
          'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI='
        image.onload = image.onerror = function () {
          resolve(image.height === 1)
        }
      })
    }

    return this.isSupported
  }
}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
export class GLTFMeshoptCompression {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION
    this.parser = parser
  }

  loadBufferView(index) {
    const json = this.parser.json
    const bufferView = json.bufferViews[index]

    if (bufferView.extensions && bufferView.extensions[this.name]) {
      const extensionDef = bufferView.extensions[this.name]

      const buffer = this.parser.getDependency('buffer', extensionDef.buffer)
      const decoder = this.parser.options.meshoptDecoder

      if (!decoder || !decoder.supported) {
        if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
          throw new Error('THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files')
        } else {
          // Assumes that the extension is optional and that fallback buffer data is present
          return null
        }
      }

      return buffer.then(function (res) {
        const byteOffset = extensionDef.byteOffset || 0
        const byteLength = extensionDef.byteLength || 0

        const count = extensionDef.count
        const stride = extensionDef.byteStride

        const source = new Uint8Array(res, byteOffset, byteLength)

        if (decoder.decodeGltfBufferAsync) {
          return decoder
            .decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter)
            .then(function (res) {
              return res.buffer
            })
        } else {
          // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
          return decoder.ready.then(function () {
            const result = new ArrayBuffer(count * stride)
            decoder.decodeGltfBuffer(
              new Uint8Array(result),
              count,
              stride,
              source,
              extensionDef.mode,
              extensionDef.filter
            )
            return result
          })
        }
      })
    } else {
      return null
    }
  }
}

/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */
export class GLTFMeshGpuInstancing {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING
    this.parser = parser
  }

  createNodeMesh(nodeIndex) {
    const json = this.parser.json
    const nodeDef = json.nodes[nodeIndex]

    if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === undefined) {
      return null
    }

    const meshDef = json.meshes[nodeDef.mesh]

    // No Points or Lines + Instancing support yet

    for (const primitive of meshDef.primitives) {
      if (
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLES &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN &&
        primitive.mode !== undefined
      ) {
        return null
      }
    }

    const extensionDef = nodeDef.extensions[this.name]
    const attributesDef = extensionDef.attributes

    // @TODO: Can we support InstancedMesh + SkinnedMesh?

    const pending = []
    const attributes = {}

    for (const key in attributesDef) {
      pending.push(
        this.parser.getDependency('accessor', attributesDef[key]).then((accessor) => {
          attributes[key] = accessor
          return attributes[key]
        })
      )
    }

    if (pending.length < 1) {
      return null
    }

    pending.push(this.parser.createNodeMesh(nodeIndex))

    return Promise.all(pending).then((results) => {
      const nodeObject = results.pop()
      const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject]
      const count = results[0].count // All attribute counts should be same
      const instancedMeshes = []

      for (const mesh of meshes) {
        // Temporal variables
        const m = new Matrix4()
        const p = new Vector3()
        const q = new Quaternion()
        const s = new Vector3(1, 1, 1)

        const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count)

        for (let i = 0; i < count; i++) {
          if (attributes.TRANSLATION) {
            p.fromBufferAttribute(attributes.TRANSLATION, i)
          }

          if (attributes.ROTATION) {
            q.fromBufferAttribute(attributes.ROTATION, i)
          }

          if (attributes.SCALE) {
            s.fromBufferAttribute(attributes.SCALE, i)
          }

          instancedMesh.setMatrixAt(i, m.compose(p, q, s))
        }

        // Add instance attributes to the geometry, excluding TRS.
        for (const attributeName in attributes) {
          if (attributeName === '_COLOR_0') {
            const attr = attributes[attributeName]
            instancedMesh.instanceColor = new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized)
          } else if (attributeName !== 'TRANSLATION' && attributeName !== 'ROTATION' && attributeName !== 'SCALE') {
            mesh.geometry.setAttribute(attributeName, attributes[attributeName])
          }
        }

        // Just in case
        Object3D.prototype.copy.call(instancedMesh, mesh)

        // https://github.com/mrdoob/three.js/issues/18334
        instancedMesh.frustumCulled = false
        this.parser.assignFinalMaterial(instancedMesh)

        instancedMeshes.push(instancedMesh)
      }

      if (nodeObject.isGroup) {
        nodeObject.clear()

        nodeObject.add(...instancedMeshes)

        return nodeObject
      }

      return instancedMeshes[0]
    })
  }
}

/* BINARY EXTENSION */
export const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
export const BINARY_EXTENSION_HEADER_LENGTH = 12
export const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4e4f534a, BIN: 0x004e4942 }

export class GLTFBinaryExtension {
  constructor(data) {
    this.name = EXTENSIONS.KHR_BINARY_GLTF
    this.content = null
    this.body = null

    const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH)
    const textDecoder = new TextDecoder()

    this.header = {
      magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true)
    }

    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.')
    } else if (this.header.version < 2.0) {
      throw new Error('THREE.GLTFLoader: Legacy binary file detected.')
    }

    const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH
    const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH)
    let chunkIndex = 0

    while (chunkIndex < chunkContentsLength) {
      const chunkLength = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      const chunkType = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength)
        this.content = textDecoder.decode(contentArray)
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex
        this.body = data.slice(byteOffset, byteOffset + chunkLength)
      }

      // Clients must ignore chunks with unknown types.

      chunkIndex += chunkLength
    }

    if (this.content === null) {
      throw new Error('THREE.GLTFLoader: JSON content not found.')
    }
  }
}

/**
 * DRACO Mesh Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
export class GLTFDracoMeshCompressionExtension {
  constructor(json, dracoLoader) {
    if (!dracoLoader) {
      throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.')
    }

    this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION
    this.json = json
    this.dracoLoader = dracoLoader
    this.dracoLoader.preload()
  }

  decodePrimitive(primitive, parser) {
    const json = this.json
    const dracoLoader = this.dracoLoader
    const bufferViewIndex = primitive.extensions[this.name].bufferView
    const gltfAttributeMap = primitive.extensions[this.name].attributes
    const threeAttributeMap = {}
    const attributeNormalizedMap = {}
    const attributeTypeMap = {}

    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName]
    }

    for (const attributeName in primitive.attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      if (gltfAttributeMap[attributeName] !== undefined) {
        const accessorDef = json.accessors[primitive.attributes[attributeName]]
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

        attributeTypeMap[threeAttributeName] = componentType.name
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true
      }
    }

    return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {
      return new Promise(function (resolve) {
        dracoLoader.decodeDracoFile(
          bufferView,
          function (geometry) {
            for (const attributeName in geometry.attributes) {
              const attribute = geometry.attributes[attributeName]
              const normalized = attributeNormalizedMap[attributeName]

              if (normalized !== undefined) attribute.normalized = normalized
            }

            resolve(geometry)
          },
          threeAttributeMap,
          attributeTypeMap
        )
      })
    })
  }
}

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export class GLTFTextureTransformExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM
  }

  extendTexture(texture, transform) {
    if (
      (transform.texCoord === undefined || transform.texCoord === texture.channel) &&
      transform.offset === undefined &&
      transform.rotation === undefined &&
      transform.scale === undefined
    ) {
      // See https://github.com/mrdoob/three.js/issues/21819.
      return texture
    }

    texture = texture.clone()

    if (transform.texCoord !== undefined) {
      texture.channel = transform.texCoord
    }

    if (transform.offset !== undefined) {
      texture.offset.fromArray(transform.offset)
    }

    if (transform.rotation !== undefined) {
      texture.rotation = transform.rotation
    }

    if (transform.scale !== undefined) {
      texture.repeat.fromArray(transform.scale)
    }

    texture.needsUpdate = true

    return texture
  }
}

/**
 * Mesh Quantization Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
 */
export class GLTFMeshQuantizationExtension {
  name = EXTENSIONS.KHR_MESH_QUANTIZATION
}
