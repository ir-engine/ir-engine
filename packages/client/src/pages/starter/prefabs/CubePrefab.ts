/**
 * @author Mohsen Heydari <github.com/mohsenheydari>
 */

import { Group, MathUtils, Quaternion, Vector3, Mesh } from 'three'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { CollisionGroups } from '@xrengine/engine/src/physics/enums/CollisionGroups'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/interfaces/NetworkWorldActions'
import { dispatchFromServer } from '@xrengine/engine/src/networking/functions/dispatch'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { BodyType } from '@xrengine/engine/src/physics/types/PhysicsTypes'
import { CollisionComponent } from '@xrengine/engine/src/physics/components/CollisionComponent'
import { StarterGameCollisionGroups, StarterGamePrefabTypes } from '../StarterGameConstants'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { CubeComponent } from '../components/CubeComponent'

type CubeSpawnParameters = {
  spawnPosition: Vector3
}

interface CubeGroupType extends Group {
  userData: {
    meshObject: Mesh
  }
}

let cubeCounter = 0
const defaultCubeScale = 1.0

export const spawnCube = (position: Vector3): void => {
  const networkId = Network.getNetworkId()
  const uuid = MathUtils.generateUUID()

  const parameters: CubeSpawnParameters = {
    spawnPosition: new Vector3().copy(position)
  }

  // This spawns the cube on the server
  dispatchFromServer(NetworkWorldAction.createObject(networkId, uuid, StarterGamePrefabTypes.Cube, parameters))
}

function assetLoadCallback(group: Group, cubeEntity: Entity) {
  const nameComponent = getComponent(cubeEntity, NameComponent)
  const cubeMesh = group.children[0].clone(true) as Mesh
  cubeMesh.name = 'Cube' + nameComponent.uuid
  cubeMesh.castShadow = true
  cubeMesh.receiveShadow = true
  // Shift the cube so it aligns with the physics collider
  cubeMesh.position.set(0, -1, 0)

  const cubeGroup = new Group() as CubeGroupType
  cubeGroup.add(cubeMesh)
  addComponent(cubeEntity, Object3DComponent, { value: cubeGroup })
  cubeGroup.userData.meshObject = cubeMesh
}

export const updateCube = (entity: Entity): void => {
  // Add custom update logic to the cube entity
}

export const initializeCube = (cubeEntity: Entity, parameters: CubeSpawnParameters) => {
  const { spawnPosition } = parameters

  const transform = addComponent(cubeEntity, TransformComponent, {
    position: new Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z),
    rotation: new Quaternion(),
    scale: new Vector3().setScalar(defaultCubeScale)
  })

  cubeCounter++
  addComponent(cubeEntity, VelocityComponent, { velocity: new Vector3() })
  addComponent(cubeEntity, NameComponent, { name: `Cube-${cubeCounter}` })

  if (isClient) {
    const gltf = AssetLoader.getFromCache(Engine.publicPath + '/models/debug/cube.glb')
    assetLoadCallback(gltf.scene, cubeEntity)
  }

  const world = useWorld()

  const shape = world.physics.createShape(
    new PhysX.PxBoxGeometry(defaultCubeScale, defaultCubeScale, defaultCubeScale),
    world.physics.physics.createMaterial(0.2, 0.2, 0.9),
    {
      collisionLayer: StarterGameCollisionGroups.Cube,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Avatars
    }
  )

  const body = world.physics.addBody({
    shapes: [shape],
    // make static on server and remote player's balls so we can still detect collision with hole
    type: BodyType.DYNAMIC,
    transform: {
      translation: transform.position,
      rotation: new Quaternion()
    },
    userData: { entity: cubeEntity }
  })
  addComponent(cubeEntity, ColliderComponent, { body })
  addComponent(cubeEntity, CollisionComponent, { collisions: [] })

  addComponent(cubeEntity, CubeComponent, {
    number: cubeCounter
  })
}
