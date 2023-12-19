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

import { getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, ShadowMaterial } from 'three'
import matches from 'ts-matches'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { defineComponent, getMutableComponent, setComponent, useComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity, useEntityContext } from '../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../ecs/functions/EntityTree'
import { addObjectToGroup, removeObjectFromGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { ReferenceSpace, XRState } from './XRState'

export const placementHelperMaterial = new MeshBasicMaterial({
  color: 'grey',
  wireframe: false,
  opacity: 0.5,
  transparent: true
})
export const shadowMaterial = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
shadowMaterial.polygonOffset = true
shadowMaterial.polygonOffsetFactor = -0.01
export const occlusionMat = new MeshBasicMaterial({ colorWrite: false })
occlusionMat.polygonOffset = true
occlusionMat.polygonOffsetFactor = -0.01

export const XRDetectedPlaneComponent = defineComponent({
  name: 'XRDetectedPlaneComponent',

  onInit(entity) {
    return {
      plane: null! as XRPlane,
      // internal
      shadowMesh: null! as Mesh,
      occlusionMesh: null! as Mesh,
      geometry: null! as BufferGeometry,
      placementHelper: null! as Mesh
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (matches.object.test(json.plane)) {
      component.plane.set(json.plane as XRPlane)
    }
    if (matches.object.test(json.geometry)) {
      component.geometry.value?.dispose?.()
      component.geometry.set(json.geometry as BufferGeometry)
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, XRDetectedPlaneComponent)
    const scenePlacementMode = useHookstate(getMutableState(XRState).scenePlacementMode)

    useEffect(() => {
      const geometry = XRDetectedPlaneComponent.createGeometryFromPolygon(component.plane.value)
      component.geometry.set(geometry)

      const shadowMesh = new Mesh(geometry, shadowMaterial)

      const occlusionMesh = new Mesh(geometry, occlusionMat)
      occlusionMesh.renderOrder = -1 /** @todo make a global config for AR occlusion mesh renderOrder */

      const placementHelper = new Mesh(geometry, placementHelperMaterial)
      occlusionMesh.add(placementHelper)

      addObjectToGroup(entity, shadowMesh)
      addObjectToGroup(entity, occlusionMesh)

      component.shadowMesh.set(shadowMesh)
      component.occlusionMesh.set(occlusionMesh)
      component.placementHelper.set(placementHelper)

      return () => {
        removeObjectFromGroup(entity, shadowMesh)
        removeObjectFromGroup(entity, occlusionMesh)

        component.shadowMesh.set(none)
        component.occlusionMesh.set(none)
        component.placementHelper.set(none)
      }
    }, [component.plane])

    useEffect(() => {
      const shadowMesh = component.shadowMesh.value
      const occlusionMesh = component.occlusionMesh.value
      const geometry = component.geometry.value

      const setGeometry = (mesh: Mesh) => {
        if (mesh.geometry) mesh.geometry = geometry
      }

      shadowMesh.traverse(setGeometry)
      occlusionMesh.traverse(setGeometry)

      return () => {
        geometry.dispose()
      }
    }, [component.geometry])

    useEffect(() => {
      const placementHelper = component.placementHelper.value
      placementHelper.visible = scenePlacementMode.value === 'placing'
    }, [scenePlacementMode])

    return null
  },

  createGeometryFromPolygon: (plane: XRPlane) => {
    const geometry = new BufferGeometry()
    const polygon = plane.polygon

    const vertices = [] as number[]
    const uvs = [] as number[]

    for (const point of polygon) {
      vertices.push(point.x, point.y, point.z)
      uvs.push(point.x, point.z)
    }

    const indices = [] as number[]
    for (let i = 2; i < polygon.length; ++i) {
      indices.push(0, i - 1, i)
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
  },

  updatePlaneGeometry: (entity: Entity, plane: XRPlane) => {
    XRDetectedPlaneComponent.planesLastChangedTimes.set(plane, plane.lastChangedTime)
    const geometry = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
    getMutableComponent(entity, XRDetectedPlaneComponent).geometry.set(geometry)
  },

  updatePlanePose: (entity: Entity, plane: XRPlane) => {
    const planePose = getState(XRState).xrFrame!.getPose(plane.planeSpace, ReferenceSpace.localFloor!)!
    if (!planePose) return
    TransformComponent.position.x[entity] = planePose.transform.position.x
    TransformComponent.position.y[entity] = planePose.transform.position.y
    TransformComponent.position.z[entity] = planePose.transform.position.z
    TransformComponent.rotation.x[entity] = planePose.transform.orientation.x
    TransformComponent.rotation.y[entity] = planePose.transform.orientation.y
    TransformComponent.rotation.z[entity] = planePose.transform.orientation.z
    TransformComponent.rotation.w[entity] = planePose.transform.orientation.w
  },

  foundPlane: (plane: XRPlane) => {
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
    setComponent(entity, TransformComponent)
    setVisibleComponent(entity, true)
    setComponent(entity, XRDetectedPlaneComponent)
    setComponent(entity, NameComponent, 'plane-' + planeId++)

    XRDetectedPlaneComponent.planesLastChangedTimes.set(plane, plane.lastChangedTime)
    XRDetectedPlaneComponent.updatePlanePose(entity, plane)

    setComponent(entity, XRDetectedPlaneComponent, { plane })

    XRDetectedPlaneComponent.detectedPlanesMap.set(plane, entity)
  },
  detectedPlanesMap: new Map<XRPlane, Entity>(),
  planesLastChangedTimes: new Map<XRPlane, number>()
})

let planeId = 0
