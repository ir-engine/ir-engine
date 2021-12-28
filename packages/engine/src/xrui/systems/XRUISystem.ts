import { Color, Mesh, Raycaster } from 'three'
import { XRInputSourceComponent, XRInputSourceComponentType } from '../../xr/components/XRInputSourceComponent'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { XRUIManager } from '../classes/XRUIManager'
import { XRUIComponent } from '../components/XRUIComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { EngineActions } from '../../ecs/classes/EngineService'

export default async function XRUISystem(world: World): Promise<System> {
  const hitColor = new Color(0x00e6e6)
  const normalColor = new Color(0xffffff)
  const xruiQuery = defineQuery([XRUIComponent])
  const avatar = defineQuery([AvatarComponent, NetworkObjectComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent])
  const controllerLastHitTarget: string[] = []
  const hoverSfxPath = Engine.publicPath + '/default_assets/audio/ui-hover.mp3'
  const hoverAudio = new Audio()
  hoverAudio.src = hoverSfxPath
  let idCounter = 0

  const xrui = (XRUIManager.instance = new XRUIManager(await import('ethereal')))
  const screenRaycaster = new Raycaster()
  xrui.interactionRays = [screenRaycaster.ray]

  // redirect DOM events from the canvas, to the 3D scene,
  // to the appropriate child Web3DLayer, and finally (back) to the
  // DOM to dispatch an event on the intended DOM target
  const redirectDOMEvent = (evt) => {
    for (const entity of xruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).layer
      const hit = layer.hitTest(screenRaycaster.ray)
      if (hit) {
        hit.target.dispatchEvent(new evt.constructor(evt.type, evt))
        hit.target.focus()
      }
    }

    for (const entity of avatar(world)) {
      const modelContainer = getComponent(entity, AvatarComponent).modelContainer
      const intersectObjects = screenRaycaster.intersectObjects([modelContainer])
      if (intersectObjects.length > 0) {
        const userId = getComponent(entity, NetworkObjectComponent).ownerId
        dispatchLocal(EngineActions.userAvatarTapped(userId))
        return
      } else {
        dispatchLocal(EngineActions.userAvatarTapped(''))
      }
    }
  }

  const updateControllerRayInteraction = (inputComponent: XRInputSourceComponentType) => {
    const controllers = [inputComponent.controllerLeft, inputComponent.controllerRight]

    for (const entity of xruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).layer

      for (const [i, controller] of controllers.entries()) {
        const hit = layer.hitTest(controller)
        const cursor = (controller as any).cursor as Mesh

        if (hit) {
          const interactable = window.getComputedStyle(hit.target).cursor == 'pointer'

          if (cursor) {
            cursor.visible = true
            cursor.position.copy(hit.intersection.point)
            controller.worldToLocal(cursor.position)

            if (interactable) {
              ;(cursor.material as any).color = hitColor
            } else {
              ;(cursor.material as any).color = normalColor
            }
          }

          if (interactable) {
            if (!hit.target.id) {
              hit.target.id = 'interactable-' + ++idCounter
            }

            const lastHit = controllerLastHitTarget[i]

            if (lastHit != hit.target.id) {
              console.log(lastHit, hit.target.id)
              hoverAudio.pause()
              hoverAudio.currentTime = 0
              hoverAudio.play()
            }

            controllerLastHitTarget[i] = hit.target.id
          }
        } else {
          if (cursor) {
            ;(cursor.material as any).color = normalColor
            cursor.visible = false
          }
        }
      }
    }
  }

  let addedEventListeners = false

  return () => {
    if (!addedEventListeners) {
      const canvas = Engine.renderer.getContext().canvas
      canvas.addEventListener('click', redirectDOMEvent)
      canvas.addEventListener('dblclick', redirectDOMEvent)
      addedEventListeners = true
    }

    const input = getComponent(world.localClientEntity, InputComponent)
    const screenXY = input?.data?.get(BaseInput.SCREENXY)?.value
    if (screenXY) {
      screenRaycaster.setFromCamera({ x: screenXY[0], y: screenXY[1] }, Engine.camera)
    } else {
      screenRaycaster.ray.origin.set(Infinity, Infinity, Infinity)
      screenRaycaster.ray.direction.set(0, -1, 0)
    }

    for (const entity of xruiQuery.enter()) {
      const layer = getComponent(entity, XRUIComponent).layer
      layer.interactionRays = xrui.interactionRays
    }

    for (const entity of localXRInputQuery.enter()) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      xrui.interactionRays = [xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight]
    }

    for (const entity of localXRInputQuery()) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      updateControllerRayInteraction(xrInputSourceComponent)
    }

    for (const entity of localXRInputQuery.exit()) {
      xrui.interactionRays = [screenRaycaster.ray]
    }

    for (const entity of xruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).layer
      if (!xrui.layoutSystem.nodeAdapters.has(layer)) layer.update()
    }

    xrui.layoutSystem.viewFrustum.setFromPerspectiveProjectionMatrix(Engine.camera.projectionMatrix)
    Engine.renderer.getSize(xrui.layoutSystem.viewResolution)
    xrui.layoutSystem.update(world.delta, world.elapsedTime)
  }
}
