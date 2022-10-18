import { WebContainer3D } from '@etherealjs/web-layer/three'
import { Color, Object3D, Ray } from 'three'

import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { InputValue } from '../../input/interfaces/InputValue'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { PointerObject, XRPointerComponent } from '../../xr/XRComponents'
import { xrInputSourcesMap } from '../../xr/XRControllerSystem'
import { XRUIManager } from '../classes/XRUIManager'
import { XRUIComponent } from '../components/XRUIComponent'
import { loadXRUIDeps } from '../functions/createXRUI'

export default async function XRUISystem(world: World) {
  const renderer = EngineRenderer.instance.renderer
  if (!renderer) throw new Error('EngineRenderer.instance.renderer must exist before initializing XRUISystem')

  await loadXRUIDeps()

  const hitColor = new Color(0x00e6e6)
  const normalColor = new Color(0xffffff)
  const xruiQuery = defineQuery([XRUIComponent])
  const visibleXruiQuery = defineQuery([XRUIComponent, VisibleComponent])
  const pointerQuery = defineQuery([XRPointerComponent])

  const xrui = (XRUIManager.instance = new XRUIManager(await import('@etherealjs/web-layer/three')))
  xrui.WebLayerModule.WebLayerManager.initialize(renderer)
  xrui.WebLayerModule.WebLayerManager.instance.ktx2Encoder.pool.setWorkerLimit(1)

  // @ts-ignore
  // console.log(JSON.stringify(xrui.WebLayerModule.WebLayerManager.instance.textureLoader.workerConfig))
  // xrui.WebLayerModule.WebLayerManager.instance.textureLoader.workerConfig = {
  //   astcSupported: false,
  //   etc1Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc1' ),
  //   etc2Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc' ),
  //   dxtSupported: renderer.extensions.has( 'WEBGL_compressed_texture_s3tc' ),
  //   bptcSupported: renderer.extensions.has( 'EXT_texture_compression_bptc' ),
  //   pvrtcSupported: false
  // }

  xrui.interactionRays = [world.pointerScreenRaycaster.ray]

  // redirect DOM events from the canvas, to the 3D scene,
  // to the appropriate child Web3DLayer, and finally (back) to the
  // DOM to dispatch an event on the intended DOM target
  const redirectDOMEvent = (evt) => {
    for (const entity of visibleXruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).container
      layer.updateWorldMatrix(true, true)
      const hit = layer.hitTest(world.pointerScreenRaycaster.ray)
      if (hit && hit.intersection.object.visible) {
        hit.target.dispatchEvent(new evt.constructor(evt.type, evt))
        hit.target.focus()
        return
      }
    }
  }

  const updateControllerRayInteraction = (controller: PointerObject, xruiEntities: Entity[]) => {
    const cursor = controller.cursor
    let hit = null! as ReturnType<typeof WebContainer3D.prototype.hitTest>

    for (const entity of xruiEntities) {
      const layer = getComponent(entity, XRUIComponent).container

      /**
       * get closest hit from all XRUIs
       */
      const layerHit = layer.hitTest(controller)
      if (layerHit && (!hit || layerHit.intersection.distance < hit.intersection.distance)) hit = layerHit
    }

    if (hit) {
      const interactable = window.getComputedStyle(hit.target).cursor == 'pointer'

      if (cursor) {
        cursor.visible = true
        cursor.position.copy(hit.intersection.point)
        controller.worldToLocal(cursor.position)

        if (interactable) {
          cursor.material.color = hitColor
        } else {
          cursor.material.color = normalColor
        }
      }

      controller.lastHit = hit
    } else {
      if (cursor) {
        cursor.material.color = normalColor
        cursor.visible = false
      }
    }
  }

  const updateClickEventsForController = (controller: PointerObject, inputValue: InputValue) => {
    if (inputValue.lifecycleState !== LifecycleValue.Started) return
    if (controller.cursor?.visible) {
      const hit = controller.lastHit
      if (hit && hit.intersection.object.visible) {
        hit.target.dispatchEvent(new PointerEvent('click', { bubbles: true }))
        hit.target.focus()
      }
    }
  }

  // const canvas = EngineRenderer.instance.renderer.getContext().canvas
  document.body.addEventListener('click', redirectDOMEvent)
  document.body.addEventListener('contextmenu', redirectDOMEvent)
  document.body.addEventListener('dblclick', redirectDOMEvent)

  const execute = () => {
    const input = getComponent(world.localClientEntity, InputComponent)

    for (const entity of xruiQuery.enter()) {
      const layer = getComponent(entity, XRUIComponent).container
      layer.interactionRays = xrui.interactionRays
    }

    for (const entity of xruiQuery.exit()) {
      const layer = getComponent(entity, XRUIComponent, true).container
      layer.destroy()
    }

    const xrFrame = Engine.instance.xrFrame

    /** Update the objects to use for intersection tests */
    if (xrFrame && xrui.interactionRays[0] === world.pointerScreenRaycaster.ray)
      xrui.interactionRays = (
        pointerQuery()
          .filter((entity) => entity !== world.cameraEntity)
          .map((entity) => getComponent(entity, XRPointerComponent).pointer) as (Object3D | Ray)[]
      ).concat(world.pointerScreenRaycaster.ray) // todo, replace pointerScreenRaycaster with viewerInputSourceEntity

    if (!xrFrame && xrui.interactionRays[0] !== world.pointerScreenRaycaster.ray)
      xrui.interactionRays = [world.pointerScreenRaycaster.ray]

    const xruiEntities = visibleXruiQuery()

    /** do intersection tests */
    for (const source of world.inputSources) {
      const controllerEntity = xrInputSourcesMap.get(source)
      if (!controllerEntity) continue
      const controller = getComponent(controllerEntity, XRPointerComponent).pointer

      if (source.targetRayMode === 'tracked-pointer') {
        const GrabInput = source.handedness === 'left' ? BaseInput.GRAB_LEFT : BaseInput.GRAB_RIGHT
        updateControllerRayInteraction(controller, xruiEntities)
        if (input?.data?.has(GrabInput)) updateClickEventsForController(controller, input.data.get(GrabInput)!)
      }

      if (source.targetRayMode === 'screen' || source.targetRayMode === 'gaze')
        if (input?.data?.has(BaseInput.PRIMARY))
          updateClickEventsForController(controller, input.data.get(BaseInput.PRIMARY)!)
    }

    /** only update visible XRUI */

    for (const entity of visibleXruiQuery()) {
      const xrui = getComponent(entity, XRUIComponent)
      xrui.container.update()
    }

    // xrui.layoutSystem.viewFrustum.setFromPerspectiveProjectionMatrix(Engine.instance.currentWorld.camera.projectionMatrix)
    // EngineRenderer.instance.renderer.getSize(xrui.layoutSystem.viewResolution)
    // xrui.layoutSystem.update(world.delta, world.elapsedTime)
  }

  const cleanup = async () => {
    document.body.removeEventListener('click', redirectDOMEvent)
    document.body.removeEventListener('contextmenu', redirectDOMEvent)
    document.body.removeEventListener('dblclick', redirectDOMEvent)
    removeQuery(world, xruiQuery)
    removeQuery(world, visibleXruiQuery)
    removeQuery(world, pointerQuery)
  }

  return { execute, cleanup }
}
