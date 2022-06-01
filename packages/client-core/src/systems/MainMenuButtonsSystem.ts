import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { XRHandsInputComponent } from '@xrengine/engine/src/xr/components/XRHandsInputComponent'
import { XRInputSourceComponent } from '@xrengine/engine/src/xr/components/XRInputSourceComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

import { createMainMenuButtonsView } from './ui/MainMenuButtons'

export const renderMainMenuButtons = (world: World, show: Boolean, contextMenuEntity: Entity) => {
  const userEntity = world.getUserAvatarEntity(Engine.instance.userId)
  if (!userEntity) return

  const contextMenuXRUI = getComponent(contextMenuEntity, XRUIComponent)
  if (!contextMenuXRUI) return
}

export default async function MainMenuButtonsSystem(world: World) {
  const MainMenuButtonsUI = createMainMenuButtonsView()
  const userQuery = defineQuery([
    AvatarComponent,
    NetworkObjectComponent,
    XRInputSourceComponent,
    XRHandsInputComponent
  ])

  return () => {
    matchActionOnce(WorldNetworkAction.spawnAvatar.matches, (spawnAction) => {
      if ((spawnAction as any).$from === Engine.instance.userId) {
        for (const userEntity of userQuery()) {
          const userId = getComponent(userEntity, NetworkObjectComponent).ownerId

          if (userId === Engine.instance.userId) {
            AvatarInputSchema.behaviorMap.set(BaseInput.TOGGLE_MENU_BUTTONS, () => {
              renderMainMenuButtons(world, MainMenuButtonsUI.state.id.value !== '', MainMenuButtonsUI.entity)
            })
          }
        }
      }
    })
  }
}
