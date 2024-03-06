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

import { Entity, PresentationSystemGroup, defineSystem } from '@etherealengine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import {
  ObjectLayerComponents,
  ObjectLayerMaskComponent
} from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import React, { useEffect } from 'react'
import {
  BufferGeometry,
  InstancedMesh,
  Intersection,
  LineBasicMaterial,
  Mesh,
  Object3D,
  Raycaster,
  SkinnedMesh
} from 'three'
import { MeshBVHHelper, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { MeshOrModelQuery, ModelComponent } from '../components/ModelComponent'
import { generateMeshBVH } from '../functions/bvhWorkerPool'

Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

const edgeMaterial = new LineBasicMaterial({
  color: 0x00ff88,
  transparent: true,
  opacity: 0.3,
  depthWrite: false
})

function ValidMeshForBVH(mesh: Mesh | undefined): boolean {
  return (
    mesh !== undefined &&
    mesh.isMesh &&
    !(mesh as InstancedMesh).isInstancedMesh &&
    !(mesh as SkinnedMesh).isSkinnedMesh
  )
}

/** @todo abstract this to not rely on model component, instead always generating BVH, but moving the camera layer logic into model component */
const MeshBVHChildReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const bvhDebug = useHookstate(getMutableState(RendererState).bvhDebug)
  const model = useOptionalComponent(props.rootEntity, ModelComponent)
  const generated = useHookstate(false)

  const abortControllerState = useHookstate(new AbortController())

  useEffect(() => {
    const abortController = abortControllerState.value
    const mesh = getOptionalComponent(props.entity, MeshComponent)
    if (ValidMeshForBVH(mesh)) {
      generateMeshBVH(mesh!, abortController.signal).then(() => {
        if (abortController.signal.aborted) return
        generated.set(true)
      })
    }
    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    const occlusion =
      !!model?.cameraOcclusion?.value || hasComponent(props.entity, ObjectLayerComponents[ObjectLayers.Camera])
    if (!occlusion || !generated.value) return
    ObjectLayerMaskComponent.enableLayer(props.entity, ObjectLayers.Camera)
    return () => {
      ObjectLayerMaskComponent.disableLayer(props.entity, ObjectLayers.Camera)
    }
  }, [model?.cameraOcclusion?.value, generated.value])

  useEffect(() => {
    if (!bvhDebug.value || !generated.value) return

    const mesh = getComponent(props.entity, MeshComponent)

    const meshBVHVisualizer = new MeshBVHHelper(mesh!)
    meshBVHVisualizer.edgeMaterial = edgeMaterial
    meshBVHVisualizer.depth = 20
    meshBVHVisualizer.displayParents = false
    meshBVHVisualizer.update()

    addObjectToGroup(props.entity, meshBVHVisualizer)

    return () => {
      removeObjectFromGroup(props.entity, meshBVHVisualizer)
    }
  }, [generated.value, bvhDebug.value])

  return null
}

export const MeshBVHSystem = defineSystem({
  uuid: 'ee.engine.MeshBVHSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <MeshOrModelQuery ChildReactor={MeshBVHChildReactor} />
})

/** Patch raycast functions to avoid intersections when BVH has not been generated */
Raycaster.prototype.intersectObject = function <TIntersected extends Object3D>(
  object: Object3D,
  recursive = true,
  intersects = [] as Array<Intersection<TIntersected>>
): Array<Intersection<TIntersected>> {
  const mesh = object as Mesh
  if (!mesh?.geometry?.boundsTree) return intersects
  intersectObject(object, this, intersects, recursive)
  intersects.sort(ascSort)
  return intersects
}

Raycaster.prototype.intersectObjects = function <TIntersected extends Object3D>(
  objects: Array<Object3D>,
  recursive = true,
  intersects = [] as Array<Intersection<TIntersected>>
): Array<Intersection<TIntersected>> {
  for (let i = 0, l = objects.length; i < l; i++) {
    const mesh = objects[i] as Mesh
    if (mesh?.geometry?.boundsTree) intersectObject(objects[i], this, intersects, recursive)
  }
  intersects.sort(ascSort)
  return intersects
}

function intersectObject(object: Object3D, raycaster: Raycaster, intersects: Array<Intersection>, recursive: boolean) {
  if (object.layers.test(raycaster.layers)) {
    object.raycast(raycaster, intersects)
  }
  if (recursive === true) {
    const children = object.children
    for (let i = 0, l = children.length; i < l; i++) {
      intersectObject(children[i], raycaster, intersects, true)
    }
  }
}

function ascSort(a, b) {
  return a.distance - b.distance
}
