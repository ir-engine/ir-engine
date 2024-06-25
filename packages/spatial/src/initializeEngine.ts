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

import { BoxGeometry, Group, Mesh, MeshNormalMaterial } from 'three'

import {
  createEntity,
  ECSState,
  executeSystems,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent,
  UUIDComponent
} from '@etherealengine/ecs'
import { Engine, startEngine } from '@etherealengine/ecs/src/Engine'
import { EntityUUID, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { Timer } from '@etherealengine/ecs/src/Timer'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { CameraComponent } from './camera/components/CameraComponent'
import { NameComponent } from './common/NameComponent'
import { EngineState } from './EngineState'
import { InputComponent } from './input/components/InputComponent'
import { addObjectToGroup } from './renderer/components/GroupComponent'
import { setObjectLayers } from './renderer/components/ObjectLayerComponent'
import { SceneComponent } from './renderer/components/SceneComponents'
import { VisibleComponent } from './renderer/components/VisibleComponent'
import { ObjectLayers } from './renderer/constants/ObjectLayers'
import { PerformanceManager } from './renderer/PerformanceState'
import { RendererComponent } from './renderer/WebGLRendererSystem'
import { EntityTreeComponent } from './transform/components/EntityTree'
import { TransformComponent } from './transform/components/TransformComponent'
import { XRState } from './xr/XRState'

/**
 * Creates a new instance of the engine and engine renderer. This initializes all properties and state for the engine,
 * adds action receptors and creates a new world.
 * @returns {Engine}
 */
export const createEngine = () => {
  startEngine()
  const timer = Timer((time, xrFrame) => {
    getMutableState(XRState).xrFrame.set(xrFrame)
    executeSystems(time)
    getMutableState(XRState).xrFrame.set(null)
  })
  getMutableState(ECSState).timer.set(timer)
}

export const initializeSpatialEngine = (canvas?: HTMLCanvasElement) => {
  const originEntity = createEntity()
  setComponent(originEntity, NameComponent, 'origin')
  setComponent(originEntity, UUIDComponent, 'ee.origin' as EntityUUID)
  setComponent(originEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(originEntity, TransformComponent)
  setComponent(originEntity, VisibleComponent, true)

  const localFloorEntity = createEntity()
  setComponent(localFloorEntity, NameComponent, 'local floor')
  setComponent(localFloorEntity, UUIDComponent, 'ee.local-floor' as EntityUUID)
  setComponent(localFloorEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(localFloorEntity, TransformComponent)
  setComponent(localFloorEntity, VisibleComponent, true)
  const origin = new Group()
  addObjectToGroup(localFloorEntity, origin)
  const originHelperMesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshNormalMaterial())
  setObjectLayers(originHelperMesh, ObjectLayers.Gizmos)
  originHelperMesh.frustumCulled = false
  origin.add(originHelperMesh)

  const viewerEntity = createEntity()
  setComponent(viewerEntity, NameComponent, 'viewer')
  setComponent(viewerEntity, UUIDComponent, 'ee.viewer' as EntityUUID)
  setComponent(viewerEntity, CameraComponent)
  setComponent(viewerEntity, VisibleComponent, true)
  setComponent(viewerEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(viewerEntity, InputComponent)
  const camera = getComponent(viewerEntity, CameraComponent)
  camera.matrixAutoUpdate = false
  camera.matrixWorldAutoUpdate = false
  camera.layers.disableAll()
  camera.layers.enable(ObjectLayers.Scene)
  camera.layers.enable(ObjectLayers.Avatar)
  camera.layers.enable(ObjectLayers.UI)
  camera.layers.enable(ObjectLayers.TransformGizmo)
  camera.layers.enable(ObjectLayers.UVOL)

  setComponent(viewerEntity, SceneComponent)
  getMutableComponent(viewerEntity, SceneComponent).children.merge([originEntity, viewerEntity, localFloorEntity])

  if (canvas) {
    setComponent(viewerEntity, RendererComponent, { canvas })
    const renderer = getComponent(viewerEntity, RendererComponent)
    renderer.initialize()
    PerformanceManager.buildPerformanceState(renderer)
  }

  getMutableState(EngineState).merge({
    originEntity,
    localFloorEntity,
    viewerEntity
  })
}

export const destroySpatialEngine = () => {
  const { originEntity, localFloorEntity, viewerEntity } = getState(EngineState)
  if (viewerEntity) {
    removeEntity(viewerEntity)
  }
  if (localFloorEntity) {
    removeEntity(localFloorEntity)
  }
  if (originEntity) {
    removeEntity(originEntity)
  }
}
