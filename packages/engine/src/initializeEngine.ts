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

import { addActionReceptor } from '@etherealengine/hyperflux'

import * as bitecs from 'bitecs'

import { BoxGeometry, Mesh, MeshNormalMaterial } from 'three'
import { CameraComponent } from './camera/components/CameraComponent'
import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineEventReceptor } from './ecs/classes/EngineState'
import { getComponent, setComponent } from './ecs/functions/ComponentFunctions'
import { executeSystems, startCoreSystems } from './ecs/functions/EngineFunctions'
import { createEntity } from './ecs/functions/EntityFunctions'
import { EntityTreeComponent, initializeSceneEntity } from './ecs/functions/EntityTree'
import { EngineRenderer } from './renderer/WebGLRendererSystem'
import { addObjectToGroup } from './scene/components/GroupComponent'
import { NameComponent } from './scene/components/NameComponent'
import { VisibleComponent } from './scene/components/VisibleComponent'
import { ObjectLayers } from './scene/constants/ObjectLayers'
import { setObjectLayers } from './scene/functions/setObjectLayers'
import { TransformComponent, setTransformComponent } from './transform/components/TransformComponent'

/**
 * Creates a new instance of the engine and engine renderer. This initializes all properties and state for the engine,
 * adds action receptors and creates a new world.
 * @returns {Engine}
 */
export const createEngine = () => {
  if (Engine.instance) {
    throw new Error('Engine already exists')
  }
  Engine.instance = new Engine()

  Engine.instance = Engine.instance
  bitecs.createWorld(Engine.instance)

  Engine.instance.scene.matrixAutoUpdate = false
  Engine.instance.scene.matrixWorldAutoUpdate = false
  Engine.instance.scene.layers.set(ObjectLayers.Scene)

  Engine.instance.originEntity = createEntity()
  setComponent(Engine.instance.originEntity, NameComponent, 'origin')
  setComponent(Engine.instance.originEntity, EntityTreeComponent, { parentEntity: null })
  setTransformComponent(Engine.instance.originEntity)
  setComponent(Engine.instance.originEntity, VisibleComponent, true)
  addObjectToGroup(Engine.instance.originEntity, Engine.instance.origin)
  Engine.instance.origin.name = 'world-origin'
  const originHelperMesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshNormalMaterial())
  setObjectLayers(originHelperMesh, ObjectLayers.Gizmos)
  originHelperMesh.frustumCulled = false
  Engine.instance.origin.add(originHelperMesh)

  Engine.instance.cameraEntity = createEntity()
  setComponent(Engine.instance.cameraEntity, NameComponent, 'camera')
  setComponent(Engine.instance.cameraEntity, CameraComponent)
  setComponent(Engine.instance.cameraEntity, VisibleComponent, true)
  getComponent(Engine.instance.cameraEntity, TransformComponent).position.set(0, 5, 2)

  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  camera.matrixAutoUpdate = false
  camera.matrixWorldAutoUpdate = false

  initializeSceneEntity()

  EngineRenderer.instance = new EngineRenderer()
  addActionReceptor(EngineEventReceptor)
  startCoreSystems()
  Engine.instance.engineTimer = Timer(executeSystems)
}
