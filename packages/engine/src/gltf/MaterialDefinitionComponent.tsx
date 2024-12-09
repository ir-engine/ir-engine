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
  S,
  UUIDComponent,
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { NO_PROXY, startReactor, useImmediateEffect } from '@ir-engine/hyperflux'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { getPrototypeEntityFromName } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useEffect, useLayoutEffect } from 'react'
import {
  CanvasTexture,
  Color,
  LinearSRGBColorSpace,
  Material,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Texture,
  Vector2
} from 'three'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'
import { getParserOptions } from './GLTFState'

const TextureInfoSchema = S.Object({
  index: S.Number(),
  texCoord: S.Optional(S.Number()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

const MaterialNormalTextureInfoSchema = S.Object({
  index: S.Number(),
  scale: S.Optional(S.Number()),
  texCoord: S.Optional(S.Number()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

const MaterialMetallicRoughnessSchema = S.Object({
  baseColorFactor: S.Optional(S.Array(S.Number())),
  baseColorTexture: S.Optional(TextureInfoSchema),
  metallicFactor: S.Optional(S.Number()),
  roughnessFactor: S.Optional(S.Number()),
  metallicRoughnessTexture: S.Optional(TextureInfoSchema)
})

const MaterialOcclusionTextureInfoSchema = S.Object({
  index: S.Number(),
  strength: S.Optional(S.Number()),
  texCoord: S.Optional(S.Number()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

const MaterialAlphaModeSchema = S.LiteralUnion(['OPAQUE', 'MASK', 'BLEND'])

const MaterialDefinitionSchema = S.Object({
  type: S.Union(
    [S.Literal('MeshStandardMaterial'), S.Literal('MeshPhysicalMaterial'), S.Literal('MeshBasicMaterial'), S.String()],
    'MeshStandardMaterial'
  ),

  name: S.Optional(S.String()),
  pbrMetallicRoughness: S.Optional(MaterialMetallicRoughnessSchema),
  normalTexture: S.Optional(MaterialNormalTextureInfoSchema),
  occlusionTexture: S.Optional(MaterialOcclusionTextureInfoSchema),
  emissiveTexture: S.Optional(TextureInfoSchema),
  emissiveFactor: S.Optional(S.Array(S.Number())),
  alphaMode: S.Optional(MaterialAlphaModeSchema),
  alphaCutoff: S.Optional(S.Number()),
  doubleSided: S.Optional(S.Bool()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

export const MaterialDefinitionComponent = defineComponent({
  name: 'MaterialDefinitionComponent',
  schema: MaterialDefinitionSchema,

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
      setComponent(entity, MaterialStateComponent, {
        material,
        prototypeEntity: getPrototypeEntityFromName(material.type)
      })
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
  schema: S.Record(S.Any(), S.Any(), {}),

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshBasicMaterial' })
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
  schema: S.Object({ emissiveStrength: S.Optional(S.Number()) }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHREmissiveStrengthExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      if (typeof component.emissiveStrength.value !== 'number') return
      const material = materialStateComponent.material.value as MeshStandardMaterial
      material.setValues({ emissiveIntensity: component.emissiveStrength.value })
    }, [materialStateComponent.material.value.type, component.emissiveStrength.value])

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
  schema: S.Object({
    clearcoatFactor: S.Optional(S.Number()),
    clearcoatTexture: S.Optional(TextureInfoSchema),
    clearcoatRoughnessFactor: S.Optional(S.Number()),
    clearcoatRoughnessTexture: S.Optional(TextureInfoSchema),
    clearcoatNormalTexture: S.Optional(MaterialNormalTextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRClearcoatExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      if (!component.clearcoatFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoat: component.clearcoatFactor.value })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.clearcoatFactor.value])

    useEffect(() => {
      if (!component.clearcoatRoughnessFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoatRoughness: component.clearcoatRoughnessFactor.value })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.clearcoatRoughnessFactor.value])

    const options = getParserOptions(entity)
    const clearcoatMap = GLTFLoaderFunctions.useAssignTexture(options, component.clearcoatTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoatMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, clearcoatMap])

    const clearcoatRoughnessMap = GLTFLoaderFunctions.useAssignTexture(
      options,
      component.clearcoatRoughnessTexture.get(NO_PROXY)
    )

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ clearcoatRoughnessMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, clearcoatRoughnessMap])

    const clearcoatNormalMap = GLTFLoaderFunctions.useAssignTexture(
      options,
      component.clearcoatNormalTexture.get(NO_PROXY)
    )

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial

      if (component.clearcoatNormalTexture.value?.scale !== undefined) {
        const scale = component.clearcoatNormalTexture.value.scale
        material.setValues({ clearcoatNormalScale: new Vector2(scale, scale) })
      }

      material.setValues({ clearcoatNormalMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, clearcoatNormalMap])

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
  schema: S.Object({
    iridescenceFactor: S.Optional(S.Number()),
    iridescenceTexture: S.Optional(TextureInfoSchema),
    iridescenceIor: S.Optional(S.Number()),
    iridescenceThicknessMinimum: S.Optional(S.Number()),
    iridescenceThicknessMaximum: S.Optional(S.Number()),
    iridescenceThicknessTexture: S.Optional(TextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRIridescenceExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      if (!component.iridescenceFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescence: component.iridescenceFactor.value })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.iridescenceFactor.value])

    useEffect(() => {
      if (!component.iridescenceIor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescenceIOR: component.iridescenceIor.value })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.iridescenceIor.value])

    const options = getParserOptions(entity)
    const iridescenceMap = GLTFLoaderFunctions.useAssignTexture(options, component.iridescenceTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescenceMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, iridescenceMap])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({
        iridescenceThicknessRange: [
          component.iridescenceThicknessMinimum.value ?? 100,
          component.iridescenceThicknessMaximum.value ?? 400
        ]
      })
      material.needsUpdate = true
    }, [
      materialStateComponent.material.value.type,
      component.iridescenceThicknessMinimum.value,
      component.iridescenceThicknessMaximum.value
    ])

    const iridescenceThicknessMap = GLTFLoaderFunctions.useAssignTexture(
      options,
      component.iridescenceThicknessTexture.get(NO_PROXY)
    )

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ iridescenceThicknessMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, iridescenceThicknessMap])

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
  schema: S.Object({
    sheenColorFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()])),
    sheenRoughnessFactor: S.Optional(S.Number()),
    sheenColorTexture: S.Optional(TextureInfoSchema),
    sheenRoughnessTexture: S.Optional(TextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRSheenExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
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
    }, [materialStateComponent.material.value.type, component.sheenColorFactor.value])

    useEffect(() => {
      if (!component.sheenRoughnessFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ sheenRoughness: component.sheenRoughnessFactor.value })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.sheenRoughnessFactor.value])

    const options = getParserOptions(entity)
    const sheenColorMap = GLTFLoaderFunctions.useAssignTexture(options, component.sheenColorTexture.get(NO_PROXY))

    useEffect(() => {
      if (sheenColorMap) sheenColorMap.colorSpace = SRGBColorSpace
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ sheenColorMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, sheenColorMap])

    const sheenRoughnessMap = GLTFLoaderFunctions.useAssignTexture(
      options,
      component.sheenRoughnessTexture.get(NO_PROXY)
    )

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ sheenRoughnessMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, sheenRoughnessMap])

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
  schema: S.Object({
    transmissionFactor: S.Optional(S.Number()),
    transmissionTexture: S.Optional(TextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRTransmissionExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      if (!component.transmissionFactor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ transmission: component.transmissionFactor.value })
      material.needsUpdate = true
    }, [materialStateComponent.material.value, component.transmissionFactor.value])

    const options = getParserOptions(entity)
    const transmissionMap = GLTFLoaderFunctions.useAssignTexture(options, component.transmissionTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ transmissionMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value, transmissionMap])

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
  schema: S.Object({
    thicknessFactor: S.Optional(S.Number()),
    thicknessTexture: S.Optional(TextureInfoSchema),
    attenuationDistance: S.Optional(S.Number()),
    attenuationColor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()]))
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRVolumeExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ thickness: component.thicknessFactor.value ?? 0 })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.thicknessFactor.value])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ attenuationDistance: component.attenuationDistance.value || Infinity })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.attenuationDistance.value])

    useEffect(() => {
      if (!component.attenuationColor.value) return
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({
        attenuationColor: new Color().setRGB(
          component.attenuationColor.value[0],
          component.attenuationColor.value[1],
          component.attenuationColor.value[2],
          LinearSRGBColorSpace
        )
      })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.attenuationColor.value])

    const options = getParserOptions(entity)
    const thicknessMap = GLTFLoaderFunctions.useAssignTexture(options, component.thicknessTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ thicknessMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, thicknessMap])

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
  schema: S.Object({
    ior: S.Optional(S.Number())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRIorExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ ior: component.ior.value ?? 1.5 })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.ior.value])

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
  schema: S.Object({
    specularFactor: S.Optional(S.Number()),
    specularTexture: S.Optional(TextureInfoSchema),
    specularColorFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()])),
    specularColorTexture: S.Optional(TextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRSpecularExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useImmediateEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ specularIntensity: component.specularFactor.value ?? 1.0 })
      material.needsUpdate = true
    }, [materialStateComponent.material.type.value, component.specularFactor.value])

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
    }, [materialStateComponent.material.type.value, component.specularColorFactor.value])

    const options = getParserOptions(entity)
    const specularMap = GLTFLoaderFunctions.useAssignTexture(options, component.specularTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ specularIntensityMap: specularMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.type.value, specularMap])

    const specularColorMap = GLTFLoaderFunctions.useAssignTexture(options, component.specularColorTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ specularColorMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.type.value, specularColorMap])

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
  schema: S.Object({
    bumpFactor: S.Optional(S.Number()),
    bumpTexture: S.Optional(TextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, EXTBumpExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ bumpScale: component.bumpFactor.value ?? 1.0 })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.bumpFactor.value])

    const options = getParserOptions(entity)
    const bumpMap = GLTFLoaderFunctions.useAssignTexture(options, component.bumpTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ bumpMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, bumpMap])

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
  schema: S.Object({
    anisotropyStrength: S.Optional(S.Number()),
    anisotropyRotation: S.Optional(S.Number()),
    anisotropyTexture: S.Optional(TextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRAnisotropyExtensionComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshPhysicalMaterial' })
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ anisotropy: component.anisotropyStrength.value ?? 0.0 })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.anisotropyStrength.value])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ anisotropyRotation: component.anisotropyRotation.value ?? 0.0 })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.anisotropyRotation.value])

    const options = getParserOptions(entity)
    const anisotropyMap = GLTFLoaderFunctions.useAssignTexture(options, component.anisotropyTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      material.setValues({ anisotropyMap })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, anisotropyMap])

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

export const MozillaHubsLightMapComponent = defineComponent({
  name: 'MozillaHubsLightMapComponent',
  jsonID: 'MOZ_lightmap',
  schema: S.Object({
    index: S.Number(1),
    intensity: S.Number(1.0)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MozillaHubsLightMapComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshPhysicalMaterial
      const materialDefinitionComponent = getComponent(entity, MaterialDefinitionComponent)
      // Multiply by pi for MeshBasicMaterial shading
      const lightMapIntensity =
        component.intensity.value * (materialDefinitionComponent.type === 'MeshBasicMaterial' ? Math.PI : 1.0)

      material.setValues({ lightMapIntensity })
      material.needsUpdate = true
    }, [component.intensity.value])

    const options = getParserOptions(entity)
    const lightMap = GLTFLoaderFunctions.useAssignTexture(options, component.get(NO_PROXY))

    useEffect(() => {
      if (!lightMap) return

      const material = materialStateComponent.material.value as MeshPhysicalMaterial

      lightMap.channel = 1
      material.lightMap = lightMap

      material.setValues({ lightMap: lightMap })
      material.needsUpdate = true
    }, [lightMap])

    return null
  }
})

/**
 * @deprecated - use KHR_materials_ior and KHR_materials_specular instead
 */
export const KHRMaterialsPBRSpecularGlossinessComponent = defineComponent({
  name: 'KHRMaterialsPBRSpecularGlossinessComponent',
  jsonID: 'KHR_materials_pbrSpecularGlossiness',
  schema: S.Object({
    diffuseFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number(), S.Number()])),
    diffuseTexture: S.Optional(TextureInfoSchema),
    specularFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()])),
    glossinessFactor: S.Optional(S.Number()),
    specularGlossinessTexture: S.Optional(TextureInfoSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRMaterialsPBRSpecularGlossinessComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: 'MeshStandardMaterial' })
      console.warn(
        'KHR_materials_pbrSpecularGlossiness is deprecated. Use KHR_materials_ior and KHR_materials_specular instead.'
      )
    }, [])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshStandardMaterial
      material.setValues({
        color: new Color().fromArray(component.diffuseFactor.value ?? [1, 1, 1, 1]),
        opacity: component.diffuseFactor.value ? component.diffuseFactor.value[3] : 1
      })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.diffuseFactor.value])

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshStandardMaterial
      material.setValues({
        roughness: 1 - (component.glossinessFactor.value ?? 1)
      })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, component.glossinessFactor.value])

    const options = getParserOptions(entity)
    const map = GLTFLoaderFunctions.useAssignTexture(options, component.diffuseTexture.get(NO_PROXY))

    useEffect(() => {
      const material = materialStateComponent.material.value as MeshStandardMaterial
      material.setValues({ map })
      material.needsUpdate = true
    }, [materialStateComponent.material.value.type, map])

    const specularGlossinessMap = GLTFLoaderFunctions.useAssignTexture(
      options,
      component.specularGlossinessTexture.get(NO_PROXY)
    )

    useEffect(() => {
      if (!specularGlossinessMap) return

      const abortController = new AbortController()

      invertGlossinessMap(specularGlossinessMap).then((invertedMap) => {
        if (abortController.signal.aborted) return

        const material = materialStateComponent.material.value as MeshStandardMaterial
        material.setValues({ roughnessMap: invertedMap })
        material.needsUpdate = true
      })

      return () => {
        abortController.abort()
      }
    }, [materialStateComponent.material.value.type, specularGlossinessMap])

    return null
  }
})

const invertGlossinessMap = async (glossinessMap: Texture) => {
  const mapData: Texture = (await createReadableTexture(glossinessMap, { canvas: true })) as Texture
  const canvas = mapData.image as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  ctx.globalCompositeOperation = 'difference'
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'
  const invertedTexture = new CanvasTexture(canvas)
  return invertedTexture
}

export type MaterialExtensionPluginType = { id: string; uniforms: { [key: string]: any } }
const MaterialExtensionPluginTypeSchema = S.Object({ id: S.String(), uniforms: S.Record(S.String(), S.Any()) })

export const EEMaterialComponent = defineComponent({
  name: 'EEMaterialComponent',
  jsonID: 'EE_material',
  schema: S.Object({
    uuid: T.EntityUUID(),
    name: S.String(),
    prototype: S.String(),
    args: S.Record(
      S.String(),
      S.Object({
        type: S.String(),
        contents: S.Any()
      })
    ),
    plugins: S.Array(MaterialExtensionPluginTypeSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, EEMaterialComponent)
    const materialStateComponent = useComponent(entity, MaterialStateComponent)

    useEffect(() => {
      setComponent(entity, MaterialDefinitionComponent, { type: component.prototype.value })
    }, [component.prototype.value])

    useEffect(() => {
      const options = getParserOptions(entity)
      const resultProperties = {} as Record<string, any>
      const texturePromises = Object.fromEntries(
        Object.entries(component.args.value).filter(([k, v]) => v.type === 'texture' && v.contents)
      )

      const reactor = startReactor(() => {
        const material = materialStateComponent.material.value as Material
        for (const [k, v] of Object.entries(component.args.value)) {
          if (v.type === 'texture') {
            if (v.contents) {
              const texture = GLTFLoaderFunctions.useAssignTexture(options, v.contents)
              useEffect(() => {
                if (!texture) return
                if (k === 'map') texture.colorSpace = SRGBColorSpace
                resultProperties[k] = texture
                delete texturePromises[k]
                if (Object.keys(texturePromises).length === 0) {
                  material.setValues(resultProperties)
                  material.needsUpdate = true
                  reactor.stop()
                }
              }, [texture])
            } else {
              useEffect(() => {
                resultProperties[k] = null
              }, [])
            }
          } else if (v.type === 'color') {
            useEffect(() => {
              resultProperties[k] = new Color(v.contents)
              material.setValues(resultProperties)
            }, [])
          } else {
            useEffect(() => {
              resultProperties[k] = v.contents
              material.setValues(resultProperties)
            }, [])
          }
        }

        return null
      })

      return () => {
        reactor.stop()
      }
    }, [materialStateComponent.material.type.value, component.args.value])

    return null
  }
})
