import { Layers, Ray, Raycaster, Vector3 } from 'three'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
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
  const xruiQuery = defineQuery([XRUIComponent])
  const xrInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, XRUIComponent])

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
    const screenXY = input?.data?.get(BaseInput.SCREENXY)
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

    for (const entity of xrInputQuery.enter()) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      xrui.interactionRays = [
        screenRaycaster.ray,
        xrInputSourceComponent.controllerLeft,
        xrInputSourceComponent.controllerRight
      ]
    }

    for (const entity of xrInputQuery.exit()) {
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
