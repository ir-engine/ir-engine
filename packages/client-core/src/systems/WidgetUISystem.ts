import { useEffect } from 'react'
import { AxesHelper, Matrix4, Quaternion, Vector3 } from 'three'

import { isDev } from '@etherealengine/common/src/config'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import {
  AvatarInputSettingsAction,
  AvatarInputSettingsState
} from '@etherealengine/engine/src/avatar/state/AvatarInputSettingsState'
import { V_001, V_010, V_111 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { World } from '@etherealengine/engine/src/ecs/classes/World'
import {
  addComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent, VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { setObjectLayers } from '@etherealengine/engine/src/scene/functions/setObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import {
  LocalTransformComponent,
  setLocalTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getPreferredInputSource, isHeadset, ReferenceSpace, XRState } from '@etherealengine/engine/src/xr/XRState'
import { XRUIInteractableComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@etherealengine/engine/src/xrui/functions/ObjectFitFunctions'
import {
  WidgetAppActions,
  WidgetAppServiceReceptor,
  WidgetAppState
} from '@etherealengine/engine/src/xrui/WidgetAppService'
import {
  addActionReceptor,
  createActionQueue,
  dispatchAction,
  getState,
  removeActionQueue,
  startReactor,
  useHookstate
} from '@etherealengine/hyperflux'

import { createAnchorWidget } from './createAnchorWidget'
// import { createHeightAdjustmentWidget } from './createHeightAdjustmentWidget'
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

const widgetLeftMenuGripOffset = new Vector3(0.08, 0, -0.05)
const widgetRightMenuGripOffset = new Vector3(-0.08, 0, -0.05)
const vec3 = new Vector3()

const widgetLeftRotation = new Quaternion()
  .setFromAxisAngle(V_010, Math.PI * 0.5)
  .multiply(new Quaternion().setFromAxisAngle(V_001, -Math.PI * 0.5))

const widgetRightRotation = new Quaternion()
  .setFromAxisAngle(V_010, -Math.PI * 0.5)
  .multiply(new Quaternion().setFromAxisAngle(V_001, Math.PI * 0.5))

export default async function WidgetUISystem(world: World) {
  const widgetMenuUI = createWidgetButtonsView()
  setComponent(widgetMenuUI.entity, XRUIInteractableComponent)
  removeComponent(widgetMenuUI.entity, VisibleComponent)

  addComponent(widgetMenuUI.entity, NameComponent, 'widget_menu')
  const helper = new AxesHelper(0.1)
  setObjectLayers(helper, ObjectLayers.Gizmos)
  addObjectToGroup(widgetMenuUI.entity, helper)

  const widgetState = getState(WidgetAppState)

  // lazily create XRUI widgets to speed up initial page loading time
  let createdWidgets = false
  const showWidgetMenu = (show: boolean) => {
    // temporarily only allow widgets on non hmd for local dev
    if (!createdWidgets && (isHeadset() || isDev)) {
      createdWidgets = true
      createAnchorWidget(world)
      // createHeightAdjustmentWidget(world)
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

  const toggleWidgetsMenu = (handedness?: 'left' | 'right') => {
    const state = widgetState.widgets.value
    const openWidget = Object.entries(state).find(([id, widget]) => widget.visible)
    if (openWidget) {
      dispatchAction(WidgetAppActions.showWidget({ id: openWidget[0], shown: false }))
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: true, handedness }))
    } else {
      if (widgetState.handedness.value !== handedness) {
        dispatchAction(WidgetAppActions.showWidgetMenu({ shown: true, handedness }))
      } else {
        dispatchAction(WidgetAppActions.showWidgetMenu({ shown: !widgetState.widgetsMenuOpen.value, handedness }))
      }
    }
  }

  addActionReceptor(WidgetAppServiceReceptor)

  const showWidgetQueue = createActionQueue(WidgetAppActions.showWidget.matches)
  const registerWidgetQueue = createActionQueue(WidgetAppActions.registerWidget.matches)
  const unregisterWidgetQueue = createActionQueue(WidgetAppActions.unregisterWidget.matches)

  const execute = () => {
    const keys = world.buttons
    if (keys.ButtonX?.down) toggleWidgetsMenu('left')
    if (keys.ButtonA?.down) toggleWidgetsMenu('right')
    /** @todo allow non HMDs to access the widget menu too */
    if ((isDev || isHeadset()) && keys.Escape?.down) toggleWidgetsMenu()

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

    const transform = getComponent(widgetMenuUI.entity, TransformComponent)
    const activeInputSource = Array.from(world.inputSources).find(
      (inputSource) => inputSource.handedness === widgetState.handedness.value
    )

    if (activeInputSource) {
      const referenceSpace = ReferenceSpace.origin!
      const pose = Engine.instance.xrFrame!.getPose(
        activeInputSource.gripSpace ?? activeInputSource.targetRaySpace,
        referenceSpace
      )
      if (hasComponent(widgetMenuUI.entity, ComputedTransformComponent)) {
        removeComponent(widgetMenuUI.entity, ComputedTransformComponent)
        transform.scale.copy(V_111)
      }
      if (pose) {
        const rot = widgetState.handedness.value === 'left' ? widgetLeftRotation : widgetRightRotation
        const offset = widgetState.handedness.value === 'left' ? widgetLeftMenuGripOffset : widgetRightMenuGripOffset
        const orientation = pose.transform.orientation as any as Quaternion
        transform.rotation.copy(orientation).multiply(rot)
        vec3.copy(offset).applyQuaternion(orientation)
        transform.position.copy(pose.transform.position as any as Vector3).add(vec3)
      }
    } else {
      if (!hasComponent(widgetMenuUI.entity, ComputedTransformComponent))
        setComputedTransformComponent(widgetMenuUI.entity, world.cameraEntity, () =>
          ObjectFitFunctions.attachObjectInFrontOfCamera(widgetMenuUI.entity, 0.2, 0.1)
        )
    }

    const widgetMenuShown = widgetState.widgetsMenuOpen.value
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
  }

  return { execute, cleanup }
}
