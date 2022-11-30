import { Quaternion, Vector3 } from 'three'

import config from '@xrengine/common/src/config'
import { isDev } from '@xrengine/common/src/config'
import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { V_001, V_010, V_100 } from '@xrengine/engine/src/common/constants/MathConstants'
import { LifecycleValue } from '@xrengine/engine/src/common/enums/LifecycleValue'
import { isHMD } from '@xrengine/engine/src/common/functions/isMobile'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent, VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import {
  LocalTransformComponent,
  setLocalTransformComponent
} from '@xrengine/engine/src/transform/components/TransformComponent'
import { XRControllerComponent } from '@xrengine/engine/src/xr/XRComponents'
import { getPreferredControllerEntity } from '@xrengine/engine/src/xr/XRState'
import { XRUIComponent, XRUIInteractableComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { WidgetAppActions, WidgetAppServiceReceptor, WidgetAppState } from '@xrengine/engine/src/xrui/WidgetAppService'
import { addActionReceptor, createActionQueue, dispatchAction, getState, removeActionQueue } from '@xrengine/hyperflux'

import { createAnchorWidget } from './createAnchorWidget'
// import { createAdminControlsMenuWidget } from './createAdminControlsMenuWidget'
// import { createChatWidget } from './createChatWidget'
// import { createEmoteWidget } from './createEmoteWidget'
// import { createLocationMenuWidget } from './createLocationMenuWidget'
// import { createMediaSessionMenuWidget } from './createMediaSessionMenuWidget'
// import { createProfileWidget } from './createProfileWidget'
// import { createReadyPlayerWidget } from './createReadyPlayerWidget'
// import { createSelectAvatarWidget } from './createSelectAvatarWidget'
// import { createSettingsWidget } from './createSettingsWidget'
// import { createShareLocationWidget } from './createShareLocationWidget'
// import { createSocialsMenuWidget } from './createSocialsMenuWidget'
// import { createUploadAvatarWidget } from './createUploadAvatarWidget'
import { createWidgetButtonsView } from './ui/WidgetMenuView'

const widgetRotation = new Quaternion()
  .setFromAxisAngle(V_010, Math.PI * 0.5)
  .multiply(new Quaternion().setFromAxisAngle(V_001, -Math.PI * 0.5))

export const WidgetInput = {
  TOGGLE_MENU_BUTTONS: 'WidgetInput_TOGGLE_MENU_BUTTONS' as const
}
export default async function WidgetSystem(world: World) {
  const widgetMenuUI = createWidgetButtonsView()
  setComponent(widgetMenuUI.entity, XRUIInteractableComponent)
  removeComponent(widgetMenuUI.entity, VisibleComponent)

  addComponent(widgetMenuUI.entity, NameComponent, 'widget_menu')

  const widgetState = getState(WidgetAppState)

  // lazily create XRUI widgets to speed up initial page loading time
  let createdWidgets = false
  const showWidgetMenu = (show: boolean) => {
    // temporarily only allow widgets on non hmd for local dev
    if (!createdWidgets && (isHMD || isDev)) {
      createdWidgets = true
      createAnchorWidget(world)
      // createProfileWidget(world)
      // createSettingsWidget(world)
      // createSocialsMenuWidget(world)
      // createLocationMenuWidget(world)
      // createAdminControlsMenuWidget(world)
      // createMediaSessionMenuWidget(world)
      // createEmoteWidget(world)
      // createChatWidget(world)
      // createShareLocationWidget(world)
      // createSelectAvatarWidget(world)
      // createUploadAvatarWidget(world)

      // TODO: Something in createReadyPlayerWidget is loading /location/undefined
      // This is causing the engine to be created again, or at least to start being
      // created again, which is not right. This will need to be fixed when this is
      // restored.
      // createReadyPlayerWidget(world)
    }
  }

  const toggleWidgetsMenu = () => {
    const state = widgetState.widgets.value
    const openWidget = Object.entries(state).find(([id, widget]) => widget.visible)
    if (openWidget) {
      dispatchAction(WidgetAppActions.showWidget({ id: openWidget[0], shown: false }))
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: true }))
    } else {
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: !widgetState.widgetsMenuOpen.value }))
    }
  }

  AvatarInputSchema.inputMap.set(GamepadButtons.X, WidgetInput.TOGGLE_MENU_BUTTONS)
  // add escape key for local testing until we migrate fully with new interface story #6425
  if (isDev && !isHMD) AvatarInputSchema.inputMap.set('Escape', WidgetInput.TOGGLE_MENU_BUTTONS)

  AvatarInputSchema.behaviorMap.set(WidgetInput.TOGGLE_MENU_BUTTONS, (entity, inputKey, inputValue) => {
    if (inputValue.lifecycleState !== LifecycleValue.Started) return
    toggleWidgetsMenu()
  })

  addActionReceptor(WidgetAppServiceReceptor)

  const showWidgetQueue = createActionQueue(WidgetAppActions.showWidget.matches)
  const registerWidgetQueue = createActionQueue(WidgetAppActions.registerWidget.matches)
  const unregisterWidgetQueue = createActionQueue(WidgetAppActions.unregisterWidget.matches)

  const execute = () => {
    for (const action of showWidgetQueue()) {
      const widget = Engine.instance.currentWorld.widgets.get(action.id)!
      setVisibleComponent(widget.ui.entity, action.shown)
      if (action.shown) {
        if (typeof widget.onOpen === 'function') widget.onOpen()
      } else if (typeof widget.onClose === 'function') widget.onClose()
    }
    for (const action of registerWidgetQueue()) {
      const widget = Engine.instance.currentWorld.widgets.get(action.id)!
      setLocalTransformComponent(widget.ui.entity, widgetMenuUI.entity)
    }
    for (const action of unregisterWidgetQueue()) {
      const widget = Engine.instance.currentWorld.widgets.get(action.id)!
      removeComponent(widget.ui.entity, LocalTransformComponent)
      if (typeof widget.cleanup === 'function') widget.cleanup()
    }

    const controllerEntity = getPreferredControllerEntity(true)

    if (hasComponent(widgetMenuUI.entity, LocalTransformComponent) && !controllerEntity)
      removeComponent(widgetMenuUI.entity, LocalTransformComponent)

    if (!hasComponent(widgetMenuUI.entity, LocalTransformComponent) && controllerEntity) {
      const controllerGripEntity = getComponent(controllerEntity, XRControllerComponent)?.grip
      if (controllerGripEntity)
        setLocalTransformComponent(
          widgetMenuUI.entity,
          controllerGripEntity,
          new Vector3(0.05, 0, -0.02),
          widgetRotation.clone()
        )
    }

    const widgetMenuShown = !!controllerEntity && widgetState.widgetsMenuOpen.value
    showWidgetMenu(widgetMenuShown)
    setVisibleComponent(widgetMenuUI.entity, widgetMenuShown)

    for (const [id, widget] of world.widgets) {
      const widgetEnabled = widgetState.widgets[id].ornull?.enabled.value
      if (widgetEnabled && typeof widget.system === 'function') {
        widget.system()
      }
    }
  }

  const cleanup = async () => {
    removeActionQueue(showWidgetQueue)
    removeEntity(widgetMenuUI.entity)
    if (AvatarInputSchema.inputMap.get(GamepadButtons.X) === WidgetInput.TOGGLE_MENU_BUTTONS)
      AvatarInputSchema.inputMap.delete(GamepadButtons.X)
    if (AvatarInputSchema.inputMap.get('Escape') === WidgetInput.TOGGLE_MENU_BUTTONS)
      AvatarInputSchema.inputMap.delete('Escape')
    AvatarInputSchema.behaviorMap.delete(WidgetInput.TOGGLE_MENU_BUTTONS)
  }

  return { execute, cleanup }
}
