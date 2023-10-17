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
  Euler,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry
} from 'three'

import { Geometry } from '@etherealengine/engine/src/assets/constants/Geometry'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GeometryTypeEnum } from '../constants/GeometryTypeEnum'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const PrimitiveGeometryComponent = defineComponent({
  name: 'PrimitiveGeometryComponent',
  jsonID: 'primitive-geometry',

  onInit: (entity) => {
    return {
      geometryType: GeometryTypeEnum.BoxGeometry as GeometryTypeEnum,
      geometry: null! as Geometry
    }
  },

  toJSON: (entity, component) => {
    return component.value
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.geometryType === 'number') component.geometryType.set(json.geometryType)
  },

  onRemove: (entity, component) => {
    if (component.value) {
      component.geometry.value.dispose()
    }
  },

  reactor: GeometryReactor
})

function GeometryReactor() {
  const entity = useEntityContext()
  const geometry = useComponent(entity, PrimitiveGeometryComponent)
  const transform = useComponent(entity, TransformComponent)

  useEffect(() => {
    geometry.geometry.set(new BoxGeometry())
    const material = new MeshBasicMaterial({ color: 0xffffff }) // set material later
    const mesh = new Mesh(geometry.geometry.value, material)

    return () => {
      mesh.geometry.dispose()
      removeObjectFromGroup(entity, mesh)
    }
  }, [])

  useEffect(() => {
    const material = new MeshLambertMaterial() // set material later
    const mesh = new Mesh(geometry.geometry.value, material)
    mesh.name = `${entity}-primitive-geometry`
    mesh.visible = true
    mesh.updateMatrixWorld(true)
    setObjectLayers(mesh, ObjectLayers.Scene)
    addObjectToGroup(entity, mesh)
    mesh.position.copy(transform.position.value)
    mesh.rotation.copy(new Euler().setFromQuaternion(transform.rotation.value))
    mesh.scale.copy(transform.scale.value)

    return () => {
      mesh.geometry.dispose()
      removeObjectFromGroup(entity, mesh)
    }
  }, [geometry.geometry])

  useEffect(() => {
    console.log('DEBUG set geometry type')
    switch (geometry.geometryType.value) {
      case GeometryTypeEnum.BoxGeometry:
        geometry.geometry.set(new BoxGeometry())
        break
      case GeometryTypeEnum.SphereGeometry:
        geometry.geometry.set(new SphereGeometry())
        break
      case GeometryTypeEnum.CylinderGeometry:
        geometry.geometry.set(new CylinderGeometry())
        break
      case GeometryTypeEnum.CapsuleGeometry:
        geometry.geometry.set(new CapsuleGeometry())
        break
      case GeometryTypeEnum.PlaneGeometry:
        geometry.geometry.set(new PlaneGeometry())
        break
      case GeometryTypeEnum.CircleGeometry:
        geometry.geometry.set(new CircleGeometry())
        break
      case GeometryTypeEnum.RingGeometry:
        geometry.geometry.set(new RingGeometry())
        break
      case GeometryTypeEnum.TorusGeometry:
        geometry.geometry.set(new TorusGeometry())
        break
      case GeometryTypeEnum.TorusKnotGeometry:
        geometry.geometry.set(new TorusKnotGeometry())
        break
      case GeometryTypeEnum.DodecahedronGeometry:
        geometry.geometry.set(new DodecahedronGeometry())
        break
      case GeometryTypeEnum.IcosahedronGeometry:
        geometry.geometry.set(new IcosahedronGeometry())
        break
      case GeometryTypeEnum.OctahedronGeometry:
        geometry.geometry.set(new OctahedronGeometry())
        break
      case GeometryTypeEnum.TetrahedronGeometry:
        geometry.geometry.set(new TetrahedronGeometry())
        break
      default:
        return
    }
    // change the geometry on the model
  }, [geometry.geometryType])
  return null
}
