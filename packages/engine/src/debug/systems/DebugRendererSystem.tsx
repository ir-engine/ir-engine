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
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, Mesh } from 'three'
import { MeshBVHVisualizer } from 'three-mesh-bvh'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { RendererState } from '../../renderer/RendererState'
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem'
import { createInfiniteGridHelper } from '../../scene/classes/InfiniteGridHelper'
import {
  GroupComponent,
  GroupQueryReactor,
  GroupReactorProps,
  addObjectToGroup
} from '../../scene/components/GroupComponent'
import { setVisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/ObjectLayers'

const visualizers = [] as MeshBVHVisualizer[]

const DebugGroupChildReactor = (props: GroupReactorProps) => {
  const obj = props.obj
  const debug = useHookstate(getMutableState(RendererState).physicsDebug)

  // add MeshBVHVisualizer to meshes when debugEnable is true
  useEffect(() => {
    if (!debug.value || !obj) return

    const meshBVHVisualizers = [] as MeshBVHVisualizer[]

    function addMeshBVHVisualizer(obj: Mesh) {
      const mesh = obj as any as Mesh
      if (mesh.isMesh && mesh.parent && mesh.geometry?.boundsTree) {
        const meshBVHVisualizer = new MeshBVHVisualizer(mesh)
        mesh.parent.add(meshBVHVisualizer)
        visualizers.push(meshBVHVisualizer)
        meshBVHVisualizers.push(meshBVHVisualizer)
        meshBVHVisualizer.depth = 20
        meshBVHVisualizer.displayParents = false
        meshBVHVisualizer.update()
        return meshBVHVisualizer
      }
    }

    obj.traverse(addMeshBVHVisualizer)

    return () => {
      for (const visualizer of meshBVHVisualizers) {
        visualizer.removeFromParent()
        visualizers.splice(visualizers.indexOf(visualizer), 1)
      }
    }
  }, [obj, debug])

  return <></>
}

const execute = () => {
  const physicsDebugEntity = getState(RendererState).physicsDebugEntity

  if (physicsDebugEntity) {
    const lineSegments = getComponent(physicsDebugEntity, GroupComponent)[0] as any as LineSegments
    const physicsWorld = getState(PhysicsState).physicsWorld
    if (physicsWorld) {
      const debugRenderBuffer = physicsWorld.debugRender()
      lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
      lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))
    }
  }

  for (const visualizer of visualizers) {
    visualizer.updateMatrixWorld(true)
  }
}

const reactor = () => {
  const engineRendererSettings = useHookstate(getMutableState(RendererState))

  useEffect(() => {
    if (!engineRendererSettings.physicsDebug.value) return

    const lineMaterial = new LineBasicMaterial({ vertexColors: true })
    const lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
    lineSegments.frustumCulled = false
    setObjectLayers(lineSegments, ObjectLayers.PhysicsHelper)

    const lineSegmentsEntity = createEntity()
    setVisibleComponent(lineSegmentsEntity, true)
    addObjectToGroup(lineSegmentsEntity, lineSegments)
    engineRendererSettings.physicsDebugEntity.set(lineSegmentsEntity)

    return () => {
      removeEntity(lineSegmentsEntity)
      engineRendererSettings.physicsDebugEntity.set(null)
    }
  }, [engineRendererSettings.physicsDebug])

  useEffect(() => {
    if (!engineRendererSettings.gridVisibility.value) return

    const infiniteGridHelperEntity = createInfiniteGridHelper()
    getMutableState(RendererState).infiniteGridHelperEntity.set(infiniteGridHelperEntity)
    return () => {
      removeEntity(infiniteGridHelperEntity)
      getMutableState(RendererState).infiniteGridHelperEntity.set(null)
    }
  }, [engineRendererSettings.gridVisibility])

  return <GroupQueryReactor GroupChildReactor={DebugGroupChildReactor} />
}

export const DebugRendererSystem = defineSystem({
  uuid: 'ee.engine.DebugRendererSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
