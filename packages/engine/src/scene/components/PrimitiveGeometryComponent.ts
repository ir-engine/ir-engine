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

import { useEffect } from 'react'
import {
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  Mesh,
  MeshLambertMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry
} from 'three'

import { defineComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { Geometry } from '@etherealengine/engine/src/assets/constants/Geometry'
import { NO_PROXY, useState } from '@etherealengine/hyperflux'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { GeometryTypeEnum } from '../constants/GeometryTypeEnum'

export const PrimitiveGeometryComponent = defineComponent({
  name: 'PrimitiveGeometryComponent',
  jsonID: 'primitive-geometry',

  onInit: (entity) => {
    return {
      geometryType: GeometryTypeEnum.BoxGeometry as GeometryTypeEnum,
      geometry: null! as Geometry,
      geometryParams: null! as Record<string, any>
    }
  },

  toJSON: (entity, component) => {
    return {
      geometryType: component.geometryType.value,
      geometryParams: component.geometryParams.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.geometryType === 'number') component.geometryType.set(json.geometryType)
    if (typeof json.geometryParams === 'object') component.geometryParams.set(json.geometryParams)
  },

  onRemove: (entity, component) => {
    if (component.geometry.value) {
      component.geometry.value.dispose()
    }
  },

  reactor: GeometryReactor
})

function GeometryReactor() {
  const entity = useEntityContext()
  const geometryComponent = useComponent(entity, PrimitiveGeometryComponent)
  const transform = useComponent(entity, TransformComponent)
  const mesh = useState<Mesh>(new Mesh())

  function areKeysDifferentTypes(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
    if (!obj1 || !obj2) {
      return true
    }
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
      return true // Objects have different numbers of keys
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return true // Objects have different keys
      }

      if (typeof obj1[key] !== typeof obj2[key]) {
        return true // Keys have different types
      }
    }

    return false // Objects have the same keys with the same types
  }

  function createGeometry(geometryType: new (...args: any[]) => Geometry, params: Record<string, any>): Geometry {
    const argList = params ? Object.values(params) : null
    let currGeometry = new geometryType()
    if (areKeysDifferentTypes(params, (currGeometry as any).parameters)) {
      geometryComponent.geometryParams.set((currGeometry as any).parameters)
      return currGeometry
    }
    currGeometry.dispose()
    currGeometry = argList ? new geometryType(...argList) : new geometryType()
    return currGeometry
  }
  useEffect(() => {
    geometryComponent.geometry.set(new BoxGeometry()) // set default geometry
    const material = new MeshLambertMaterial() // set material later
    mesh.set(new Mesh(geometryComponent.geometry.value, material))
    mesh.value.name = `${entity}-primitive-geometry`
    mesh.value.visible = true
    mesh.value.updateMatrixWorld(true)
    addObjectToGroup(entity, mesh.value)
    setObjectLayers(mesh.value, ObjectLayers.Scene)

    return () => {
      removeObjectFromGroup(entity, mesh.value)
    }
  }, [])

  useEffect(() => {
    if (!mesh) return
    mesh.value.geometry = geometryComponent.geometry.get(NO_PROXY)
  }, [geometryComponent.geometry])

  useEffect(() => {
    const params = geometryComponent.geometryParams.get(NO_PROXY)
    let currentGeometry: Geometry
    // can we get the params for a geometry type before its initialized? that would simplify this
    // can we make the GeometryTypeEnum, contain the typeof geometry? that would simplify this switch case into a single line
    switch (geometryComponent.geometryType.value) {
      case GeometryTypeEnum.BoxGeometry:
        currentGeometry = createGeometry(BoxGeometry, params)
        break
      case GeometryTypeEnum.SphereGeometry:
        currentGeometry = createGeometry(SphereGeometry, params)
        break
      case GeometryTypeEnum.CylinderGeometry:
        currentGeometry = createGeometry(CylinderGeometry, params)
        break
      case GeometryTypeEnum.CapsuleGeometry:
        currentGeometry = createGeometry(CapsuleGeometry, params)
        break
      case GeometryTypeEnum.PlaneGeometry:
        currentGeometry = createGeometry(PlaneGeometry, params)
        break
      case GeometryTypeEnum.CircleGeometry:
        currentGeometry = createGeometry(CircleGeometry, params)
        break
      case GeometryTypeEnum.RingGeometry:
        currentGeometry = createGeometry(RingGeometry, params)
        break
      case GeometryTypeEnum.TorusGeometry:
        currentGeometry = createGeometry(TorusGeometry, params)
        break
      case GeometryTypeEnum.TorusKnotGeometry:
        currentGeometry = createGeometry(TorusKnotGeometry, params)
        break
      case GeometryTypeEnum.DodecahedronGeometry:
        currentGeometry = createGeometry(DodecahedronGeometry, params)
        break
      case GeometryTypeEnum.IcosahedronGeometry:
        currentGeometry = createGeometry(IcosahedronGeometry, params)
        break
      case GeometryTypeEnum.OctahedronGeometry:
        currentGeometry = createGeometry(OctahedronGeometry, params)
        break
      case GeometryTypeEnum.TetrahedronGeometry:
        currentGeometry = createGeometry(TetrahedronGeometry, params)
        break
      default:
        return
    }
    geometryComponent.geometry.set(currentGeometry)
    // change the geometry on the model
  }, [geometryComponent.geometryType, geometryComponent.geometryParams])
  return null
}
