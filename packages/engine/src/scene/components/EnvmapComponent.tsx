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

import React, { useEffect } from 'react'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  Mesh,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Object3D,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  Vector3
} from 'three'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalMutableComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialComponent,
  MaterialComponents,
  pluginByName
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { applyPluginShaderParameters } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { createDisposable } from '@etherealengine/spatial/src/resources/resourceHooks'

import { NodeID, NodeIDComponent } from '@etherealengine/spatial/src/transform/components/NodeIDComponent'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import {
  envmapParsReplaceLambert,
  envmapPhysicalParsReplace,
  envmapReplaceLambert,
  worldposReplace
} from '../classes/BPCEMShader'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { EnvMapBakeComponent } from './EnvMapBakeComponent'

const tempColor = new Color()

export const EnvmapComponent = defineComponent({
  name: 'EnvmapComponent',
  jsonID: 'EE_envmap',
  onInit: (entity) => {
    return {
      type: EnvMapSourceType.None as (typeof EnvMapSourceType)[keyof typeof EnvMapSourceType],
      envMapTextureType:
        EnvMapTextureType.Equirectangular as (typeof EnvMapTextureType)[keyof typeof EnvMapTextureType],
      envMapSourceColor: new Color(0xfff) as Color,
      envMapSourceURL: '',
      envMapSourceNodeID: '' as NodeID,
      envMapIntensity: 1,
      // internal
      envmap: null as Texture | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.type === 'string') component.type.set(json.type)
    if (typeof json.envMapTextureType === 'string') component.envMapTextureType.set(json.envMapTextureType)
    if (typeof json.envMapSourceColor === 'number') component.envMapSourceColor.set(new Color(json.envMapSourceColor))
    if (typeof json.envMapSourceURL === 'string') component.envMapSourceURL.set(json.envMapSourceURL)
    // backcompat
    if (typeof (json as any).envMapSourceEntityUUID === 'string')
      component.envMapSourceNodeID.set((json as any).envMapSourceEntityUUID)
    if (typeof json.envMapSourceNodeID === 'string') component.envMapSourceNodeID.set(json.envMapSourceNodeID)
    if (typeof json.envMapIntensity === 'number') component.envMapIntensity.set(json.envMapIntensity)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value,
      envMapTextureType: component.envMapTextureType.value,
      envMapSourceColor: component.envMapSourceColor.value,
      envMapSourceURL: component.envMapSourceURL.value,
      envMapSourceNodeID: component.envMapSourceNodeID.value,
      envMapIntensity: component.envMapIntensity.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    if (!isClient) return null

    const component = useComponent(entity, EnvmapComponent)
    const mesh = useOptionalComponent(entity, MeshComponent)?.value as Mesh<any, any> | null
    const [envMapTexture, error] = useTexture(
      component.envMapTextureType.value === EnvMapTextureType.Equirectangular ? component.envMapSourceURL.value : '',
      entity
    )

    useEffect(() => {
      updateEnvMapIntensity(mesh, component.envMapIntensity.value)
    }, [mesh, component.envMapIntensity])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Skybox) return
      component.envmap.set(null)
      /** Setting the value from the skybox can be found in EnvironmentSystem */
    }, [component.type])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Color) return

      const col = component.envMapSourceColor.value ?? tempColor
      const resolution = 64 // Min value required
      const [texture, unload] = createDisposable(
        DataTexture,
        entity,
        getRGBArray(col),
        resolution,
        resolution,
        RGBAFormat
      )
      texture.needsUpdate = true
      texture.colorSpace = SRGBColorSpace
      texture.mapping = EquirectangularReflectionMapping
      component.envmap.set(texture)

      return () => {
        unload()
      }
    }, [component.type, component.envMapSourceColor])

    useEffect(() => {
      if (!envMapTexture) return

      envMapTexture.mapping = EquirectangularReflectionMapping
      component.envmap.set(envMapTexture)
    }, [envMapTexture])

    useEffect(() => {
      if (!error) return

      component.envmap.set(null)
      addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
    }, [error])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Texture) return

      if (component.envMapTextureType.value == EnvMapTextureType.Cubemap) {
        loadCubeMapTexture(
          component.envMapSourceURL.value,
          (texture: CubeTexture | undefined) => {
            if (texture) {
              texture.mapping = CubeReflectionMapping
              texture.colorSpace = SRGBColorSpace
              component.envmap.set(texture)
              removeError(entity, EnvmapComponent, 'MISSING_FILE')
            }
          },
          undefined,
          (_) => {
            component.envmap.set(null)
            addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
          }
        )
      }
    }, [component.type, component.envMapSourceURL])

    useEffect(() => {
      if (!component.envmap.value) return
      updateEnvMap(mesh, component.envmap.value as Texture)
    }, [mesh, component.envmap])

    useEffect(() => {
      const envmap = component.envmap.value
      if (!envmap) return

      return () => {
        envmap.dispose()
      }
    }, [component.envmap])

    const bakeEntity = NodeIDComponent.useNodeEntityFromSameSource(entity, component.envMapSourceNodeID.value)

    if (component.type.value !== EnvMapSourceType.Bake || !bakeEntity) return null

    return <EnvBakeComponentReactor key={bakeEntity} envmapEntity={entity} bakeEntity={bakeEntity} />
  },

  errors: ['MISSING_FILE']
})

const EnvBakeComponentReactor = (props: { envmapEntity: Entity; bakeEntity: Entity }) => {
  const { envmapEntity, bakeEntity } = props
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)
  const group = useComponent(envmapEntity, GroupComponent)
  const uuid = useComponent(envmapEntity, MaterialComponent[MaterialComponents.Instance]).uuid
  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, envmapEntity)
  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    getMutableComponent(envmapEntity, EnvmapComponent).envmap.set(texture)
    if (bakeComponent.boxProjection.value) applyBoxProjection(bakeEntity, group.value as Object3D[])
  }, [envMaptexture, uuid])

  useEffect(() => {
    if (!error) return
    addError(envmapEntity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return null
}

export function updateEnvMap(obj: Mesh<any, any> | null, envmap: Texture | null) {
  if (!obj) return
  if (!obj.material) return
  if (Array.isArray(obj.material)) {
    obj.material.forEach((mat: MeshStandardMaterial) => {
      if (mat instanceof MeshMatcapMaterial) return
      mat.envMap = envmap!
    })
  } else {
    if (obj.material instanceof MeshMatcapMaterial) return
    obj.material.envMap = envmap!
  }
}

export const updateEnvMapIntensity = (obj: Mesh<any, any> | null, intensity: number) => {
  if (!obj) return
  if (!obj.material) return
  if (Array.isArray(obj.material)) {
    obj.material.forEach((m: MeshStandardMaterial) => {
      m.envMapIntensity = intensity
    })
  } else {
    ;(obj.material as MeshStandardMaterial).envMapIntensity = intensity
  }
}

export type BoxProjectionParameters = {
  cubeMapSize: Vector3
  cubeMapPos: Vector3
}

export const BoxProjectionPlugin = {
  id: 'BoxProjectionPlugin',
  compile: (shader, renderer) => {
    const pluginEntity = pluginByName[BoxProjectionPlugin.id]
    const plugin = getOptionalMutableComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin])
    if (!plugin) return

    const shaderType = shader.shaderType
    const isPhysical = shaderType === 'MeshStandardMaterial' || shaderType === 'MeshPhysicalMaterial'
    const isSupported = isPhysical || shaderType === 'MeshLambertMaterial' || shaderType === 'MeshPhongMaterial'
    if (!isSupported) return

    if (isPhysical) {
      if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition'))
        shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', worldposReplace)
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <envmap_physical_pars_fragment>',
        envmapPhysicalParsReplace
      )
    } else {
      shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_pars_fragment>', envmapParsReplaceLambert)
      shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_fragment>', envmapReplaceLambert)
    }

    applyPluginShaderParameters(pluginEntity, shader, {
      cubeMapSize: new Vector3(0, 0, 0),
      cubeMapPos: new Vector3(0, 0, 0)
    })
  }
}

const applyBoxProjection = (entity: Entity, targets: Object3D[]) => {
  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  for (const target of targets) {
    const child = target as Mesh<any, MeshStandardMaterial>
    if (!child.material || child.type == 'VFXBatch') return

    const pluginEntity = pluginByName[BoxProjectionPlugin.id]
    const materialEntity = UUIDComponent.getEntityByUUID(child.material.uuid as EntityUUID)
    setComponent(materialEntity, MaterialComponent[MaterialComponents.State], { pluginEntities: [pluginEntity] })
    getMutableComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin]).parameters[
      getComponent(materialEntity, NameComponent)
    ].set({
      cubeMapSize: { value: bakeComponent.bakeScale },
      cubeMapPos: { value: bakeComponent.bakePositionOffset }
    })
  }
}
