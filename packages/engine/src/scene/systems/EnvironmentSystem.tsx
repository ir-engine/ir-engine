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

import React, { useEffect } from 'react'

import {
  defineSystem,
  Entity,
  getComponent,
  getOptionalComponent,
  haveCommonAncestor,
  PresentationSystemGroup,
  useChildrenWithComponents,
  useComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'

import { State } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  MeshStandardMaterial,
  RGBAFormat,
  SRGBColorSpace
} from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { EnvMapComponent } from '../components/EnvmapComponent'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'

const EnvMapReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const envMapComponent = useComponent(entity, EnvMapComponent).type.value
  const materialComponentEntities = useChildrenWithComponents(entity, [MaterialStateComponent])
  return (
    <>
      {materialComponentEntities.map((materialComponentEntity) => {
        console.log(envMapComponent, getComponent(entity, NameComponent))
        switch (envMapComponent) {
          case 'Skybox':
            return <EnvMapSkyboxReactor entity={materialComponentEntity} key={materialComponentEntity} />
          case 'Bake':
            return (
              <EnvMapBakeReactor entity={materialComponentEntity} rootEntity={entity} key={materialComponentEntity} />
            )
          case 'Color':
            return <EnvMapColorReactor entity={materialComponentEntity} key={materialComponentEntity} />
        }
      })}
    </>
  )
}

const EnvMapSkyboxReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const backgroundQuery = useQuery([BackgroundComponent])
  const materialComponent = useComponent(entity, MaterialStateComponent)
  useEffect(() => {
    let i = 0
    for (i; i < backgroundQuery.length; i++) if (haveCommonAncestor(entity, backgroundQuery[i])) break
    const backgroundComponent = getOptionalComponent(backgroundQuery[i], BackgroundComponent)
    if (!backgroundComponent) return
    const material = materialComponent.material.value as MeshStandardMaterial
    material.envMap = backgroundComponent as any
  }, [backgroundQuery, materialComponent])

  return null
}

const EnvMapCubemapReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const envMapComponent = useComponent(entity, EnvMapComponent)
  useEffect(() => {
    return () => {
      ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    }
  }, [])

  useEffect(() => {
    loadCubeMapTexture(
      envMapComponent.envMapCubemapURL.value,
      (texture: CubeTexture | undefined) => {
        if (texture) {
          texture.mapping = CubeReflectionMapping
          texture.colorSpace = SRGBColorSpace
          ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(texture)
          removeError(entity, EnvMapComponent, 'MISSING_FILE')
        }
      },
      undefined,
      (_) => {
        ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
        addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    )
  }, [envMapComponent.envMapCubemapURL])

  return null
}

const EnvMapTextureReactor = (props: { entity: Entity }) => {
  const materialComponent = useComponent(props.entity, MaterialStateComponent)
  const envMapComponent = useComponent(props.entity, EnvMapComponent)
  const bakeEntity = UUIDComponent.useEntityByUUID(envMapComponent.envMapSourceEntityUUID.value)
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)

  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, bakeEntity)

  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(texture)
  }, [envMaptexture])

  useEffect(() => {
    if (!error) return
    addError(bakeEntity, EnvMapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')
  }, [error])

  return null
}

const EnvMapBakeReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)

  const bakeEntity = UUIDComponent.useEntityByUUID(envMapComponent.envMapSourceEntityUUID.value)
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)

  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, bakeEntity)

  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(texture)
  }, [envMaptexture, envMapComponent.type])

  useEffect(() => {
    if (!error) return
    addError(bakeEntity, EnvMapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')
  }, [error])

  return null
}

const tempColor = new Color(0, 0, 1)
const EnvMapColorReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const envMapComponent = useComponent(entity, EnvMapComponent)

  useEffect(() => {
    return () => {
      ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    }
  }, [])

  useEffect(() => {
    const color = envMapComponent.envMapSourceColor.value ?? tempColor
    const resolution = 64 // Min value required
    /** @todo track in resource manager */
    const texture = new DataTexture(getRGBArray(new Color(color)), resolution, resolution, RGBAFormat)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(texture)
    return () => {
      texture.dispose()
    }
  }, [envMapComponent.envMapSourceColor])

  return null
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const envMapQuery = useQuery([EnvMapComponent])

    return (
      <>
        {envMapQuery.map((entity) => (
          <EnvMapReactor entity={entity} key={entity} />
        ))}
      </>
    )
  }
})
