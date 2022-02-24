import { BoxGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SphereGeometry } from 'three'
import { getColorForBodyType } from '../../debug/systems/DebugRenderer'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { parseGLTFModel } from '../../scene/functions/loadGLTFModel'
import { ScenePrefabs } from '../../scene/functions/registerPrefabs'
import { createNewEditorNode } from '../../scene/functions/SceneLoading'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionGroups } from '../enums/CollisionGroups'
import { BodyType, ColliderTypes } from '../types/PhysicsTypes'
import { ShapeOptions } from './createCollider'
import { teleportRigidbody } from './teleportRigidbody'

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

export const generateSimulationData = (numOfObjectsToGenerate) => {
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

  let config = {
    type: 'sphere' as ColliderTypes,
    bodyType: BodyType.DYNAMIC,
    collisionLayer: CollisionGroups.Default,
    collisionMask: CollisionGroups.Default | CollisionGroups.Avatars,
    staticFriction: 1,
    dynamicFriction: 1,
    restitution: 0.1
  }

  generatePhysicsObject(config)
}

export const generatePhysicsObject = (config: ShapeOptions) => {
  let type = config.type

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
  let entityTreeNode = new EntityTreeNode(entity, getUUID())
  createNewEditorNode(entityTreeNode.entity, ScenePrefabs.model)

  let nameComponent = getComponent(entity, NameComponent)
  nameComponent.name = 'test physics obj ' + Math.random().toString()

  let obj3d = getComponent(entity, Object3DComponent).value
  obj3d.add(mesh)
  console.log(obj3d.scale)
  parseGLTFModel(entity, getComponent(entity, ModelComponent), obj3d)

  const world = useWorld()
  world.entityTree.addEntityNode(entityTreeNode, world.entityTree.rootNode)

  // Spawn at some random position
  let transform = getComponent(entity, TransformComponent)
  transform.position.setComponent(1, 25)
  const collider = getComponent(entity, ColliderComponent)
  const body = collider.body as PhysX.PxRigidDynamic
  teleportRigidbody(body, transform.position, transform.rotation)

  // if (!world.isHosting) {
  //     const node = world.entityTree.findNodeFromEid(entity)
  //     if (node) {
  //     dispatchFrom(world.hostId, () =>
  //         NetworkWorldAction.spawnObject({
  //         prefab: '',
  //         parameters: { sceneEntityId: node.uuid },
  //         ownerIndex: world.clients.get(Engine.userId)!.userIndex
  //         })
  //     ).cache()
  //     }
  // }
}
