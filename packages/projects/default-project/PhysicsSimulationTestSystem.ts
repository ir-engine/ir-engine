import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three'

import { getColorForBodyType } from '@xrengine/engine/src/debug/systems/DebugRenderer'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { dispatchFrom } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { CollisionGroups } from '@xrengine/engine/src/physics/enums/CollisionGroups'
import { ShapeOptions } from '@xrengine/engine/src/physics/functions/createCollider'
import { teleportRigidbody } from '@xrengine/engine/src/physics/functions/teleportRigidbody'
import { BodyType, ColliderTypes } from '@xrengine/engine/src/physics/types/PhysicsTypes'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { parseGLTFModel } from '@xrengine/engine/src/scene/functions/loadGLTFModel'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { createNewEditorNode } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

// Maybe do this using system injection node
// receiveActionOnce(EngineEvents.EVENTS.SCENE_LOADED, () => {
//     console.log("gltf parse scene loaded")
//     generateSimulationData(5)
// })

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
  return 'physicstestuuid' + uuidCounter
}

let simulationObjectsGenerated = false
export default async function PhysicsSimulationTestSystem(world: World) {
  return () => {
    if (!Engine.isInitialized || !world.physics.physics || simulationObjectsGenerated) return
    simulationObjectsGenerated = true
    generateSimulationData(0)
  }
}

export const boxDynamicConfig = {
  type: 'box' as ColliderTypes,
  bodyType: BodyType.DYNAMIC,
  collisionLayer: CollisionGroups.Default,
  collisionMask: CollisionGroups.Default | CollisionGroups.Avatars,
  staticFriction: 1,
  dynamicFriction: 1,
  restitution: 0.1,
  spawnPosition: new Vector3(0, 15, 5),
  spawnScale: new Vector3(0.5, 0.5, 0.5)
}

export const generateSimulationData = (numOfObjectsToGenerate) => {
  // Auto generate objects
  for (let index = 0; index < numOfObjectsToGenerate; index++) {
    let config = {} as ShapeOptions
    config.type = getRandomInt(0, 1) ? 'box' : 'sphere'
    config.bodyType = getRandomInt(0, 2)
    config.collisionLayer = CollisionGroups.Default
    config.collisionMask = CollisionGroups.Default | CollisionGroups.Avatars
    config.staticFriction = 1
    config.dynamicFriction = 1
    config.restitution = 1

    console.log('generating object with config:', config)
    generatePhysicsObject(config)
  }

  // Define and generate any objects with manual configs
  let config = {
    type: 'sphere' as ColliderTypes,
    bodyType: BodyType.DYNAMIC,
    collisionLayer: CollisionGroups.Default,
    collisionMask: CollisionGroups.Default | CollisionGroups.Avatars,
    staticFriction: 1,
    dynamicFriction: 1,
    restitution: 0.1
  }

  // TODO: Generating the object as a network object here may result in an error sometimes,
  // the reason being the spawn object network action from server is received before the object has been added to the scene locally.
  // In order to test network functionality, call the generateSimulationData directly from scene loading logic in code for now.
  generatePhysicsObject(config, new Vector3(0, 15, 0), true)
}

const defaultSpawnPosition = new Vector3()
const defaultScale = new Vector3(1, 1, 1)
const defaultTorqueForce = new Vector3(0, 0, -500)

export const generatePhysicsObject = (
  config: ShapeOptions,
  spawnPosition = defaultSpawnPosition,
  isNetworkObject = false,
  scale = defaultScale
) => {
  const type = config.type

  let geometry
  switch (type) {
    case 'box':
      geometry = new BoxGeometry(1, 1, 1)
      break

    case 'sphere':
      geometry = new SphereGeometry(0.5, 32, 16)
      break

    default:
      console.warn('Unspported type passed to test script!.')
  }

  const color = getColorForBodyType(config.bodyType ? config.bodyType : 0)
  const material = new MeshBasicMaterial({ color: color })
  const mesh = new Mesh(geometry, material)
  mesh.scale.set(2, 2, 2)

  mesh.userData['xrengine.collider.type'] = config.type
  mesh.userData['xrengine.collider.bodyType'] = config.bodyType
  mesh.userData['xrengine.collider.collisionLayer'] = config.collisionLayer
  mesh.userData['xrengine.collider.collisionMask'] = config.collisionMask
  mesh.userData['xrengine.collider.staticFriction'] = config.staticFriction
  mesh.userData['xrengine.collider.dynamicFriction'] = config.dynamicFriction
  mesh.userData['xrengine.collider.restitution'] = config.restitution

  // Add empty model node
  const entity = createEntity()
  const uuid = getUUID()
  let entityTreeNode = createEntityNode(entity, uuid)
  createNewEditorNode(entityTreeNode.entity, ScenePrefabs.model)

  const nameComponent = getComponent(entity, NameComponent)
  nameComponent.name = uuid

  const obj3d = mesh
  obj3d.scale.copy(scale)
  addComponent(entity, Object3DComponent, { value: obj3d })
  parseGLTFModel(entity, getComponent(entity, ModelComponent), obj3d)

  const world = useWorld()
  addEntityNodeInTree(entityTreeNode, world.entityTree.rootNode)

  const transform = getComponent(entity, TransformComponent)
  transform.position.copy(spawnPosition)
  const collider = getComponent(entity, ColliderComponent)
  const body = collider.body as PhysX.PxRigidDynamic
  teleportRigidbody(body, transform.position, transform.rotation)

  if (isNetworkObject && world.isHosting) {
    body.addTorque(defaultTorqueForce)
    console.info('spawning at:', transform.position.x, transform.position.y, transform.position.z)

    const node = world.entityTree.entityNodeMap.get(entity)
    if (node) {
      dispatchFrom(world.hostId, () =>
        NetworkWorldAction.spawnObject({
          prefab: '',
          parameters: { sceneEntityId: node.uuid, position: transform.position },
          ownerIndex: world.clients.get(Engine.userId)!.userIndex
        })
      ).cache()
    }
  }
}
