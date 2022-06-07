import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { LifecycleValue } from '@xrengine/engine/src/common/enums/LifecycleValue'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput'
import { GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@xrengine/engine/src/xrui/functions/createTransitionState'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { TransitionFunctions } from '@xrengine/engine/src/xrui/functions/TransitionFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createMainMenuButtonsView } from './ui/MainMenuButtons'

export default async function MainMenuButtonsSystem(world: World) {
  const ui = createMainMenuButtonsView()
  const transitionPeriodSeconds = 1

  addComponent(ui.entity, PersistTagComponent, {})

  ui.state.showButtons.set(MainMenuButtonState.showButtons.value)

  AvatarInputSchema.inputMap.set(GamepadButtons.X, BaseInput.TOGGLE_MENU_BUTTONS)
  AvatarInputSchema.inputMap.set('Escape', BaseInput.TOGGLE_MENU_BUTTONS)
  AvatarInputSchema.behaviorMap.set(BaseInput.TOGGLE_MENU_BUTTONS, (entity, inputKey, inputValue) => {
    if (inputValue.lifecycleState !== LifecycleValue.Started) return
    const mainMenuButtonsXRUI = getComponent(ui.entity, XRUIComponent)

    if (mainMenuButtonsXRUI) {
      MainMenuButtonState.showButtons.set(inputKey === 'Escape' ? false : !MainMenuButtonState.showButtons.value)
    }
  })

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      ObjectFitFunctions.attachObjectToHand(xrui.container, 1, 0.1)

      TransitionFunctions.changeOpacityOfRootLayer(
        world,
        ui,
        xrui,
        transitionPeriodSeconds,
        MainMenuButtonState.showButtons.value
      )
    }
  }
}
