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
  BufferGeometry,
  InstancedMesh,
  Intersection,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  Ray,
  Raycaster,
  SkinnedMesh
} from 'three'
import { computeBoundsTree, disposeBoundsTree, MeshBVHHelper } from 'three-mesh-bvh'

import { defineSystem, Entity, PresentationSystemGroup, QueryReactor } from '@etherealengine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import {
  ObjectLayerComponents,
  ObjectLayerMaskComponent
} from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'

import { ModelComponent } from '../components/ModelComponent'
import { generateMeshBVH } from '../functions/bvhWorkerPool'

const ray = new Ray()
const tmpInverseMatrix = new Matrix4()
const origMeshRaycastFunc = Mesh.prototype.raycast

function ValidMeshForBVH(mesh: Mesh | undefined): boolean {
  return (
    mesh !== undefined &&
    mesh.isMesh &&
    !(mesh as InstancedMesh).isInstancedMesh &&
    !(mesh as SkinnedMesh).isSkinnedMesh
  )
}

function convertRaycastIntersect(hit: Intersection | null, object: Mesh, raycaster: Raycaster) {
  if (hit === null) {
    return null
  }

  hit.point.applyMatrix4(object.matrixWorld)
  hit.distance = hit.point.distanceTo(raycaster.ray.origin)
  hit.object = object

  if (hit.distance < raycaster.near || hit.distance > raycaster.far) {
    return null
  } else {
    return hit
  }
}

function acceleratedRaycast(raycaster: Raycaster, intersects: Array<Intersection>) {
  const mesh = this as Mesh
  const geometry = mesh.geometry as BufferGeometry
  if (geometry.boundsTree) {
    if (mesh.material === undefined) return

    tmpInverseMatrix.copy(mesh.matrixWorld).invert()
    ray.copy(raycaster.ray).applyMatrix4(tmpInverseMatrix)

    const bvh = geometry.boundsTree
    if (raycaster.firstHitOnly === true) {
      const hit = convertRaycastIntersect(bvh.raycastFirst(ray, mesh.material), mesh, raycaster)
      if (hit) {
        intersects.push(hit)
      }
    } else {
      const hits = bvh.raycast(ray, mesh.material)
      for (let i = 0, l = hits.length; i < l; i++) {
        const hit = convertRaycastIntersect(hits[i], mesh, raycaster)
        if (hit) {
          intersects.push(hit)
        }
      }
    }
  } else if (!ValidMeshForBVH(mesh) || !hasComponent(mesh.entity, MeshComponent))
    origMeshRaycastFunc.call(mesh, raycaster, intersects)
}

Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

const edgeMaterial = new LineBasicMaterial({
  color: 0x00ff88,
  transparent: true,
  opacity: 0.3,
  depthWrite: false
})

const MeshBVHChildReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const bvhDebug = useHookstate(getMutableState(RendererState).bvhDebug)
  const model = useOptionalComponent(props.rootEntity, ModelComponent)
  const generated = useHookstate(false)
  const mesh = useOptionalComponent(props.entity, MeshComponent)

  useEffect(() => {
    const mesh = getOptionalComponent(props.entity, MeshComponent)
    if (!mesh) return
    const abortController = new AbortController()
    if (ValidMeshForBVH(mesh)) {
      generateMeshBVH(mesh!, abortController.signal).then(() => {
        if (abortController.signal.aborted) return
        generated.set(true)
      })
    }
    return () => {
      abortController.abort()
    }
  }, [mesh])

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
  reactor: () => <QueryReactor Components={[MeshComponent]} ChildEntityReactor={MeshBVHChildReactor} />
})
