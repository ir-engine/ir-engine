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
  BufferGeometry,
  InstancedMesh,
  Intersection,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  Object3D,
  Ray,
  Raycaster,
  SkinnedMesh
} from 'three'
import { computeBoundsTree, disposeBoundsTree, MeshBVHHelper } from 'three-mesh-bvh'

import {
  createEntity,
  defineSystem,
  PresentationSystemGroup,
  QueryReactor,
  removeEntity,
  useEntityContext
} from '@ir-engine/ecs'
import { getComponent, hasComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { getMutableState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'

import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectLayerComponents } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
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
/**
 * @todo we need a fast way to raycast skinned meshes - uncommenting this will cause skinned meshes to intersect and be very slow
 */
SkinnedMesh.prototype.raycast = () => {}

BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

const edgeMaterial = new LineBasicMaterial({
  color: 0x00ff88,
  transparent: true,
  opacity: 0.3,
  depthWrite: false
})

const MeshBVHReactor = () => {
  const entity = useEntityContext()
  const bvhDebug = useHookstate(getMutableState(RendererState).bvhDebug)
  const mesh = useComponent(entity, MeshComponent).get(NO_PROXY) as Mesh
  const hasMeshBVH = useHookstate(false)

  useEffect(() => {
    const abortController = new AbortController()
    if (ValidMeshForBVH(mesh)) {
      generateMeshBVH(mesh!, abortController.signal, { indirect: true }).then(() => {
        if (abortController.signal.aborted) return
        hasMeshBVH.set(true)
      })
    }
    return () => {
      hasMeshBVH.set(false)
      abortController.abort()
    }
  }, [mesh])

  useEffect(() => {
    if (!bvhDebug.value || !hasMeshBVH.value) return

    const mesh = getComponent(entity, MeshComponent)

    const meshBVHVisualizer = new MeshBVHHelper(mesh!)
    meshBVHVisualizer.edgeMaterial = edgeMaterial
    meshBVHVisualizer.depth = 20
    meshBVHVisualizer.displayParents = false

    const helperEntity = createEntity()
    const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
    setComponent(helperEntity, NameComponent, getComponent(entity, NameComponent) + ' BVH')
    setComponent(helperEntity, TransformComponent)
    setComponent(helperEntity, EntityTreeComponent, { parentEntity })
    setComponent(helperEntity, ObjectComponent, meshBVHVisualizer)
    setComponent(helperEntity, VisibleComponent)
    // ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.)

    // @ts-ignore - private property
    meshBVHVisualizer._roots = []
    meshBVHVisualizer.update()

    return () => {
      removeEntity(helperEntity)
    }
  }, [bvhDebug.value, hasMeshBVH.value])

  return null
}
export const MeshBVHSystem = defineSystem({
  uuid: 'ee.engine.MeshBVHSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => (
    <QueryReactor
      Components={[MeshComponent, ObjectLayerComponents[ObjectLayers.Scene]]}
      ChildEntityReactor={MeshBVHReactor}
    />
  )
})

MeshBVHHelper.prototype.add = function (object: Object3D) {
  if (!this.entity) return this
  const parentEntity = getComponent(this.entity, EntityTreeComponent).parentEntity
  const entity = createEntity()
  setComponent(entity, NameComponent, 'BVH Root')
  setComponent(entity, TransformComponent)
  setComponent(entity, VisibleComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity })
  setComponent(entity, ObjectComponent, object)
  console.log('add', { entity })
  return this
}

MeshBVHHelper.prototype.remove = function (object: Object3D) {
  if (!this.entity) return this
  const entity = object.entity
  console.log('remove', { entity })
  removeEntity(entity)
  return this
}
