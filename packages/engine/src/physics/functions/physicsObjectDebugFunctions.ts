import {
  ActiveCollisionTypes,
  ActiveEvents,
  ColliderDesc,
  RigidBodyDesc,
  RigidBodyType,
  ShapeType
} from '@dimforge/rapier3d-compat'
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three'

// import { getColorForBodyType } from '@xrengine/engine/src/debug/systems/DebugRenderer'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { CollisionGroups } from '@xrengine/engine/src/physics/enums/CollisionGroups'
import { ColliderDescOptions } from '@xrengine/engine/src/physics/types/PhysicsTypes'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { parseGLTFModel } from '@xrengine/engine/src/scene/functions/loadGLTFModel'
import { createNewEditorNode } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'
import { setTransformComponent, TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { getEngineState } from '../../ecs/classes/EngineState'
import { NetworkTopics } from '../../networking/classes/Network'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { ScenePrefabs } from '../../scene/systems/SceneObjectUpdateSystem'
import { Physics } from '../classes/Physics'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { VelocityComponent } from '../components/VelocityComponent'
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
export default async function PhysicsSimulationTestSystem(world: World) {
  return () => {
    const isInitialized = getEngineState().isEngineInitialized.value
    if (!isInitialized || !world.physicsWorld || simulationObjectsGenerated) return
    simulationObjectsGenerated = true
    generateSimulationData(0)
  }
}

export const boxDynamicConfig = {
  type: ShapeType.Cuboid,
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
  const type = config.type

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

  Physics.createRigidBodyForGroup(entity, Engine.instance.currentWorld.physicsWorld, mesh.userData)

  const world = Engine.instance.currentWorld

  const transform = getComponent(entity, TransformComponent)
  transform.position.copy(spawnPosition)

  const body = getComponent(entity, RigidBodyComponent).body
  body.setTranslation(transform.position, true)

  if (isNetworkObject && world.worldNetwork.isHosting) {
    // body.addTorque(defaultTorqueForce, true)
    console.info('spawning at:', transform.position.x, transform.position.y, transform.position.z)

    const node = world.entityTree.entityNodeMap.get(entity)
    if (node) {
      dispatchAction(
        WorldNetworkAction.spawnObject({
          prefab: 'physics_debug',
          position: transform.position,
          rotation: transform.rotation
        })
      )
    }
  }
}
