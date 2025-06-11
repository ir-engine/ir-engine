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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  defineSystem,
  Entity,
  Layers,
  PresentationSystemGroup,
  useChildrenWithComponents,
  useComponent
} from '@ir-engine/ecs'
import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { LightmapComponent } from '@ir-engine/engine/src/lightmap/LightmapComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import React, { useEffect } from 'react'
import { MeshStandardMaterial, WebGLRenderTarget } from 'three'
import { commitProperty } from '../components/properties/Util'

const MaterialReactor = (props: { lightmapEntity: Entity; entity: Entity }) => {
  const { lightmapEntity, entity } = props
  const materialState = useComponent(entity, MaterialStateComponent)
  const lightmapComponent = useComponent(lightmapEntity, LightmapComponent)

  const material = materialState.material.value as MeshStandardMaterial

  const lightmapRenderTarget = useHookstate(
    new WebGLRenderTarget(lightmapComponent.resolution.value, lightmapComponent.resolution.value)
  )

  useEffect(() => {
    // Lightmapper.initialize(new WebGLRenderer(), )
  }, [])

  useEffect(() => {
    // material.map = lightmapRenderTarget.get(NO_PROXY).texture
    // material.color = new Color(1,0,0)
    // material.needsUpdate = true
  }, [material])

  useEffect(() => {
    if (!material) return

    //debug only
    // commitProperty(MaterialStateComponent, 'parameters.map.source' as any, [entity])(
    //   config.client.fileServer + '/projects/ir-engine/default-project/assets/UV.png'
    // )
    commitProperty(MaterialStateComponent, 'parameters.map.channel' as any, [entity])(2)

    material.needsUpdate = true
  }, [material])

  return null
}

const LightmapReactor = ({ entity }) => {
  // temporarily hierarchy based, todo use volumes
  const childMaterials = useChildrenWithComponents(entity, [MaterialStateComponent])

  return (
    <>
      {childMaterials.map((materialEntity) => (
        <MaterialReactor key={materialEntity} entity={materialEntity} lightmapEntity={entity} />
      ))}
    </>
  )
}

const execute = () => {
  // const lightmapQuery = defineQuery([LightmapComponent])
  // for (const entity of lightmapQuery()) {
  // }
}

export const LightmapSystem = defineSystem({
  uuid: 'ee.engine.LightmapSystem',
  insert: { with: PresentationSystemGroup },
  execute,
  reactor: () => (
    <QueryReactor Components={[LightmapComponent]} ChildEntityReactor={LightmapReactor} layer={Layers.Authoring} />
  )
})
