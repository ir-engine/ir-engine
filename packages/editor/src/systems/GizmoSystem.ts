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

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineQuery, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { TransformGizmoComponent } from '@etherealengine/engine/src/scene/components/TransformGizmo'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

const GIZMO_SIZE = 10

const gizmoQuery = defineQuery([TransformGizmoComponent])

const execute = () => {
  for (const entity of gizmoQuery()) {
    const gizmoTransform = getComponent(entity, TransformComponent)
    const eyeDistance =
      gizmoTransform.position.distanceTo(getComponent(Engine.instance.cameraEntity, CameraComponent).position) /
      GIZMO_SIZE
    gizmoTransform.scale.set(eyeDistance, eyeDistance, eyeDistance)
  }
}

export const GizmoSystem = defineSystem({
  uuid: 'ee.editor.GizmoSystem',
  execute
})
