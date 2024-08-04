/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  ComponentType,
  UUIDComponent,
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { MaterialStateComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { GLTF } from '@gltf-transform/core'
import { useEffect, useLayoutEffect } from 'react'
import {
  Color,
  LinearSRGBColorSpace,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Texture,
  Vector2
} from 'three'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'
import { getParserOptions } from './GLTFState'

export const MaterialDefinitionComponent = defineComponent({
  name: 'MaterialDefinitionComponent',
  onInit: (entity) => {
    return {
      type: 'standard'
    } as GLTF.IMaterial & {
      type: 'standard' | 'basic' | 'physical'
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.type === 'string') component.type.set(json.type)
    if (typeof json.pbrMetallicRoughness === 'object') component.pbrMetallicRoughness.set(json.pbrMetallicRoughness)
    if (typeof json.normalTexture === 'object') component.normalTexture.set(json.normalTexture)
    if (typeof json.occlusionTexture === 'object') component.occlusionTexture.set(json.occlusionTexture)
    if (typeof json.emissiveTexture === 'object') component.emissiveTexture.set(json.emissiveTexture)
    if (typeof json.emissiveFactor === 'object') component.emissiveFactor.set(json.emissiveFactor)
    if (typeof json.alphaMode === 'string') component.alphaMode.set(json.alphaMode)
    if (typeof json.alphaCutoff === 'number') component.alphaCutoff.set(json.alphaCutoff)
    if (typeof json.doubleSided === 'boolean') component.doubleSided.set(json.doubleSided)
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MaterialDefinitionComponent)
    const material = GLTFLoaderFunctions.useLoadMaterial(
      getParserOptions(entity),
      component.get(NO_PROXY) as ComponentType<typeof MaterialDefinitionComponent>
    )

    useLayoutEffect(() => {
      if (!entity || !material) return
      const uuid = getComponent(entity, UUIDComponent)
      material.uuid = uuid
      setComponent(entity, MaterialStateComponent, { material })
    }, [material])

    return null
  }
})

declare module 'three/src/materials/MeshPhysicalMaterial' {
  export interface MeshPhysicalMaterial {
    setValues(parameters: MeshPhysicalMaterialParameters): void
  }
}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
export const KHRUnlitExtensionComponent = defineComponent({
  name: 'KHRUnlitExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_UNLIT,

  onInit(entity) {
    return {}
  },

  toJSON(entity, component) {
    return {}
  },

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'basic' })
    }, [])

    return null
  }
})

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
export const KHREmissiveStrengthExtensionComponent = defineComponent({
  name: 'KHREmissiveStrengthExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH,

  onInit(entity) {
    return {} as {
      emissiveStrength?: number
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.emissiveStrength === 'number') component.emissiveStrength.set(json.emissiveStrength)
  },

  toJSON(entity, component) {
    return {
      emissiveStrength: component.emissiveStrength.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHREmissiveStrengthExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      if (typeof component.emissiveStrength.value !== 'number') return
      const material = materialStateComponent.material.value as MeshStandardMaterial
      material.setValues({ emissiveIntensity: component.emissiveStrength.value })
    }, [component.emissiveStrength.value])

    return null
  }
})

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
export const KHRClearcoatExtensionComponent = defineComponent({
  name: 'KHRClearcoatExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_CLEARCOAT,

  onInit(entity) {
    return {} as {
      clearcoatFactor?: number
      clearcoatTexture?: GLTF.ITextureInfo
      clearcoatRoughnessFactor?: number
      clearcoatRoughnessTexture?: GLTF.ITextureInfo
      clearcoatNormalTexture?: GLTF.IMaterialNormalTextureInfo
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.clearcoatFactor === 'number') component.clearcoatFactor.set(json.clearcoatFactor)
    if (typeof json.clearcoatTexture === 'object') component.clearcoatTexture.set(json.clearcoatTexture)
    if (typeof json.clearcoatRoughnessFactor === 'number')
      component.clearcoatRoughnessFactor.set(json.clearcoatRoughnessFactor)
    if (typeof json.clearcoatRoughnessTexture === 'object')
      component.clearcoatRoughnessTexture.set(json.clearcoatRoughnessTexture)
    if (typeof json.clearcoatNormalTexture === 'object')
      component.clearcoatNormalTexture.set(json.clearcoatNormalTexture)
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRClearcoatExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      if (!component.clearcoatFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoat: component.clearcoatFactor.value })
      material.needsUpdate = true
    }, [component.clearcoatFactor.value])

    useEffect(() => {
      if (!component.clearcoatRoughnessFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoatRoughness: component.clearcoatRoughnessFactor.value })
      material.needsUpdate = true
    }, [component.clearcoatRoughnessFactor.value])

    const options = getParserOptions(entity)
    const clearcoatMap = GLTFLoaderFunctions.useAssignTexture(options, component.clearcoatTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoatMap })
      material.needsUpdate = true
    }, [clearcoatMap])

    const clearcoatRoughnessMap = GLTFLoaderFunctions.useAssignTexture(
      options,
      component.clearcoatRoughnessTexture.value
    )

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoatRoughnessMap })
      material.needsUpdate = true
    }, [clearcoatRoughnessMap])

    const clearcoatNormalMap = GLTFLoaderFunctions.useAssignTexture(options, component.clearcoatNormalTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial

      if (component.clearcoatNormalTexture.value?.scale !== undefined) {
        const scale = component.clearcoatNormalTexture.value.scale
        material.setValues({ clearcoatNormalScale: new Vector2(scale, scale) })
      }

      material.setValues({ clearcoatNormalMap })
      material.needsUpdate = true
    }, [clearcoatNormalMap])

    return null
  }
})

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
export const KHRIridescenceExtensionComponent = defineComponent({
  name: 'KHRIridescenceExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_IRIDESCENCE,

  onInit(entity) {
    return {} as {
      iridescenceFactor?: number
      iridescenceTexture?: GLTF.ITextureInfo
      iridescenceIor?: number
      iridescenceThicknessMinimum?: number
      iridescenceThicknessMaximum?: number
      iridescenceThicknessTexture?: GLTF.ITextureInfo
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.iridescenceFactor === 'number') component.iridescenceFactor.set(json.iridescenceFactor)
    if (typeof json.iridescenceTexture === 'object') component.iridescenceTexture.set(json.iridescenceTexture)
    if (typeof json.iridescenceIor === 'number') component.iridescenceIor.set(json.iridescenceIor)
    if (typeof json.iridescenceThicknessMinimum === 'number')
      component.iridescenceThicknessMinimum.set(json.iridescenceThicknessMinimum)
    if (typeof json.iridescenceThicknessMaximum === 'number')
      component.iridescenceThicknessMaximum.set(json.iridescenceThicknessMaximum)
    if (typeof json.iridescenceThicknessTexture === 'object')
      component.iridescenceThicknessTexture.set(json.iridescenceThicknessTexture)
  },

  toJSON(entity, component) {
    return {
      iridescenceFactor: component.iridescenceFactor.value,
      iridescenceTexture: component.iridescenceTexture.value,
      iridescenceIor: component.iridescenceIor.value,
      iridescenceThicknessMinimum: component.iridescenceThicknessMinimum.value,
      iridescenceThicknessMaximum: component.iridescenceThicknessMaximum.value,
      iridescenceThicknessTexture: component.iridescenceThicknessTexture.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRIridescenceExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      if (!component.iridescenceFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescence: component.iridescenceFactor.value })
      material.needsUpdate = true
    }, [component.iridescenceFactor.value])

    useEffect(() => {
      if (!component.iridescenceIor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescenceIOR: component.iridescenceIor.value })
      material.needsUpdate = true
    }, [component.iridescenceIor.value])

    const options = getParserOptions(entity)
    const iridescenceMap = GLTFLoaderFunctions.useAssignTexture(options, component.iridescenceTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescenceMap })
      material.needsUpdate = true
    }, [iridescenceMap])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({
        iridescenceThicknessRange: [
          component.iridescenceThicknessMinimum.value ?? 100,
          component.iridescenceThicknessMaximum.value ?? 400
        ]
      })
      material.needsUpdate = true
    }, [component.iridescenceThicknessMinimum.value, component.iridescenceThicknessMaximum.value])

    const iridescenceThicknessMap = GLTFLoaderFunctions.useAssignTexture(
      options,
      component.iridescenceThicknessTexture.value
    )

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescenceThicknessMap })
      material.needsUpdate = true
    }, [iridescenceThicknessMap])

    return null
  }
})

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export const KHRSheenExtensionComponent = defineComponent({
  name: 'KHRSheenExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_SHEEN,

  onInit(entity) {
    return {} as {
      sheenColorFactor?: [number, number, number]
      sheenRoughnessFactor?: number
      sheenColorTexture?: GLTF.ITextureInfo
      sheenRoughnessTexture?: GLTF.ITextureInfo
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (Array.isArray(json.sheenColorFactor)) component.sheenColorFactor.set(json.sheenColorFactor)
    if (typeof json.sheenRoughnessFactor === 'number') component.sheenRoughnessFactor.set(json.sheenRoughnessFactor)
    if (typeof json.sheenColorTexture === 'object') component.sheenColorTexture.set(json.sheenColorTexture)
    if (typeof json.sheenRoughnessTexture === 'object') component.sheenRoughnessTexture.set(json.sheenRoughnessTexture)
  },

  toJSON(entity, component) {
    return {
      sheenColorFactor: component.sheenColorFactor.value,
      sheenRoughnessFactor: component.sheenRoughnessFactor.value,
      sheenColorTexture: component.sheenColorTexture.value,
      sheenRoughnessTexture: component.sheenRoughnessTexture.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRSheenExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ sheen: 1 })
    }, [])

    useEffect(() => {
      if (!component.sheenColorFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({
        sheenColor: new Color().setRGB(
          component.sheenColorFactor.value[0],
          component.sheenColorFactor.value[1],
          component.sheenColorFactor.value[2],
          LinearSRGBColorSpace
        )
      })
      material.needsUpdate = true
    }, [component.sheenColorFactor.value])

    useEffect(() => {
      if (!component.sheenRoughnessFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ sheenRoughness: component.sheenRoughnessFactor.value })
      material.needsUpdate = true
    }, [component.sheenRoughnessFactor.value])

    const options = getParserOptions(entity)
    const sheenColorMap = GLTFLoaderFunctions.useAssignTexture(options, component.sheenColorTexture.value)

    useEffect(() => {
      if (sheenColorMap) sheenColorMap.colorSpace = SRGBColorSpace
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ sheenColorMap })
      material.needsUpdate = true
    }, [sheenColorMap])

    const sheenRoughnessMap = GLTFLoaderFunctions.useAssignTexture(options, component.sheenRoughnessTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ sheenRoughnessMap })
      material.needsUpdate = true
    }, [sheenRoughnessMap])

    return null
  }
})

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export const KHRTransmissionExtensionComponent = defineComponent({
  name: 'KHRTransmissionExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_TRANSMISSION,

  onInit(entity) {
    return {} as {
      transmissionFactor?: number
      transmissionTexture?: GLTF.ITextureInfo
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.transmissionFactor === 'number') component.transmissionFactor.set(json.transmissionFactor)
    if (typeof json.transmissionTexture === 'object') component.transmissionTexture.set(json.transmissionTexture)
  },

  toJSON(entity, component) {
    return {
      transmissionFactor: component.transmissionFactor.value,
      transmissionTexture: component.transmissionTexture.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRTransmissionExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      if (!component.transmissionFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ transmission: component.transmissionFactor.value })
      material.needsUpdate = true
    }, [component.transmissionFactor.value])

    const options = getParserOptions(entity)
    const transmissionMap = GLTFLoaderFunctions.useAssignTexture(options, component.transmissionTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ transmissionMap })
      material.needsUpdate = true
    }, [transmissionMap])

    return null
  }
})

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export const KHRVolumeExtensionComponent = defineComponent({
  name: 'KHRVolumeExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_VOLUME,

  onInit(entity) {
    return {} as {
      thicknessFactor?: number
      thicknessTexture?: GLTF.ITextureInfo
      attenuationDistance?: number
      attenuationColorFactor?: [number, number, number]
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.thicknessFactor === 'number') component.thicknessFactor.set(json.thicknessFactor)
    if (typeof json.thicknessTexture === 'object') component.thicknessTexture.set(json.thicknessTexture)
    if (typeof json.attenuationDistance === 'number') component.attenuationDistance.set(json.attenuationDistance)
    if (Array.isArray(json.attenuationColorFactor)) component.attenuationColorFactor.set(json.attenuationColorFactor)
  },

  toJSON(entity, component) {
    return {
      thicknessFactor: component.thicknessFactor.value,
      thicknessTexture: component.thicknessTexture.value,
      attenuationDistance: component.attenuationDistance.value,
      attenuationColorFactor: component.attenuationColorFactor.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRVolumeExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ thickness: component.thicknessFactor.value ?? 0 })
      material.needsUpdate = true
    }, [component.thicknessFactor.value])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ attenuationDistance: component.attenuationDistance.value || Infinity })
      material.needsUpdate = true
    }, [component.attenuationDistance.value])

    useEffect(() => {
      if (!component.attenuationColorFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({
        attenuationColor: new Color().setRGB(
          component.attenuationColorFactor.value[0],
          component.attenuationColorFactor.value[1],
          component.attenuationColorFactor.value[2],
          LinearSRGBColorSpace
        )
      })
      material.needsUpdate = true
    }, [component.attenuationColorFactor.value])

    const options = getParserOptions(entity)
    const thicknessMap = GLTFLoaderFunctions.useAssignTexture(options, component.thicknessTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ thicknessMap })
      material.needsUpdate = true
    }, [thicknessMap])

    return null
  }
})

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
export const KHRIorExtensionComponent = defineComponent({
  name: 'KHRIorExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_IOR,

  onInit(entity) {
    return {} as {
      ior?: number
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.ior === 'number') component.ior.set(json.ior)
  },

  toJSON(entity, component) {
    return {
      ior: component.ior.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRIorExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ ior: component.ior.value ?? 1.5 })
      material.needsUpdate = true
    }, [component.ior.value])

    return null
  }
})

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
export const KHRSpecularExtensionComponent = defineComponent({
  name: 'KHRSpecularExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_SPECULAR,

  onInit(entity) {
    return {} as {
      specularFactor?: number
      specularTexture?: GLTF.ITextureInfo
      specularColorFactor?: [number, number, number]
      specularColorTexture?: GLTF.ITextureInfo
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.specularFactor === 'number') component.specularFactor.set(json.specularFactor)
    if (typeof json.specularTexture === 'object') component.specularTexture.set(json.specularTexture)
    if (Array.isArray(json.specularColorFactor)) component.specularColorFactor.set(json.specularColorFactor)
    if (typeof json.specularColorTexture === 'object') component.specularColorTexture.set(json.specularColorTexture)
  },

  toJSON(entity, component) {
    return {
      specularFactor: component.specularFactor.value,
      specularTexture: component.specularTexture.value,
      specularColorFactor: component.specularColorFactor.value,
      specularColorTexture: component.specularColorTexture.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRSpecularExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ specularIntensity: component.specularFactor.value ?? 1.0 })
      material.needsUpdate = true
    }, [component.specularFactor.value])

    useEffect(() => {
      const specularColorFactor = component.specularColorFactor.value ?? [1, 1, 1]
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({
        specularColor: new Color().setRGB(
          specularColorFactor[0],
          specularColorFactor[1],
          specularColorFactor[2],
          LinearSRGBColorSpace
        )
      })
      material.needsUpdate = true
    }, [component.specularColorFactor.value])

    const options = getParserOptions(entity)
    const specularMap = GLTFLoaderFunctions.useAssignTexture(options, component.specularTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ specularIntensityMap: specularMap })
      material.needsUpdate = true
    }, [specularMap])

    const specularColorMap = GLTFLoaderFunctions.useAssignTexture(options, component.specularColorTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ specularColorMap })
      material.needsUpdate = true
    }, [specularColorMap])

    return null
  }
})

/**
 * Materials bump Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/EXT_materials_bump
 */
export const EXTBumpExtensionComponent = defineComponent({
  name: 'EXTBumpExtensionComponent',
  jsonID: EXTENSIONS.EXT_MATERIALS_BUMP,

  onInit(entity) {
    return {} as {
      bumpFactor?: number
      bumpTexture?: GLTF.ITextureInfo
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.bumpFactor === 'number') component.bumpFactor.set(json.bumpFactor)
    if (typeof json.bumpTexture === 'object') component.bumpTexture.set(json.bumpTexture)
  },

  toJSON(entity, component) {
    return {
      bumpFactor: component.bumpFactor.value,
      bumpTexture: component.bumpTexture.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, EXTBumpExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ bumpScale: component.bumpFactor.value ?? 1.0 })
      material.needsUpdate = true
    }, [component.bumpFactor.value])

    const options = getParserOptions(entity)
    const bumpMap = GLTFLoaderFunctions.useAssignTexture(options, component.bumpTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ bumpMap })
      material.needsUpdate = true
    }, [bumpMap])

    return null
  }
})

/**
 * Materials anisotropy Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
 */
export const KHRAnisotropyExtensionComponent = defineComponent({
  name: 'KHRAnisotropyExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_ANISOTROPY,

  onInit(entity) {
    return {} as {
      anisotropyStrength?: number
      anisotropyRotation?: number
      anisotropyTexture?: GLTF.ITextureInfo
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.anisotropyStrength === 'number') component.anisotropyStrength.set(json.anisotropyStrength)
    if (typeof json.anisotropyRotation === 'number') component.anisotropyRotation.set(json.anisotropyRotation)
    if (typeof json.anisotropyTexture === 'object') component.anisotropyTexture.set(json.anisotropyTexture)
  },

  toJSON(entity, component) {
    return {
      anisotropyStrength: component.anisotropyStrength.value,
      anisotropyRotation: component.anisotropyRotation.value,
      anisotropyTexture: component.anisotropyTexture.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRAnisotropyExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'physical' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ anisotropy: component.anisotropyStrength.value ?? 0.0 })
      material.needsUpdate = true
    }, [component.anisotropyStrength.value])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ anisotropyRotation: component.anisotropyRotation.value ?? 0.0 })
      material.needsUpdate = true
    }, [component.anisotropyRotation.value])

    const options = getParserOptions(entity)
    const anisotropyMap = GLTFLoaderFunctions.useAssignTexture(options, component.anisotropyTexture.value)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ anisotropyMap })
      material.needsUpdate = true
    }, [anisotropyMap])

    return null
  }
})

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export class GLTFTextureTransformExtension {
  name = EXTENSIONS.KHR_TEXTURE_TRANSFORM

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

type GLTFTextureTransformExtensionType = {
  texCoord?: number
  offset?: [number, number]
  rotation?: number
  scale?: [number, number]
}

export const KHRTextureTransformExtensionComponent = defineComponent({
  name: 'KHRTextureTransformExtensionComponent',
  jsonID: EXTENSIONS.KHR_TEXTURE_TRANSFORM,

  /** static function */
  extendTexture: (texture: Texture, transform: GLTFTextureTransformExtensionType) => {
    if (
      (transform.texCoord === undefined || transform.texCoord === texture.channel) &&
      transform.offset === undefined &&
      transform.rotation === undefined &&
      transform.scale === undefined
    ) {
      // See https://github.com/mrdoob/three.js/issues/21819.
      return texture
    }

    /** @todo this throws hookstate 109... */
    // texture = texture.clone()

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
})
