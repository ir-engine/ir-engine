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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { defineComponent, Easing, Entity, getComponent, S } from '@ir-engine/ecs'
import { Box3, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

const delta = new Vector3()
const focusSize = new Vector3()

const MAX_ZOOM_DISTANCE = 1000

export const CameraOrbitComponent = defineComponent({
  name: 'CameraOrbitComponent',

  jsonID: 'IR_camera_orbit',

  schema: S.Object({
    minimumZoomDistance: S.Number({ default: 0.5 }),
    maximumZoomDistance: S.Number({ default: Infinity }),
    zoomSpeed: S.Number({ default: 0.1 }),
    panSpeed: S.Number({ default: 1 }),
    orbitSpeed: S.Number({ default: 5 }),
    cameraOrbitCenter: T.Vec3()
  }),

  setFocus: (cameraEntity: Entity, center: Vector3, bounds?: Box3) => {
    const cameraOrbit = getComponent(cameraEntity, CameraOrbitComponent)
    const zoom = Math.max(cameraOrbit.minimumZoomDistance * 10, bounds?.getSize(focusSize).length() ?? 0)
    const transform = getComponent(cameraEntity, TransformComponent)
    // cameraOrbit.cameraOrbitCenter.set(center.clone())
    // transform.position.set(center.clone().add(delta))
    delta.set(0, 0, 1).applyQuaternion(transform.rotation).multiplyScalar(Math.min(zoom, MAX_ZOOM_DISTANCE))
    CameraOrbitComponent.setTransition(cameraEntity, 'cameraOrbitCenter', center, {
      duration: 600,
      easing: Easing.sine.inOut
    })
    TransformComponent.setTransition(cameraEntity, 'position', center.clone().add(delta), {
      duration: 600,
      easing: Easing.sine.inOut
    })
  }
})
