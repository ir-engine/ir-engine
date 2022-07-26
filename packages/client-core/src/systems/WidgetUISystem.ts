import { isDev } from '@xrengine/common/src/utils/isDev'
import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { LifecycleValue } from '@xrengine/engine/src/common/enums/LifecycleValue'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput'
import { GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import {
  accessWidgetAppState,
  WidgetAppActions,
  WidgetAppServiceReceptor
} from '@xrengine/engine/src/xrui/WidgetAppService'
import { addActionReceptor, dispatchAction } from '@xrengine/hyperflux'

import { createAdminControlsMenuWidget } from './createAdminControlsMenuWidget'
import { createChatWidget } from './createChatWidget'
import { createEmoteWidget } from './createEmoteWidget'
import { createLocationMenuWidget } from './createLocationMenuWidget'
import { createMediaSessionMenuWidget } from './createMediaSessionMenuWidget'
import { createProfileWidget } from './createProfileWidget'
import { createReadyPlayerWidget } from './createReadyPlayerWidget'
import { createSelectAvatarWidget } from './createSelectAvatarWidget'
import { createSettingsWidget } from './createSettingsWidget'
import { createShareLocationWidget } from './createShareLocationWidget'
import { createSocialsMenuWidget } from './createSocialsMenuWidget'
import { createUploadAvatarWidget } from './createUploadAvatarWidget'
import { createWidgetButtonsView } from './ui/WidgetMenuView'

export default async function WidgetSystem(world: World) {
  const ui = createWidgetButtonsView()
  const xrui = getComponent(ui.entity, XRUIComponent)
  ObjectFitFunctions.setUIVisible(xrui.container, false)

  addComponent(ui.entity, PersistTagComponent, true)
  addComponent(ui.entity, NameComponent, { name: 'widget_menu' })

  // lazily create XRUI widgets to speed up initial page loading time
  let createdWidgets = false
  const showWidgetMenu = (show: boolean) => {
    // temporarily only allow widgets on non hmd for local dev
    if (!createdWidgets && (Engine.instance.isHMD || isDev)) {
      createdWidgets = true
      createProfileWidget(world)
      createSettingsWidget(world)
      createSocialsMenuWidget(world)
      createLocationMenuWidget(world)
      createAdminControlsMenuWidget(world)
      createMediaSessionMenuWidget(world)
      createEmoteWidget(world)
      createChatWidget(world)
      createShareLocationWidget(world)
      createSelectAvatarWidget(world)
      createUploadAvatarWidget(world)
      // TODO: Something in createReadyPlayerWidget is loading /location/undefined
      // This is causing the engine to be created again, or at least to start being
      // created again, which is not right. This will need to be fixed when this is
      // restored.
      // createReadyPlayerWidget(world)
    }
    const xrui = getComponent(ui.entity, XRUIComponent)
    ObjectFitFunctions.setUIVisible(xrui.container, show)
  }

  const toggleWidgetsMenu = () => {
    const state = accessWidgetAppState().widgets.value
    const openWidget = Object.entries(state).find(([id, widget]) => widget.visible)
    if (openWidget) {
      dispatchAction(WidgetAppActions.showWidget({ id: openWidget[0], shown: false }))
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: true }))
    } else {
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: !accessWidgetAppState().widgetsMenuOpen.value }))
    }
  }

  AvatarInputSchema.inputMap.set(GamepadButtons.X, BaseInput.TOGGLE_MENU_BUTTONS)
  // add escape key for local testing until we migrate fully with new interface story #6425
  if (isDev && !Engine.instance.isHMD) AvatarInputSchema.inputMap.set('Escape', BaseInput.TOGGLE_MENU_BUTTONS)

  AvatarInputSchema.behaviorMap.set(BaseInput.TOGGLE_MENU_BUTTONS, (entity, inputKey, inputValue) => {
    if (inputValue.lifecycleState !== LifecycleValue.Started) return
    toggleWidgetsMenu()
  })

  function WidgetReceptor(action) {
    matches(action).when(WidgetAppActions.showWidget.matches, (action) => {
      const widget = Engine.instance.currentWorld.widgets.get(action.id)!
      const xrui = getComponent(widget.ui.entity, XRUIComponent)
      ObjectFitFunctions.setUIVisible(xrui.container, action.shown)
    })
  }
  addActionReceptor(WidgetAppServiceReceptor)
  addActionReceptor(WidgetReceptor)

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    ObjectFitFunctions.attachObjectToPreferredTransform(xrui.container)

    showWidgetMenu(accessWidgetAppState().widgetsMenuOpen.value)

    const widgetState = accessWidgetAppState()

    for (const [id, widget] of world.widgets) {
      const widgetVisible = widgetState.widgets[id].ornull?.visible.value
      if (widgetVisible) {
        const widgetUI = getComponent(widget.ui.entity, XRUIComponent)
        ObjectFitFunctions.attachObjectToPreferredTransform(widgetUI.container)
        widget.system()
      }
    }
  }
}
