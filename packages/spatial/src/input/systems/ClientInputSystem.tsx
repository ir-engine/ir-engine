/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Not } from 'bitecs'
import React from 'react'
import { Quaternion, Ray, Raycaster, Vector3 } from 'three'

import { isClient } from '@ir-engine/common/src/utils/getEnvironment'
import { getComponent, getMutableComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { QueryReactor, defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup, PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState } from '@ir-engine/hyperflux'

import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/MathConstants'
import { RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { XRState } from '../../xr/XRState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import ClientInputFunctions from '../functions/ClientInputFunctions'
import ClientInputHeuristics, { HeuristicData, HeuristicFunctions } from '../functions/ClientInputHeuristics'
import ClientInputHooks from '../functions/ClientInputHooks'
import { InputState } from '../state/InputState'

const pointersQuery = defineQuery([InputPointerComponent, InputSourceComponent, Not(XRSpaceComponent)])
const xrSpacesQuery = defineQuery([XRSpaceComponent, TransformComponent])
const inputSourceQuery = defineQuery([InputSourceComponent])
const inputsQuery = defineQuery([InputComponent])
const xruiQuery = defineQuery([VisibleComponent, XRUIComponent])

const _rayRotation = new Quaternion()

const _inputRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 1000,
  groups: getInteractionGroups(CollisionGroups.Default, CollisionGroups.Default),
  excludeRigidBody: undefined //
} as RaycastArgs
const _quat = new Quaternion()
const _inputRay = new Ray()
const _raycaster = new Raycaster()
const _bboxHitTarget = new Vector3()

const _heuristicData = {
  quaternion: _quat,
  ray: _inputRay,
  raycast: _inputRaycast,
  caster: _raycaster,
  hitTarget: _bboxHitTarget
} as HeuristicData

const _heuristicFunctions = {
  editor: ClientInputHeuristics.findEditor,
  xrui: ClientInputHeuristics.findXRUI,
  physicsColliders: ClientInputHeuristics.findPhysicsColliders,
  bboxes: ClientInputHeuristics.findBBoxes,
  meshes: ClientInputHeuristics.findMeshes,
  proximity: ClientInputHeuristics.findProximity,
  raycastedInput: ClientInputHeuristics.findRaycastedInput
} as HeuristicFunctions

const execute = () => {
  const capturedEntity = getMutableState(InputState).capturingEntity.value
  InputState.setCapturingEntity(UndefinedEntity, true)

  for (const eid of inputsQuery()) {
    if (!getComponent(eid, InputComponent).inputSources.length) continue
    getMutableComponent(eid, InputComponent).inputSources.set([])
  }

  // update 2D screen-based (driven by pointer api) input sources
  for (const eid of pointersQuery()) {
    const pointer = getComponent(eid, InputPointerComponent)
    const inputSource = getComponent(eid, InputSourceComponent)
    const camera = getComponent(pointer.cameraEntity, CameraComponent)
    pointer.movement.copy(pointer.position).sub(pointer.lastPosition)
    pointer.lastPosition.copy(pointer.position)
    inputSource.raycaster.setFromCamera(pointer.position, camera)
    TransformComponent.position.x[eid] = inputSource.raycaster.ray.origin.x
    TransformComponent.position.y[eid] = inputSource.raycaster.ray.origin.y
    TransformComponent.position.z[eid] = inputSource.raycaster.ray.origin.z
    _rayRotation.setFromUnitVectors(ObjectDirection.Forward, inputSource.raycaster.ray.direction)
    TransformComponent.rotation.x[eid] = _rayRotation.x
    TransformComponent.rotation.y[eid] = _rayRotation.y
    TransformComponent.rotation.z[eid] = _rayRotation.z
    TransformComponent.rotation.w[eid] = _rayRotation.w
    TransformComponent.dirtyTransforms[eid] = true
  }

  // update xr input sources
  const xrFrame = getState(XRState).xrFrame

  for (const eid of xrSpacesQuery()) {
    const space = getComponent(eid, XRSpaceComponent)
    const pose = xrFrame?.getPose(space.space, space.baseSpace)
    if (!pose) continue
    TransformComponent.position.x[eid] = pose.transform.position.x
    TransformComponent.position.y[eid] = pose.transform.position.y
    TransformComponent.position.z[eid] = pose.transform.position.z
    TransformComponent.rotation.x[eid] = pose.transform.orientation.x
    TransformComponent.rotation.y[eid] = pose.transform.orientation.y
    TransformComponent.rotation.z[eid] = pose.transform.orientation.z
    TransformComponent.rotation.w[eid] = pose.transform.orientation.w
    TransformComponent.dirtyTransforms[eid] = true
  }

  const interactionRays = inputSourceQuery().map((eid) => getComponent(eid, InputSourceComponent).raycaster.ray)
  for (const xrui of xruiQuery()) {
    getComponent(xrui, XRUIComponent).interactionRays = interactionRays
  }

  // assign input sources (InputSourceComponent) to input sinks (InputComponent), foreach on InputSourceComponents
  for (const sourceEid of inputSourceQuery()) {
    ClientInputFunctions.assignInputSources(sourceEid, capturedEntity, _heuristicData, _heuristicFunctions)
  }

  for (const sourceEid of inputSourceQuery()) {
    ClientInputFunctions.updateGamepadInput(sourceEid)
  }
}

const reactor = () => {
  if (!isClient) return null

  ClientInputHooks.useNonSpatialInputSources()
  ClientInputHooks.useGamepadInputSources()
  ClientInputHooks.useXRInputSources()

  return (
    <>
      <QueryReactor Components={[RendererComponent]} ChildEntityReactor={ClientInputHooks.CanvasInputReactor} />
      <QueryReactor Components={[MeshComponent]} ChildEntityReactor={ClientInputHooks.MeshInputReactor} />
      <QueryReactor Components={[BoundingBoxComponent]} ChildEntityReactor={ClientInputHooks.BoundingBoxInputReactor} />
    </>
  )
}

export const ClientInputSystem = defineSystem({
  uuid: 'ee.engine.input.ClientInputSystem',
  insert: { before: InputSystemGroup },
  execute,
  reactor
})

const cleanupInputs = () => {
  if (typeof globalThis.document === 'undefined') return

  const hasFocus = document.hasFocus()

  for (const eid of inputSourceQuery()) {
    const source = getComponent(eid, InputSourceComponent)
    for (const key in source.buttons) {
      ClientInputFunctions.cleanupButton(key, source.buttons, hasFocus)
    }

    // clear non-spatial emulated axes data end of each frame
    // this is used to clear wheel speed each frame
    if (!hasComponent(eid, XRSpaceComponent) && hasComponent(eid, InputPointerComponent)) {
      ;(source.source.gamepad!.axes as number[]).fill(0)
    }
  }
}

export const ClientInputCleanupSystem = defineSystem({
  uuid: 'ee.engine.input.ClientInputCleanupSystem',
  insert: { after: PresentationSystemGroup },
  execute: cleanupInputs
})
