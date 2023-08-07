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
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, LineSegments, Mesh, Vector3 } from 'three'
import { MeshBVHVisualizer } from 'three-mesh-bvh'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { RaycastArgs } from '../../physics/classes/Physics'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { RaycastHit } from '../../physics/types/PhysicsTypes'
import { RendererState } from '../../renderer/RendererState'
import InfiniteGridHelper from '../../scene/classes/InfiniteGridHelper'
import { GroupQueryReactor, GroupReactorProps } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'

type RaycastDebugs = {
  raycastQuery: RaycastArgs
  hits: RaycastHit[]
}

const debugLines = new Set<Line<BufferGeometry, LineBasicMaterial>>()
const debugLineLifetime = 1000 // 1 second

const lineMaterial = new LineBasicMaterial({ vertexColors: true })
const _lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
_lineSegments.frustumCulled = false

const visualizers = [] as MeshBVHVisualizer[]

const DebugGroupChildReactor = (props: GroupReactorProps) => {
  const obj = props.obj
  const debug = useHookstate(getMutableState(RendererState).debugEnable)

  // add MeshBVHVisualizer to meshes when debugEnable is true
  useEffect(() => {
    if (!debug.value || !obj) return

    const meshBVHVisualizers = [] as MeshBVHVisualizer[]

    function addMeshBVHVisualizer(obj: Mesh) {
      const mesh = obj as any as Mesh
      if (mesh.isMesh && mesh.geometry?.boundsTree) {
        const meshBVHVisualizer = new MeshBVHVisualizer(mesh)
        mesh.parent!.add(meshBVHVisualizer)
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
  const enabled = getState(RendererState).debugEnable

  _lineSegments.visible = enabled

  const physicsWorld = getState(PhysicsState).physicsWorld

  if (enabled && physicsWorld) {
    const debugRenderBuffer = physicsWorld.debugRender()
    _lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
    _lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))

    for (const { raycastQuery, hits } of (physicsWorld as any).raycastDebugs as RaycastDebugs[]) {
      const line = new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(0, 0, 0),
          raycastQuery.direction.clone().multiplyScalar(raycastQuery.maxDistance)
        ]),
        new LineBasicMaterial({ color: 0x0000ff })
      )
      line.position.copy(raycastQuery.origin)
      Engine.instance.scene.add(line)
      debugLines.add(line)
      line.userData.originTime = Date.now()
    }
  } else {
    for (const line of debugLines) {
      Engine.instance.scene.remove(line)
      line.material.dispose()
      line.geometry.dispose()
    }
    debugLines.clear()
  }

  for (const visualizer of visualizers) {
    visualizer.updateMatrixWorld(true)
  }

  for (const line of debugLines) {
    line.updateMatrixWorld()
    if (Date.now() - line.userData.originTime > debugLineLifetime) {
      Engine.instance.scene.remove(line)
      line.material.dispose()
      line.geometry.dispose()
      debugLines.delete(line)
    }
  }

  if (physicsWorld) (physicsWorld as any).raycastDebugs = []
}

const reactor = () => {
  const engineRendererSettings = useHookstate(getMutableState(RendererState))

  useEffect(() => {
    InfiniteGridHelper.instance = new InfiniteGridHelper()
    Engine.instance.scene.add(InfiniteGridHelper.instance)

    setObjectLayers(_lineSegments, ObjectLayers.PhysicsHelper)
    Engine.instance.scene.add(_lineSegments)

    return () => {
      _lineSegments.removeFromParent()
      Engine.instance.scene.remove(InfiniteGridHelper.instance)
      InfiniteGridHelper.instance = null!
    }
  }, [])

  useEffect(() => {
    InfiniteGridHelper.instance.setGridHeight(engineRendererSettings.gridHeight.value)
  }, [engineRendererSettings.gridHeight])

  return <GroupQueryReactor GroupChildReactor={DebugGroupChildReactor} />
}

export const DebugRendererSystem = defineSystem({
  uuid: 'ee.engine.DebugRendererSystem',
  execute,
  reactor
})
