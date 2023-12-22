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

import {
  Box3,
  Box3Helper,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InterleavedBufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry
} from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { GroupComponent, addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { setVisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CSM } from './CSM'

export class CSMHelper {
  public displayFrustum = true
  public displayPlanes = true
  public displayShadowBounds = true
  private frustumLinesEntity: Entity
  private cascadeLines: Entity[] = []
  private cascadePlanes: Entity[] = []
  private shadowLines: Entity[] = []
  paused = false

  public constructor() {
    const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7])
    const positions = new Float32Array(24)
    const frustumGeometry = new BufferGeometry()
    frustumGeometry.setIndex(new BufferAttribute(indices, 1))
    frustumGeometry.setAttribute('position', new BufferAttribute(positions, 3, false))
    const frustumLines = new LineSegments(frustumGeometry, new LineBasicMaterial())
    frustumLines.frustumCulled = false

    const frustumLinesEntity = createEntity()
    addObjectToGroup(frustumLinesEntity, frustumLines)
    setComponent(frustumLinesEntity, EntityTreeComponent, { parentEntity: Engine.instance.cameraEntity })
    setComponent(frustumLinesEntity, NameComponent, 'CSM frustum lines')
    setObjectLayers(frustumLines, ObjectLayers.NodeHelper)

    this.frustumLinesEntity = frustumLinesEntity
  }

  public updateVisibility() {
    const displayFrustum = this.displayFrustum
    const displayPlanes = this.displayPlanes
    const displayShadowBounds = this.displayShadowBounds

    setVisibleComponent(this.frustumLinesEntity, displayFrustum)
    setComponent(this.frustumLinesEntity, EntityTreeComponent, {
      parentEntity: !this.paused ? Engine.instance.cameraEntity : null
    })

    const cascadeLines = this.cascadeLines
    const cascadePlanes = this.cascadePlanes
    const shadowLines = this.shadowLines

    for (let i = 0, l = cascadeLines.length; i < l; i++) {
      const cascadeLine = cascadeLines[i]
      const cascadePlane = cascadePlanes[i]
      const shadowLineGroup = shadowLines[i]
      setComponent(cascadeLine, EntityTreeComponent, {
        parentEntity: !this.paused ? Engine.instance.cameraEntity : null
      })
      setComponent(cascadePlane, EntityTreeComponent, {
        parentEntity: !this.paused ? Engine.instance.cameraEntity : null
      })
      setVisibleComponent(cascadeLine, displayFrustum)
      setVisibleComponent(cascadePlane, displayFrustum && displayPlanes)
      setVisibleComponent(shadowLineGroup, displayShadowBounds)
    }
  }

  public update(csm: CSM) {
    this.updateVisibility()

    if (this.paused) return

    const cascades = csm.cascades
    const mainFrustum = csm.mainFrustum
    const frustums = csm.frustums
    const lights = csm.lights

    const frustumLines = getComponent(this.frustumLinesEntity, GroupComponent)[0] as any as LineSegments<
      BufferGeometry,
      LineBasicMaterial
    >
    const frustumLinePositions = frustumLines.geometry.getAttribute('position') as
      | BufferAttribute
      | InterleavedBufferAttribute
    const cascadeLines = this.cascadeLines
    const cascadePlanes = this.cascadePlanes
    const shadowLines = this.shadowLines

    while (cascadeLines.length > cascades) {
      removeEntity(cascadeLines.pop()!)
      removeEntity(cascadePlanes.pop()!)
      removeEntity(shadowLines.pop()!)
    }

    while (cascadeLines.length < cascades) {
      const cascadeLine = new Box3Helper(new Box3(), new Color(0xffffff))
      cascadeLine.frustumCulled = false
      const cascadeLinesEntity = createEntity()
      addObjectToGroup(cascadeLinesEntity, cascadeLine)
      setComponent(cascadeLinesEntity, EntityTreeComponent, { parentEntity: Engine.instance.cameraEntity })
      setComponent(cascadeLinesEntity, NameComponent, 'CSM cascade line ' + cascadeLines.length)
      setObjectLayers(cascadeLine, ObjectLayers.NodeHelper)

      cascadeLines.push(cascadeLinesEntity)

      const planeMat = new MeshBasicMaterial({ transparent: true, opacity: 0.1, depthWrite: false, side: DoubleSide })
      const cascadePlane = new Mesh(new PlaneGeometry(), planeMat)
      cascadePlane.frustumCulled = false
      const cascadePlanesEntity = createEntity()
      addObjectToGroup(cascadePlanesEntity, cascadePlane)
      setComponent(cascadePlanesEntity, EntityTreeComponent, { parentEntity: Engine.instance.cameraEntity })
      setComponent(cascadePlanesEntity, NameComponent, 'CSM cascade plane ' + cascadeLines.length)
      setObjectLayers(cascadePlane, ObjectLayers.NodeHelper)

      cascadePlanes.push(cascadePlanesEntity)

      const shadowLine = new Box3Helper(new Box3(), new Color(0xffff00))
      shadowLine.frustumCulled = false
      const shadowLinesEntity = createEntity()
      addObjectToGroup(shadowLinesEntity, shadowLine)
      setComponent(shadowLinesEntity, EntityTreeComponent, { parentEntity: null })
      setComponent(shadowLinesEntity, NameComponent, 'CSM shadow line ' + cascadeLines.length)
      setObjectLayers(shadowLine, ObjectLayers.NodeHelper)
      shadowLines.push(shadowLinesEntity)
    }

    for (let i = 0; i < cascades; i++) {
      const frustum = frustums[i]
      const light = lights[i]
      const shadowCam = light.shadow.camera
      const farVerts = frustum.vertices.far

      const cascadeLine = getComponent(cascadeLines[i], GroupComponent)[0] as any as Box3Helper
      const cascadeLineTransform = getComponent(cascadeLines[i], TransformComponent)
      const cascadePlane = getComponent(cascadePlanes[i], TransformComponent)
      const shadowLine = getComponent(shadowLines[i], GroupComponent)[0] as any as Box3Helper
      const shadowTransform = getComponent(shadowLines[i], TransformComponent)

      cascadeLine.box.min.copy(farVerts[2])
      cascadeLine.box.max.copy(farVerts[0])
      cascadeLine.box.max.z += 1e-4
      cascadeLine.box.getCenter(cascadeLineTransform.position)
      cascadeLine.box.getSize(cascadeLineTransform.scale)
      cascadeLineTransform.scale.multiplyScalar(0.5)

      cascadePlane.position.addVectors(farVerts[0], farVerts[2])
      cascadePlane.position.multiplyScalar(0.5)
      cascadePlane.scale.subVectors(farVerts[0], farVerts[2])
      cascadePlane.scale.z = 1e-4

      shadowLine.box.min.set(shadowCam.bottom, shadowCam.left, -shadowCam.far)
      shadowLine.box.max.set(shadowCam.top, shadowCam.right, -shadowCam.near)
      shadowLine.box.applyMatrix4(shadowCam.matrixWorld)
      shadowLine.box.getCenter(shadowTransform.position)
      shadowLine.box.getSize(shadowTransform.scale)
      shadowTransform.scale.multiplyScalar(0.5)
      shadowTransform.rotation.copy(shadowCam.quaternion)
    }

    const nearVerts = mainFrustum.vertices.near
    const farVerts = mainFrustum.vertices.far
    frustumLinePositions.setXYZ(0, farVerts[0].x, farVerts[0].y, farVerts[0].z)
    frustumLinePositions.setXYZ(1, farVerts[3].x, farVerts[3].y, farVerts[3].z)
    frustumLinePositions.setXYZ(2, farVerts[2].x, farVerts[2].y, farVerts[2].z)
    frustumLinePositions.setXYZ(3, farVerts[1].x, farVerts[1].y, farVerts[1].z)

    frustumLinePositions.setXYZ(4, nearVerts[0].x, nearVerts[0].y, nearVerts[0].z)
    frustumLinePositions.setXYZ(5, nearVerts[3].x, nearVerts[3].y, nearVerts[3].z)
    frustumLinePositions.setXYZ(6, nearVerts[2].x, nearVerts[2].y, nearVerts[2].z)
    frustumLinePositions.setXYZ(7, nearVerts[1].x, nearVerts[1].y, nearVerts[1].z)
    frustumLinePositions.needsUpdate = true
  }

  remove() {
    removeEntity(this.frustumLinesEntity)
    this.cascadeLines.forEach((entity) => removeEntity(entity))
    this.cascadePlanes.forEach((entity) => removeEntity(entity))
    this.shadowLines.forEach((entity) => removeEntity(entity))
  }
}

export default CSMHelper
