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

import { InstancedMesh, Mesh, SkinnedMesh } from 'three'

import {
  defineComponent,
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { MeshBVHVisualizer } from 'three-mesh-bvh'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const MeshBVHComponent = defineComponent({
  name: 'MeshBVHComponent',

  onInit(entity) {
    return {
      mesh: null! as Mesh,
      generated: false,
      visualizer: null as MeshBVHVisualizer | null
    }
  },

  onSet(entity, component, json) {
    if (!json || !json.mesh || !json.mesh.isMesh) throw new Error('MeshBVHComponent: Invalid mesh')

    component.mesh.set(json.mesh)
    if (json.visualizer) component.visualizer.set(json.visualizer)
  },

  toJSON(entity, component) {
    return {
      mesh: component.mesh.value,
      generated: component.generated.value,
      visualizer: component.visualizer.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MeshBVHComponent)
    const mesh = useComponent(entity, MeshComponent)
    const debug = useHookstate(getMutableState(RendererState).physicsDebug)

    useEffect(() => {
      generateMeshBVH(component.mesh.value).then(() => {
        component.generated.set(true)
      })
    }, [mesh])

    useEffect(() => {
      let meshBVHVisualizer = null as MeshBVHVisualizer | null

      const remove = () => {
        if (meshBVHVisualizer) {
          removeObjectFromGroup(entity, meshBVHVisualizer)
          //The MeshBVHVisualizer type def is missing the dispose method
          ;(meshBVHVisualizer as any).dispose()
        }
      }

      if (component.generated.value && debug.value) {
        meshBVHVisualizer = new MeshBVHVisualizer(mesh.value)
        addObjectToGroup(entity, meshBVHVisualizer)

        meshBVHVisualizer.depth = 20
        meshBVHVisualizer.displayParents = false
        meshBVHVisualizer.update()
        component.visualizer.set(meshBVHVisualizer)
      } else if (component.visualizer.value && !debug.value) {
        remove()
        component.visualizer.set(null)
      }

      return () => {
        remove()
      }
    }, [component.generated, debug])

    return null
  }
})

export const MeshComponent = defineComponent({
  name: 'Mesh Component',
  jsonID: 'mesh',

  onInit: (entity) => null! as Mesh,

  onSet: (entity, component, mesh: Mesh) => {
    if (!mesh || !mesh.isMesh) throw new Error('MeshComponent: Invalid mesh')

    component.set(mesh)
    MeshComponent.valueMap[entity] = mesh

    if (!(mesh as SkinnedMesh).isSkinnedMesh && !(mesh as InstancedMesh).isInstancedMesh) {
      setComponent(entity, MeshBVHComponent, { mesh: mesh })
    }
  }
})
