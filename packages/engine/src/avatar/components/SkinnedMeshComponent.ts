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

import { SkeletonHelper, SkinnedMesh } from 'three'

import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs'
import {
  defineComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent, setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { ComputedTransformComponent } from '@etherealengine/spatial/src/transform/components/ComputedTransformComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'

/** @todo move this to spatial module */
export const SkinnedMeshComponent = defineComponent({
  name: 'SkinnedMeshComponent',

  onInit: (entity) => null! as SkinnedMesh,

  onSet: (entity, component, mesh: SkinnedMesh) => {
    if (!mesh || !mesh.isSkinnedMesh) throw new Error('SkinnedMeshComponent: Invalid skinned mesh')
    component.set(mesh)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, SkinnedMeshComponent)
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)
    const visible = useOptionalComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!visible?.value || !debugEnabled.value) return

      const helper = new SkeletonHelper(component.value as SkinnedMesh)
      helper.frustumCulled = false
      helper.name = `Skinned Mesh Helper For: ${entity}`

      const helperEntity = createEntity()
      setVisibleComponent(helperEntity, true)
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setObjectLayers(helper, ObjectLayers.AvatarHelper)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })

      setComponent(helperEntity, ComputedTransformComponent, {
        referenceEntities: [entity],
        computeFunction: () => {
          // this updates the bone helper lines
          helper.updateMatrixWorld(true)
        }
      })
      return () => {
        removeEntity(helperEntity)
      }
    }, [visible, debugEnabled, component.skeleton.value])

    return null
  }
})
