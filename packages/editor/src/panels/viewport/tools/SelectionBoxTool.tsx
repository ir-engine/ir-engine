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

import { EntityUUID, UUIDComponent, getComponent, hasComponent, setComponent } from '@ir-engine/ecs'
import { defineState, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect, useState } from 'react'
import {
  Box3,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Frustum,
  Mesh,
  MeshStandardMaterial,
  Plane,
  Vector3
} from 'three'
import { EditorState } from '../../../services/EditorServices'
import { SelectionState } from '../../../services/SelectionServices'

import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { createSceneEntity } from '@ir-engine/engine/src/scene/functions/createSceneEntity'
import { proxifyParentChildRelationships } from '@ir-engine/engine/src/scene/functions/loadGLTFModel'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { setObjectLayers } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
export const SelectionBoxState = defineState({
  name: 'selectionBox State',
  initial: () => ({
    selectionBoxEnabled: false
  })
})

export default function SelectionBox({
  viewportRef,
  toolbarRef
}: {
  viewportRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
}) {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  // const [width, setWidth] = useState(0)
  // const [height, setHeight] = useState(0)
  const width = useHookstate(0)
  const height = useHookstate(0)

  const [isDragging, setIsDragging] = useState(false)
  const handleMouseDown = (e: React.MouseEvent) => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const toolbarRect = toolbarRef.current!.getBoundingClientRect()

    setStartX(e.clientX)
    setStartY(e.clientY)
    setIsDragging(true)
    setLeft(Math.max(e.clientX - viewportRect.left, 0))
    setTop(Math.max(e.clientY - viewportRect.top - toolbarRect.height, 0))
    width.set(0)
    height.set(0)
    // setWidth(0)
    // setHeight(0)

    SelectionState.updateSelection([])
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const toolbarRect = toolbarRef.current!.getBoundingClientRect()
    if (!isDragging) return
    width.set(Math.min(e.clientX - startX, viewportRect.width - startX))
    height.set(Math.min(e.clientY - startY, viewportRect.height + toolbarRect.height - startY))
  }
  const handleMouseUp = (e: React.MouseEvent) => {
    // width.set(e.clientX - startX)
    // height.set(e.clientY - startY)
    setIsDragging(false)
    if (getMutableState(SelectionBoxState).selectionBoxEnabled.value) {
      updateSelectionEntity()
    }
  }
  const updateSelectionEntity = () => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const ndcX1 = (left / viewportRect.width) * 2 - 1
    const ndcX2 = ((left + width.value) / viewportRect.width) * 2 - 1
    const ndcY1 = 1 - (top / viewportRect.height) * 2
    const ndcY2 = 1 - ((top + height.value) / viewportRect.height) * 2

    const camera = getComponent(getState(EngineState).viewerEntity, CameraComponent)
    const selectedUUIDs = [] as EntityUUID[]
    // convert NDC points to world space (for both near and far planes)

    camera.near = 0.1
    camera.far = 1000 // typical value for far plane
    camera.aspect = viewportRect.width / viewportRect.height
    camera.fov = 60 // or adjust to match your screen view better

    // Ensure the projection matrix is updated with these settings
    camera.updateProjectionMatrix()
    camera.updateProjectionMatrix()
    const near = camera.near
    const far = camera.far
    // const p1Near = new Vector3(ndcX1, ndcY1, -1).unproject(camera) // top-left near
    // const p2Near = new Vector3(ndcX2, ndcY1, -1).unproject(camera) // top-right near
    // const p3Near = new Vector3(ndcX1, ndcY2, -1).unproject(camera) // bottom-left near
    // const p4Near = new Vector3(ndcX2, ndcY2, -1).unproject(camera) // bottom-right near

    // const p1Far = new Vector3(ndcX1, ndcY1, 1).unproject(camera) // top-left far
    // const p2Far = new Vector3(ndcX2, ndcY1, 1).unproject(camera) // top-right far
    // const p3Far = new Vector3(ndcX1, ndcY2, 1).unproject(camera) // bottom-left far
    // const p4Far = new Vector3(ndcX2, ndcY2, 1).unproject(camera) // bottom-right far

    // construct the frustum with six planes
    const nearDistance = camera.near
    const farDistance = camera.far

    // Helper function to convert screen space to world space at a specific Z distance
    function screenToWorld(screenX, screenY, distance) {
      const x = (screenX / viewportRect.width) * 2 - 1
      const y = 1 - (screenY / viewportRect.height) * 2
      const vector = new Vector3(x, y, 1)
      vector.unproject(camera)
      const direction = vector.sub(camera.position).normalize()
      return camera.position.clone().add(direction.multiplyScalar(distance))
    }

    // Calculate the four corners at the near plane
    const p1Near = screenToWorld(left, top, nearDistance)
    const p2Near = screenToWorld(left + width.value, top, nearDistance)
    const p3Near = screenToWorld(left, top + height.value, nearDistance)
    const p4Near = screenToWorld(left + width.value, top + height.value, nearDistance)

    // Calculate the four corners at the far plane
    const p1Far = screenToWorld(left, top, farDistance)
    const p2Far = screenToWorld(left + width.value, top, farDistance)
    const p3Far = screenToWorld(left, top + height.value, farDistance)
    const p4Far = screenToWorld(left + width.value, top + height.value, farDistance)
    const frustum = new Frustum(
      new Plane().setFromCoplanarPoints(p1Near, p2Near, p4Near), // Near plane
      new Plane().setFromCoplanarPoints(p1Far, p2Far, p4Far), // Far plane
      new Plane().setFromCoplanarPoints(p1Near, p1Far, p3Far), // Left plane
      new Plane().setFromCoplanarPoints(p2Near, p2Far, p4Far), // Right plane
      new Plane().setFromCoplanarPoints(p1Near, p2Near, p2Far), // Top plane
      new Plane().setFromCoplanarPoints(p3Near, p4Near, p4Far) // Bottom plane
    )
    // const frustumGeometry = new BufferGeometry().setFromPoints([
    //   // Near plane
    //   p1Near, p2Near, p2Near, p4Near, p4Near, p3Near, p3Near, p1Near,
    //   // Far plane
    //   p1Far, p2Far, p2Far, p4Far, p4Far, p3Far, p3Far, p1Far,
    //   // Connecting near and far planes
    //   p1Near, p1Far, p2Near, p2Far, p3Near, p3Far, p4Near, p4Far
    // ])
    // Define vertices for the frustum
    const vertices = new Float32Array([
      // Near plane (use in a consistent order)
      p1Near.x,
      p1Near.y,
      p1Near.z,
      p2Near.x,
      p2Near.y,
      p2Near.z,
      p4Near.x,
      p4Near.y,
      p4Near.z,
      p3Near.x,
      p3Near.y,
      p3Near.z,

      // Far plane (same order as near plane)
      p1Far.x,
      p1Far.y,
      p1Far.z,
      p2Far.x,
      p2Far.y,
      p2Far.z,
      p4Far.x,
      p4Far.y,
      p4Far.z,
      p3Far.x,
      p3Far.y,
      p3Far.z
    ])

    // Define the indices for the triangular faces
    const indices = [
      // Near plane
      0, 1, 2, 2, 3, 0,

      // Far plane
      4, 5, 6, 6, 7, 4,

      // Side planes
      0, 1, 5, 5, 4, 0,

      1, 2, 6, 6, 5, 1,

      2, 3, 7, 7, 6, 2,

      3, 0, 4, 4, 7, 3
    ]

    // Create the geometry and set its vertices and faces
    const frustumGeometry = new BufferGeometry()
    frustumGeometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    frustumGeometry.setIndex(indices)
    frustumGeometry.computeVertexNormals()

    // Create a solid material for the frustum
    const material = new MeshStandardMaterial({ color: 0x00ff00, side: DoubleSide, opacity: 0.8, transparent: true })

    // Create the mesh from geometry and material
    const frustumMesh = new Mesh(frustumGeometry, material)
    // Create a material for the lines
    const mesh = new Mesh(frustumGeometry, material)
    const geoEntity = createSceneEntity('frustum', getState(EditorState).rootEntity)
    setComponent(geoEntity, MeshComponent, mesh)
    addObjectToGroup(geoEntity, mesh)
    proxifyParentChildRelationships(mesh)
    setObjectLayers(mesh, ObjectLayers.Scene)
    const parentEntity = getState(EditorState).rootEntity
    const entities = getComponent(parentEntity, EntityTreeComponent).children

    entities.forEach((entity) => {
      if (hasComponent(entity, ModelComponent)) {
        const scene = getComponent(entity, ModelComponent).scene
        // const scene = getComponent(entity, ModelComponent).scene
        // const modelComponent = getComponent(entity, ModelComponent).asset?.scene
        // const [gltf, error] = useGLTF(modelComponent.src, entity)
        if (!scene) return {}
        scene.traverse((mesh: Mesh) => {
          if (mesh.isMesh) {
            mesh.frustumCulled = true
            const boundingBox = new Box3().setFromObject(mesh)
            const boxVertices = new Float32Array([
              // Front face (z = min)
              boundingBox.min.x,
              boundingBox.min.y,
              boundingBox.min.z, // 0: Bottom-left front
              boundingBox.max.x,
              boundingBox.min.y,
              boundingBox.min.z, // 1: Bottom-right front
              boundingBox.max.x,
              boundingBox.max.y,
              boundingBox.min.z, // 2: Top-right front
              boundingBox.min.x,
              boundingBox.max.y,
              boundingBox.min.z, // 3: Top-left front

              // Back face (z = max)
              boundingBox.min.x,
              boundingBox.min.y,
              boundingBox.max.z, // 4: Bottom-left back
              boundingBox.max.x,
              boundingBox.min.y,
              boundingBox.max.z, // 5: Bottom-right back
              boundingBox.max.x,
              boundingBox.max.y,
              boundingBox.max.z, // 6: Top-right back
              boundingBox.min.x,
              boundingBox.max.y,
              boundingBox.max.z // 7: Top-left back
            ])

            const boxIndices = [
              // Front face
              0, 1, 2, 0, 2, 3,

              // Back face
              4, 6, 5, 4, 7, 6,

              // Top face
              3, 2, 6, 3, 6, 7,

              // Bottom face
              0, 5, 1, 0, 4, 5,

              // Right face
              1, 5, 6, 1, 6, 2,

              // Left face
              0, 3, 7, 0, 7, 4
            ]

            const boxGeometry = new BufferGeometry()
            boxGeometry.setAttribute('position', new Float32BufferAttribute(boxVertices, 3))
            boxGeometry.setIndex(boxIndices)
            boxGeometry.computeVertexNormals()

            // Define a transparent material for the bounding box
            const boxMaterial = new MeshStandardMaterial({
              color: 0xff0000, // Red color
              side: DoubleSide,
              opacity: 0.8,
              transparent: true
            })

            // Create the mesh
            const boundingBoxMesh = new Mesh(boxGeometry, boxMaterial)

            // Create a new entity for the bounding box in the scene
            const boxEntity = createSceneEntity('boundingBox', getState(EditorState).rootEntity)

            // Set the mesh component to the entity
            setComponent(boxEntity, MeshComponent, boundingBoxMesh)

            // Add the mesh to the group and configure relationships
            addObjectToGroup(boxEntity, boundingBoxMesh)
            proxifyParentChildRelationships(boundingBoxMesh)

            // Set the bounding box mesh to render in the appropriate layer
            setObjectLayers(boundingBoxMesh, ObjectLayers.Scene)

            //console.log(mesh)
            //const status=frustum.intersectsBox(boundingBox)
            const tolerance = 0.0001
            const status = frustum.planes.every((plane) => {
              return (
                plane.distanceToPoint(boundingBox.min) < tolerance ||
                plane.distanceToPoint(boundingBox.max) > -tolerance
              )
            })
            console.log(status)
            if (status) {
              console.log('intersected', entity)
              selectedUUIDs.push(getComponent(entity, UUIDComponent))
            }
          }
          //selectedUUIDs.push(getComponent(entity, UUIDComponent))
        })
      }
    })

    // iterateEntityNode(parentEntity, (entity) => {
    //   console.log(entity)
    //   selectedUUIDs.push(getComponent(entity, UUIDComponent))
    //   if (hasComponent(entity, ModelComponent)) {
    //     const scene = getComponent(entity, ModelComponent).scene
    //     const modelComponent = useComponent(entity, ModelComponent)
    //     const [gltf, error] = useGLTF(modelComponent.src.value, entity)
    //     const mesh = getFirstMesh(gltf!.scene)

    //     // if (mesh && frustum.intersectsObject(mesh)) {
    //     //   selectedUUIDs.push(getComponent(entity, UUIDComponent))
    //     // }
    //     // if (!scene) return {}
    //     // scene.traverse((mesh: Mesh) => {
    //     //   if (!mesh.isMesh) return
    //     //   if (frustum.intersectsObject(mesh)) {
    //     //     selectedUUIDs.push(getComponent(entity, UUIDComponent))
    //     //   }
    //     // })
    //   }
    // })
    console.log('finish', selectedUUIDs)

    SelectionState.updateSelection(selectedUUIDs)
  }
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any)
    document.addEventListener('mouseup', handleMouseUp as any)
    document.addEventListener('mousedown', handleMouseDown as any)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any)
      document.removeEventListener('mouseup', handleMouseUp as any)
      document.removeEventListener('mousedown', handleMouseDown as any)
    }
  }, [isDragging])
  return (
    <div className="relative h-full w-full">
      {getMutableState(SelectionBoxState).selectionBoxEnabled.value && isDragging && (
        <div
          className="absolute z-[5] flex flex-col items-center border-2 border-dashed border-white bg-transparent"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${width.value}px`,
            height: `${height.value}px`
          }}
        />
      )}
      {/* )} */}
    </div>
  )
}
