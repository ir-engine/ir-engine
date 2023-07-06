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

import {
  ActiveCollisionTypes,
  ActiveEvents,
  ColliderDesc,
  RigidBodyDesc,
  RigidBodyType,
  ShapeType
} from '@dimforge/rapier3d-compat'
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
// import { getColorForBodyType } from '@etherealengine/engine/src/debug/systems/DebugRenderer'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { addComponent, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { CollisionGroups } from '@etherealengine/engine/src/physics/enums/CollisionGroups'
import { ColliderDescOptions } from '@etherealengine/engine/src/physics/types/PhysicsTypes'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { parseGLTFModel } from '@etherealengine/engine/src/scene/functions/loadGLTFModel'
import { createNewEditorNode } from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import {
  setTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkTopics } from '../../networking/classes/Network'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { ScenePrefabs } from '../../scene/systems/SceneObjectUpdateSystem'
import { Physics } from '../classes/Physics'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { getInteractionGroups } from './getInteractionGroups'

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let uuidCounter = 0
function getUUID() {
  uuidCounter++
  console.log('uuidCounter', uuidCounter)
  return 'physicstestuuid' + uuidCounter
}

let simulationObjectsGenerated = false
export const PhysicsSimulationTestSystem = defineSystem({
  uuid: 'ee.test.PhysicsSimulationTestSystem',
  execute: () => {
    const isInitialized = getState(EngineState).isEngineInitialized
    if (!isInitialized || !Engine.instance.physicsWorld || simulationObjectsGenerated) return
    simulationObjectsGenerated = true
    generateSimulationData(0)
  }
})

export const boxDynamicConfig = {
  shapeType: ShapeType.Cuboid,
  bodyType: RigidBodyType.Fixed,
  collisionLayer: CollisionGroups.Default,
  collisionMask: CollisionGroups.Default | CollisionGroups.Avatars | CollisionGroups.Ground,
  friction: 1,
  restitution: 0,
  isTrigger: false,
  spawnPosition: new Vector3(0, 0.25, 5),
  spawnScale: new Vector3(0.5, 0.25, 0.5)
} as ColliderDescOptions

export const generateSimulationData = (numOfObjectsToGenerate) => {
  // Auto generate objects
  // for (let index = 0; index < numOfObjectsToGenerate; index++) {
  //   let config = {} as ShapeOptions
  //   config.type = getRandomInt(0, 1) ? 'box' : 'sphere'
  //   config.bodyType = getRandomInt(0, 2)
  //   config.collisionLayer = CollisionGroups.Default
  //   config.collisionMask = CollisionGroups.Default | CollisionGroups.Avatars
  //   config.staticFriction = 1
  //   config.dynamicFriction = 1
  //   config.restitution = 1
  //   console.log('generating object with config:', config)
  //   generatePhysicsObject(config)
  // }
  // // Define and generate any objects with manual configs
  // let config = {
  //   type: 'sphere' as ColliderTypes,
  //   bodyType: BodyType.DYNAMIC,
  //   collisionLayer: CollisionGroups.Default,
  //   collisionMask: CollisionGroups.Default | CollisionGroups.Avatars,
  //   staticFriction: 1,
  //   dynamicFriction: 1,
  //   restitution: 0.1
  // }
  // // TODO: Generating the object as a network object here may result in an error sometimes,
  // // the reason being the spawn object network action from server is received before the object has been added to the scene locally.
  // // In order to test network functionality, call the generateSimulationData directly from scene loading logic in code for now.
  // generatePhysicsObject(config, new Vector3(0, 15, 0), true)
}

const defaultSpawnPosition = new Vector3()
const defaultScale = new Vector3(1, 1, 1)
const defaultTorqueForce = new Vector3(0, 0, -500)

export const generatePhysicsObject = (
  config: ColliderDescOptions,
  spawnPosition = defaultSpawnPosition,
  isNetworkObject = false,
  scale = defaultScale
) => {
  const type = config.shapeType

  let geometry
  switch (type) {
    case ShapeType.Cuboid:
      geometry = new BoxGeometry(1, 0.5, 1)
      break

    // case 'sphere':
    //   geometry = new SphereGeometry(0.5, 32, 16)
    //   break

    default:
      console.warn('Unspported type passed to test script!.')
  }

  const color = 0x00ff00 //getColorForBodyType(config.bodyType ? config.bodyType : 0)
  const material = new MeshBasicMaterial({ color: color })
  const mesh = new Mesh(geometry, material)
  mesh.userData = config

  const entity = createEntity()
  setTransformComponent(entity)

  // Add empty model node
  // const uuid = getUUID()
  // let entityTreeNode = createEntityNode(entity, uuid)
  // createNewEditorNode(entityTreeNode, ScenePrefabs.model)

  // const nameComponent = getComponent(entity, NameComponent)
  // nameComponent.name = 'physics_debug_' + uuid

  addObjectToGroup(entity, mesh)

  Physics.createRigidBodyForGroup(entity, Engine.instance.physicsWorld, mesh.userData)

  const transform = getComponent(entity, TransformComponent)
  transform.position.copy(spawnPosition)

  const body = getComponent(entity, RigidBodyComponent).body
  body.setTranslation(transform.position, true)

  if (isNetworkObject && Engine.instance.worldNetwork.isHosting) {
    // body.addTorque(defaultTorqueForce, true)
    console.info('spawning at:', transform.position.x, transform.position.y, transform.position.z)

    if (entity) {
      dispatchAction(
        WorldNetworkAction.spawnObject({
          prefab: 'physics_debug',
          position: transform.position,
          rotation: transform.rotation,
          entityUUID: getUUID() as EntityUUID
        })
      )
    }
  }
}
