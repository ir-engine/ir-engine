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

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { CameraGizmoComponent } from '../classes/gizmo/camera/CameraGizmoComponent'
import { controlUpdate, gizmoUpdate } from '../functions/cameraGizmoHelper'

export const cameraGizmoQuery = defineQuery([CameraGizmoComponent])

const execute = () => {
  for (const cameraGizmoEntity of cameraGizmoQuery()) {
    const cameraGizmoComponent = getComponent(cameraGizmoEntity, CameraGizmoComponent)
    if (!cameraGizmoComponent.enabled || !cameraGizmoComponent.visualEntity) return
    gizmoUpdate(cameraGizmoEntity)
    controlUpdate(cameraGizmoEntity)
  }
}

export const CameraGizmoSystem = defineSystem({
  uuid: 'ee.editor.CameraGizmoSystem',
  insert: { with: AnimationSystemGroup },
  execute
})
