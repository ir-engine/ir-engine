import { Color, Layers, Ray, Raycaster, Vector3 } from 'three'
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

export default async function XRUISystem(world: World): Promise<System> {
  const hitRayColor = new Color(0x00e6e6)
  const normalRayColor = new Color(0xffffff)
  const xruiQuery = defineQuery([XRUIComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent])

  const xrui = (XRUIManager.instance = new XRUIManager(await import('ethereal')))
  const screenRaycaster = new Raycaster()
  xrui.interactionRays = [screenRaycaster.ray]

  // redirect DOM events from the canvas, to the 3D scene,
  // to the appropriate child Web3DLayer, and finally (back) to the
  // DOM to dispatch an event on the intended DOM target
  const redirectDOMEvent = (evt) => {
    for (const entity of xruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).layer
      const hit = layer.hitTest(xrui.interactionRays[0])
      if (hit) {
        hit.target.dispatchEvent(new evt.constructor(evt.type, evt))
        hit.target.focus()
      }
    }
  }

  const updateControllerRayInteraction = (inputComponent: XRInputSourceComponentType) => {
    for (const entity of xruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).layer
      const controllers = [inputComponent.controllerLeft, inputComponent.controllerRight]
      for (const controller of controllers) {
        const hit = layer.hitTest(controller)
        if (hit) {
          const interactable = window.getComputedStyle(hit.target).cursor == 'pointer'
          if (interactable && (controller as any).targetRay) (controller as any).targetRay.material.color = hitRayColor
        } else {
          if ((controller as any).targetRay) (controller as any).targetRay.material.color = normalRayColor
        }
      }
    }
  }

  let addedEventListeners = false

  return () => {
    if (!addedEventListeners) {
      const canvas = Engine.renderer.context.canvas
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
      xrui.interactionRays.push(xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight)
    }

    for (const entity of localXRInputQuery()) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      updateControllerRayInteraction(xrInputSourceComponent)
    }

    for (const entity of localXRInputQuery.exit()) {
      xrui.interactionRays.splice(1, 2)
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
