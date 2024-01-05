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
  ArrowHelper,
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'

import { useEffect } from 'react'

import { V_010 } from '../../common/constants/MathConstants'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

const ARC_SEGMENTS = 200
const _point = new Vector3()
const lineGeometry = new BufferGeometry()
lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))

export const SplineComponent = defineComponent({
  name: 'SplineComponent',
  jsonID: 'spline',

  onInit: (entity) => {
    return {
      elements: [
        { position: new Vector3(-1, 0, -1), quaternion: new Quaternion() },
        {
          position: new Vector3(1, 0, -1),
          quaternion: new Quaternion().setFromAxisAngle(V_010, Math.PI / 2)
        },
        {
          position: new Vector3(1, 0, 1),
          quaternion: new Quaternion().setFromAxisAngle(V_010, Math.PI)
        },
        {
          position: new Vector3(-1, 0, 1),
          quaternion: new Quaternion().setFromAxisAngle(V_010, (3 * Math.PI) / 2)
        }
      ] as Array<{
        position: Vector3
        quaternion: Quaternion
      }>,
      // internal
      curve: new CatmullRomCurve3([], true)
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    json.elements &&
      component.elements.set(
        json.elements.map((e) => ({
          position: new Vector3().copy(e.position),
          quaternion: new Quaternion().copy(e.quaternion)
        }))
      )
  },

  toJSON: (entity, component) => {
    return { elements: component.elements.get({ noproxy: true }) }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineComponent)
    const elements = component.elements

    useEffect(() => {
      if (elements.length < 3) {
        component.curve.set(new CatmullRomCurve3([], true))
        return
      }

      const line = new Line(lineGeometry.clone(), new LineBasicMaterial({ color: 0xff0000, opacity: 0.35 }))
      line.layers.set(ObjectLayers.NodeHelper)
      line.name = `${entity}-line`
      addObjectToGroup(entity, line)
      setObjectLayers(line, ObjectLayers.NodeHelper)

      const geometry = new SphereGeometry(0.05, 4, 2)

      if (elements.length > 0) {
        const first = elements[0].value
        const sphere = new Mesh(geometry, new MeshBasicMaterial({ color: 'lightgreen', opacity: 0.2 }))
        setObjectLayers(sphere, ObjectLayers.NodeHelper)
        sphere.position.copy(first.position)
        sphere.updateMatrixWorld(true)
        line.add(sphere)
      }

      if (elements.length > 1) {
        const last = elements[elements.length - 1].value
        const sphere = new Mesh(geometry, new MeshBasicMaterial({ color: 'red', opacity: 0.2 }))
        setObjectLayers(sphere, ObjectLayers.NodeHelper)
        sphere.position.copy(last.position)
        sphere.updateMatrixWorld(true)
        line.add(sphere)
      }

      let id = 0
      for (const elem of elements.value) {
        const gizmo = new AxesHelper()
        gizmo.name = `${entity}-gizmos-${++id}`
        gizmo.add(new ArrowHelper(undefined, undefined, undefined, new Color('blue')))
        setObjectLayers(gizmo, ObjectLayers.NodeHelper)
        gizmo.position.copy(elem.position)
        gizmo.quaternion.copy(elem.quaternion)
        gizmo.updateMatrixWorld(true)
        line.add(gizmo)
      }

      const curve = new CatmullRomCurve3(
        elements.value.map((e) => e.position),
        true
      )
      curve.curveType = 'catmullrom'
      const positions = line.geometry.attributes.position
      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1)
        curve.getPoint(t, _point)
        positions.setXYZ(i, _point.x, _point.y, _point.z)
      }
      positions.needsUpdate = true
      line.visible = true

      component.curve.set(curve)

      return () => {
        line.children.forEach((child) => line.remove(child))
        removeObjectFromGroup(entity, line)
      }
    }, [
      elements.length,
      // force a unique dep change upon any position or quaternion change
      elements.value.map((e) => `${JSON.stringify(e.position)}${JSON.stringify(e.quaternion)})`).join('')
    ])

    return null
  }
})
