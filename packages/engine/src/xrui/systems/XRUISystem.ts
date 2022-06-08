import { Color, Mesh, Raycaster } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { dispatchAction } from '@xrengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { XRInputSourceComponent, XRInputSourceComponentType } from '../../xr/components/XRInputSourceComponent'
import { XRUIManager } from '../classes/XRUIManager'
import { XRUIComponent } from '../components/XRUIComponent'

export default async function XRUISystem(world: World) {
  const renderer = EngineRenderer.instance.renderer
  if (!renderer) throw new Error('EngineRenderer.instance.renderer must exist before initializing XRUISystem')

  const hitColor = new Color(0x00e6e6)
  const normalColor = new Color(0xffffff)
  const xruiQuery = defineQuery([XRUIComponent])
  const avatar = defineQuery([AvatarComponent, NetworkObjectComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent])
  const controllerLastHitTarget: string[] = []
  const hoverSfxPath = Engine.instance.publicPath + '/default_assets/audio/ui-hover.mp3'
  const hoverAudio = new Audio()
  hoverAudio.src = hoverSfxPath
  let idCounter = 0

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

  const screenRaycaster = new Raycaster()
  screenRaycaster.layers.enableAll()
  xrui.interactionRays = [screenRaycaster.ray]

  // redirect DOM events from the canvas, to the 3D scene,
  // to the appropriate child Web3DLayer, and finally (back) to the
  // DOM to dispatch an event on the intended DOM target
  const redirectDOMEvent = (evt) => {
    for (const entity of xruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).container
      const hit = layer.hitTest(screenRaycaster.ray)
      if (hit && hit.intersection.object.visible) {
        hit.target.dispatchEvent(new evt.constructor(evt.type, evt))
        hit.target.focus()
        return
      }
    }

    for (const entity of avatar(world)) {
      const model = getComponent(entity, Object3DComponent).value
      const intersectObjects = screenRaycaster.intersectObject(model, true)
      if (intersectObjects.length > 0) {
        const userId = getComponent(entity, NetworkObjectComponent).ownerId
        dispatchAction(EngineActions.userAvatarTapped({ userId }))
        return
      }
    }
    dispatchAction(EngineActions.userAvatarTapped({ userId: '' as UserId }))
  }

  const updateControllerRayInteraction = (inputComponent: XRInputSourceComponentType) => {
    const controllers = [inputComponent.controllerLeft, inputComponent.controllerRight]

    for (const entity of xruiQuery()) {
      const layer = getComponent(entity, XRUIComponent).container

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
      const canvas = EngineRenderer.instance.renderer.getContext().canvas
      canvas.addEventListener('click', redirectDOMEvent)
      canvas.addEventListener('contextmenu', redirectDOMEvent)
      canvas.addEventListener('dblclick', redirectDOMEvent)
      addedEventListeners = true
    }

    const input = getComponent(world.localClientEntity, InputComponent)
    const screenXY = input?.data?.get(BaseInput.SCREENXY)?.value
    if (screenXY) {
      screenRaycaster.setFromCamera({ x: screenXY[0], y: screenXY[1] }, Engine.instance.currentWorld.camera)
    } else {
      screenRaycaster.ray.origin.set(Infinity, Infinity, Infinity)
      screenRaycaster.ray.direction.set(0, -1, 0)
    }

    for (const entity of xruiQuery.enter()) {
      const layer = getComponent(entity, XRUIComponent).container
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
      const xrui = getComponent(entity, XRUIComponent)
      xrui.container.update()
    }

    // xrui.layoutSystem.viewFrustum.setFromPerspectiveProjectionMatrix(Engine.instance.currentWorld.camera.projectionMatrix)
    // EngineRenderer.instance.renderer.getSize(xrui.layoutSystem.viewResolution)
    // xrui.layoutSystem.update(world.delta, world.elapsedTime)
  }
}
