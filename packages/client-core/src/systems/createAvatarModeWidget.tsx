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
import { Vector3 } from 'three'

import { getComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { dispatchAction, getMutableState, getState, startReactor, useHookstate } from '@etherealengine/hyperflux'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import { WidgetAppActions } from '@etherealengine/spatial/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@etherealengine/spatial/src/xrui/Widgets'

import { Engine, EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { teleportAvatar } from '@etherealengine/engine/src/avatar/functions/moveAvatar'
import { respawnAvatar } from '@etherealengine/engine/src/avatar/functions/respawnAvatar'
import { EntityNetworkState } from '@etherealengine/network'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { EntityTreeComponent, iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { computeTransformMatrix } from '@etherealengine/spatial/src/transform/systems/TransformSystem'

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
      if (currentParent === getState(EngineState).localFloorEntity) {
        getMutableState(XRState).avatarCameraMode.set('auto')
        const uuid = Engine.instance.userID as any as EntityUUID
        const parentUUID = getState(EntityNetworkState)[uuid].parentUUID
        const parentEntity = UUIDComponent.getEntityByUUID(parentUUID)
        setComponent(avatarEntity, EntityTreeComponent, { parentEntity })
        respawnAvatar(avatarEntity)
        iterateEntityNode(avatarEntity, computeTransformMatrix)
      } else {
        getMutableState(XRState).avatarCameraMode.set('attached')
        setComponent(avatarEntity, EntityTreeComponent, { parentEntity: getState(EngineState).localFloorEntity })
        teleportAvatar(avatarEntity, new Vector3(), true)
        iterateEntityNode(avatarEntity, computeTransformMatrix)
      }
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: false }))
    }
  }

  /** for testing */
  globalThis.toggle = widget.onOpen

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
