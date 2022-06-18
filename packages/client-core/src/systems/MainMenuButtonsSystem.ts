import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { LifecycleValue } from '@xrengine/engine/src/common/enums/LifecycleValue'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput'
import { GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { WidgetAppServiceReceptor } from '@xrengine/engine/src/xrui/WidgetAppService'
import { addActionReceptor } from '@xrengine/hyperflux'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createMainMenuButtonsView } from './ui/MainMenuButtons'

// TODO: rename this to WidgetMenuSystem #6364

export default async function MainMenuButtonsSystem(world: World) {
  const ui = createMainMenuButtonsView()

  addComponent(ui.entity, PersistTagComponent, {})

  AvatarInputSchema.inputMap.set(GamepadButtons.X, BaseInput.TOGGLE_MENU_BUTTONS)
  AvatarInputSchema.inputMap.set('Escape', BaseInput.HIDE_MENU_BUTTONS)
  AvatarInputSchema.behaviorMap.set(BaseInput.TOGGLE_MENU_BUTTONS, (entity, inputKey, inputValue) => {
    if (inputValue.lifecycleState !== LifecycleValue.Started) return
    const mainMenuButtonsXRUI = getComponent(ui.entity, XRUIComponent)

    if (mainMenuButtonsXRUI) {
      MainMenuButtonState.showButtons.set(!MainMenuButtonState.showButtons.value)
    }
  })

  addActionReceptor(WidgetAppServiceReceptor)

  AvatarInputSchema.behaviorMap.set(BaseInput.HIDE_MENU_BUTTONS, (entity, inputKey, inputValue) => {
    if (inputValue.lifecycleState !== LifecycleValue.Started) return
    const mainMenuButtonsXRUI = getComponent(ui.entity, XRUIComponent)

    if (mainMenuButtonsXRUI) {
      MainMenuButtonState.showButtons.set(!MainMenuButtonState.showButtons.value)
      // MainMenuButtonState.showButtons.set(false)
    }
  })

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      ObjectFitFunctions.attachObjectToPreferredTransform(xrui.container)
      ObjectFitFunctions.changeVisibilityOfRootLayer(xrui.container, MainMenuButtonState.showButtons.value)
    }
  }
}
