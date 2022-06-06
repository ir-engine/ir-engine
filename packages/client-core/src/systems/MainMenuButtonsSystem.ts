import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { LifecycleValue } from '@xrengine/engine/src/common/enums/LifecycleValue'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput'
import { GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createMainMenuButtonsView } from './ui/MainMenuButtons'

export default async function MainMenuButtonsSystem(world: World) {
  const MainMenuButtonsUI = createMainMenuButtonsView()
  MainMenuButtonsUI.state.showButtons.set(MainMenuButtonState.showButtons.value)

  AvatarInputSchema.inputMap.set(GamepadButtons.X, BaseInput.TOGGLE_MENU_BUTTONS)
  AvatarInputSchema.inputMap.set('Escape', BaseInput.TOGGLE_MENU_BUTTONS)
  AvatarInputSchema.behaviorMap.set(BaseInput.TOGGLE_MENU_BUTTONS, (entity, inputKey, inputValue) => {
    if (inputValue.lifecycleState !== LifecycleValue.Started) return
    const mainMenuButtonsXRUI = getComponent(MainMenuButtonsUI.entity, XRUIComponent)
    if (mainMenuButtonsXRUI) mainMenuButtonsXRUI.container.visible = MainMenuButtonsUI.state.showButtons.value
  })

  return () => {
    const mainMenuButtonsXRUI = getComponent(MainMenuButtonsUI.entity, XRUIComponent)

    if (mainMenuButtonsXRUI) {
      ObjectFitFunctions.attachObjectToHand(mainMenuButtonsXRUI.container, 1, 0.1)
    }
  }
}
