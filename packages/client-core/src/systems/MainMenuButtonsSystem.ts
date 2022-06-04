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

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createMainMenuButtonsView } from './ui/MainMenuButtons'

export const renderMainMenuButtons = (world: World, show: Boolean, mainMenuEntity: Entity) => {
  const userEntity = world.getUserAvatarEntity(Engine.instance.userId)
  if (!userEntity) return

  const userComponent = getComponent(userEntity, XRHandsInputComponent)
  const mainMenuButtonsXRUI = getComponent(mainMenuEntity, XRUIComponent)

  if (mainMenuButtonsXRUI && userComponent) {
    const container = mainMenuButtonsXRUI.container

    const el = container.containerElement as HTMLElement
    el.style.visibility = show ? 'visible' : 'hidden'

    container.position.set(
      userComponent.left.wrist.position.x,
      userComponent.left.wrist.position.y,
      userComponent.left.wrist.position.z
    )
    container.quaternion.set(
      userComponent.left.wrist.quaternion.x,
      userComponent.left.wrist.quaternion.y,
      userComponent.left.wrist.quaternion.z,
      userComponent.left.wrist.quaternion.w
    )
    container.scale.setScalar(0.5)
    container.matrix
      .compose(container.position, container.quaternion, container.scale)
      .premultiply(Engine.instance.currentWorld.camera.matrixWorld)
    container.matrix.decompose(container.position, container.quaternion, container.scale)
  }
}

export default async function MainMenuButtonsSystem(world: World) {
  const MainMenuButtonsUI = createMainMenuButtonsView()
  const userQuery = defineQuery([
    AvatarComponent,
    NetworkObjectComponent,
    XRInputSourceComponent,
    XRHandsInputComponent
  ])

  MainMenuButtonsUI.state.showButtons.set(MainMenuButtonState.showButtons.value)

  return () => {
    matchActionOnce(WorldNetworkAction.spawnAvatar.matches, (spawnAction) => {
      if ((spawnAction as any).$from === Engine.instance.userId) {
        for (const userEntity of userQuery()) {
          const userId = getComponent(userEntity, NetworkObjectComponent).ownerId

          if (userId === Engine.instance.userId) {
            AvatarInputSchema.behaviorMap.set(BaseInput.TOGGLE_MENU_BUTTONS, () => {
              MainMenuButtonState.showButtons.set(!MainMenuButtonState.showButtons)
              renderMainMenuButtons(world, MainMenuButtonsUI.state.showButtons.value, MainMenuButtonsUI.entity)
            })
          }
        }
      }
    })
  }
}
