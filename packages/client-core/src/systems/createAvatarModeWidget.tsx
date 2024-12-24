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

import { useEffect } from 'react'

import { getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { dispatchAction, getMutableState, getState, startReactor, useHookstate } from '@ir-engine/hyperflux'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { WidgetAppActions } from './WidgetAppService'

import { Engine, EntityTreeComponent, EntityUUID, UUIDComponent, iterateEntityNode } from '@ir-engine/ecs'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { translateAndRotateAvatar, updateLocalAvatarPosition } from '@ir-engine/engine/src/avatar/functions/moveAvatar'
import { respawnAvatar } from '@ir-engine/engine/src/avatar/functions/respawnAvatar'
import { EntityNetworkState } from '@ir-engine/network'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { Quaternion, Vector3 } from 'three'
import { Widget, Widgets } from './Widgets'

export function createAvatarModeWidget() {
  const ui = createXRUI(() => null)
  removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Avatar Mode',
    icon: 'Person',
    onOpen: () => {
      const avatarEntity = AvatarComponent.getSelfAvatarEntity()
      const currentParent = getComponent(avatarEntity, EntityTreeComponent).parentEntity
      if (currentParent === getState(ReferenceSpaceState).localFloorEntity) {
        getMutableState(XRState).avatarCameraMode.set('auto')
        const uuid = Engine.instance.userID as any as EntityUUID
        const parentUUID = getState(EntityNetworkState)[uuid].parentUUID
        const parentEntity = UUIDComponent.getEntityByUUID(parentUUID)
        setComponent(avatarEntity, EntityTreeComponent, { parentEntity })
        respawnAvatar(avatarEntity)
        iterateEntityNode(avatarEntity, computeTransformMatrix)
      } else {
        getMutableState(XRState).avatarCameraMode.set('attached')
        setComponent(avatarEntity, EntityTreeComponent, {
          parentEntity: getState(ReferenceSpaceState).localFloorEntity
        })
        getComponent(avatarEntity, RigidBodyComponent).targetKinematicPosition.set(0, 0, 0) // todo instead fo 0,0,0 make it camera relative to floor entity on the floor (y = 0)
        updateLocalAvatarPosition(avatarEntity)
        translateAndRotateAvatar(avatarEntity, new Vector3(), new Quaternion())
        console.log(
          getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent).position.x,
          getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent).position.y,
          getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent).position.z
        )
        iterateEntityNode(avatarEntity, computeTransformMatrix)
      }
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: false }))
    }
  }

  /** for testing */
  // globalThis.toggle = widget.onOpen

  const id = Widgets.registerWidget(ui.entity, widget)

  const reactor = startReactor(() => {
    const xrState = useHookstate(getMutableState(XRState))
    const isCameraAttachedToAvatar = XRState.useCameraAttachedToAvatar()
    const widgetEnabled =
      xrState.sessionMode.value === 'immersive-ar' &&
      xrState.scenePlacementMode.value === 'placed' &&
      !isCameraAttachedToAvatar

    useEffect(() => {
      dispatchAction(WidgetAppActions.enableWidget({ id, enabled: widgetEnabled }))
    }, [widgetEnabled])

    return null
  })
}
