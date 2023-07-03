/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Ray,
  RingGeometry,
  SphereGeometry,
  Vector3
} from 'three'

import { getMutableState, getState } from '@etherealengine/hyperflux'
import { WebContainer3D, WebLayerManager } from '@etherealengine/xrui'

import { clearWalkPoint } from '../../avatar/functions/autopilotFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '../../input/state/ButtonState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { DistanceFromCameraComponent } from '../../transform/components/DistanceComponents'
import { ReferenceSpace } from '../../xr/XRState'
import { XRUIComponent } from '../components/XRUIComponent'
import { XRUIState } from '../XRUIState'

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createPointer = (inputSource: XRInputSource): PointerObject => {
  switch (inputSource.targetRayMode) {
    case 'gaze': {
      const geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      const material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
      return new Mesh(geometry, material) as PointerObject
    }
    default:
    case 'tracked-pointer': {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
      geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))
      const material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
      return new Line(geometry, material)
    }
  }
}

const createUICursor = () => {
  const geometry = new SphereGeometry(0.01, 16, 16)
  const material = new MeshBasicMaterial({ color: 0xffffff })
  return new Mesh(geometry, material)
}

export type PointerObject = (Line<BufferGeometry, LineBasicMaterial> | Mesh<RingGeometry, MeshBasicMaterial>) & {
  targetRay?: Mesh<BufferGeometry, MeshBasicMaterial>
  cursor?: Mesh<BufferGeometry, MeshBasicMaterial>
  lastHit?: ReturnType<typeof WebContainer3D.prototype.hitTest> | null
}

const hitColor = new Color(0x00e6e6)
const normalColor = new Color(0xffffff)
const visibleInteractableXRUIQuery = defineQuery([XRUIComponent, VisibleComponent, InputComponent])
const xruiQuery = defineQuery([XRUIComponent])

// todo - hoist to hyperflux state
const maxXruiPointerDistanceSqr = 3 * 3

// redirect DOM events from the canvas, to the 3D scene,
// to the appropriate child Web3DLayer, and finally (back) to the
// DOM to dispatch an event on the intended DOM target
const redirectDOMEvent = (evt) => {
  for (const entity of visibleInteractableXRUIQuery()) {
    const layer = getComponent(entity, XRUIComponent)
    const assigned = InputSourceComponent.isAssignedButtons(entity)
    if (!assigned) continue
    layer.updateWorldMatrix(true, true)
    const hit = layer.hitTest(Engine.instance.pointerScreenRaycaster.ray)
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
    const assigned = InputSourceComponent.isAssignedButtons(entity)
    if (!assigned) continue

    const layer = getComponent(entity, XRUIComponent)

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

const updateClickEventsForController = (controller: PointerObject) => {
  if (controller.cursor?.visible) {
    const hit = controller.lastHit
    if (hit && hit.intersection.object.visible) {
      hit.target.dispatchEvent(new PointerEvent('click', { bubbles: true }))
      hit.target.focus()
    }
  }
}

const inputSourceQuery = defineQuery([InputSourceComponent])

export const pointers = new Map<XRInputSource, PointerObject>()

const execute = () => {
  const xruiState = getState(XRUIState)
  const inputSourceEntities = inputSourceQuery()

  const xrFrame = Engine.instance.xrFrame

  /** Update the objects to use for intersection tests */
  if (xrFrame && xruiState.interactionRays[0] === Engine.instance.pointerScreenRaycaster.ray)
    xruiState.interactionRays = (Array.from(pointers.values()) as (Ray | Object3D)[]).concat(
      Engine.instance.pointerScreenRaycaster.ray
    ) // todo, replace pointerScreenRaycaster with input sources

  if (!xrFrame && xruiState.interactionRays[0] !== Engine.instance.pointerScreenRaycaster.ray)
    xruiState.interactionRays = [Engine.instance.pointerScreenRaycaster.ray]

  const interactableXRUIEntities = visibleInteractableXRUIQuery()

  /** @todo rather than just a distance query, we should set this when the pointer is actually over an XRUI */
  let isCloseToVisibleXRUI = false

  for (const entity of interactableXRUIEntities) {
    if (
      hasComponent(entity, DistanceFromCameraComponent) &&
      DistanceFromCameraComponent.squaredDistance[entity] < maxXruiPointerDistanceSqr
    )
      isCloseToVisibleXRUI = true
  }

  if (xruiState.pointerActive !== isCloseToVisibleXRUI)
    getMutableState(XRUIState).pointerActive.set(isCloseToVisibleXRUI)

  /** do intersection tests */
  for (const inputSourceEntity of inputSourceEntities) {
    const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
    const inputSource = inputSourceComponent.source
    const buttons = inputSourceComponent.buttons

    if (inputSource.targetRayMode !== 'tracked-pointer') continue
    if (!pointers.has(inputSource)) {
      const pointer = createPointer(inputSource)
      const cursor = createUICursor()
      pointer.cursor = cursor
      pointer.add(cursor)
      cursor.visible = false
      pointers.set(inputSource, pointer)
      Engine.instance.scene.add(pointer)
    }

    const pointer = pointers.get(inputSource)!

    const referenceSpace = ReferenceSpace.origin
    if (Engine.instance.xrFrame && referenceSpace) {
      const pose = Engine.instance.xrFrame.getPose(inputSource.targetRaySpace, referenceSpace)
      if (pose) {
        pointer.position.copy(pose.transform.position as any as Vector3)
        pointer.quaternion.copy(pose.transform.orientation as any as Quaternion)
        pointer.updateMatrixWorld()
      }
    }

    pointer.material.visible = isCloseToVisibleXRUI

    if (
      buttons[XRStandardGamepadButton.Trigger]?.down &&
      (inputSource.handedness === 'left' || inputSource.handedness === 'right')
    )
      updateClickEventsForController(pointer)

    updateControllerRayInteraction(pointer, interactableXRUIEntities)
  }

  for (const [pointerSource, pointer] of pointers) {
    if (!inputSourceEntities.find((entity) => getComponent(entity, InputSourceComponent).source === pointerSource)) {
      Engine.instance.scene.remove(pointer)
      pointers.delete(pointerSource)
    }
  }

  /** only update visible XRUI */

  for (const entity of visibleInteractableXRUIQuery()) {
    const xrui = getComponent(entity, XRUIComponent)
    xrui.update()
  }

  /** @todo remove this once XRUI no longer forces it internally */
  for (const entity of xruiQuery()) {
    const xrui = getComponent(entity, XRUIComponent)
    const visible = hasComponent(entity, VisibleComponent)
    xrui.matrixWorldAutoUpdate = visible
    xrui.matrixAutoUpdate = visible
  }

  // xrui.layoutSystem.viewFrustum.setFromPerspectiveProjectionMatrix(Engine.instance.camera.projectionMatrix)
  // EngineRenderer.instance.renderer.getSize(xrui.layoutSystem.viewResolution)
  // xrui.layoutSystem.update(world.delta, world.elapsedTime)
}

const reactor = () => {
  useEffect(() => {
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

    // const canvas = EngineRenderer.instance.renderer.getContext().canvas
    document.body.addEventListener('pointerdown', redirectDOMEvent)
    document.body.addEventListener('click', redirectDOMEvent)
    document.body.addEventListener('contextmenu', redirectDOMEvent)
    document.body.addEventListener('dblclick', redirectDOMEvent)

    getMutableState(XRUIState).interactionRays.set([Engine.instance.pointerScreenRaycaster.ray])

    return () => {
      document.body.removeEventListener('pointerdown', redirectDOMEvent)
      document.body.removeEventListener('click', redirectDOMEvent)
      document.body.removeEventListener('contextmenu', redirectDOMEvent)
      document.body.removeEventListener('dblclick', redirectDOMEvent)
    }
  }, [])
  return null
}

export const XRUISystem = defineSystem({
  uuid: 'ee.engine.XRUISystem',
  execute,
  reactor
})
