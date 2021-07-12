import { VehicleInputSchema } from '../VehicleInputSchema'
import { getInCar } from '../behaviors/getInCarBehavior'
import { getInCarPossible } from '../behaviors/getInCarPossible'
import { VehicleComponent } from '../components/VehicleComponent'
import { vehicleInterpolationBehavior } from '../behaviors/vehicleInterpolationBehavior'
import { vehicleCorrectionBehavior } from '../behaviors/vehicleCorrectionBehavior'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { Input } from '../../input/components/Input'
import { Interactable } from '../../interaction/components/Interactable'
import { Network } from '../../networking/classes/Network'
import { initializeNetworkObject } from '../../networking/functions/initializeNetworkObject'
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab'
import { PrefabType } from '../../networking/templates/PrefabType'
import { InterpolationComponent } from '../../physics/components/InterpolationComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

function castShadowOn(group) {
  group.children.forEach((children) => {
    if (children.type == 'Mesh') {
      children.castShadow = true
    }
  })
}

export const parseCarModel = (groupMeshes: any, mode = 'location') => {
  if (!groupMeshes) return
  const deleteArr = []
  const vehicleCompData = {
    vehicleMesh: true,
    vehicleDoorsArray: [],
    interactionPartsPosition: [],
    seatsArray: [],
    entrancesArray: [],
    arrayWheelsPosition: [],
    arrayWheelsMesh: [],
    vehicleSphereColliders: [],
    suspensionRestLength: 0,
    mass: 35,
    startPosition: [groupMeshes.position.x, groupMeshes.position.y, groupMeshes.position.z],
    startQuaternion: [
      groupMeshes.quaternion.x,
      groupMeshes.quaternion.y,
      groupMeshes.quaternion.z,
      groupMeshes.quaternion.w
    ]
  }
  // copy position from editor position model
  groupMeshes.position.set(0, 0, 0)
  groupMeshes.quaternion.set(0, 0, 0, 0)
  // Parse Meshes to functionality parts
  groupMeshes.traverse((mesh) => {
    // add optimized shadow
    isClient && mode != 'editor' && mesh.userData.data === 'castShadow' ? castShadowOn(mesh) : ''
    // parse meshes to functionality parts of car
    switch (mesh.name) {
      case 'body':
        //  isClient && mode != 'editor' ? vehicleCompData.vehicleMesh = mesh:'';
        // @ts-ignore
        mesh.userData.mass != undefined ? (vehicleCompData.mass = parseFloat(mesh.userData.mass)) : 35
        break

      case 'door_front_left':
      case 'door_front_right':
        isClient && mode != 'editor' ? vehicleCompData.vehicleDoorsArray.push(mesh) : ''
        vehicleCompData.interactionPartsPosition.push([mesh.position.x, mesh.position.y, mesh.position.z])
        break

      case 'seat_front_left':
      case 'seat_front_right':
        vehicleCompData.seatsArray.push([mesh.position.x, mesh.position.y, mesh.position.z])
        break

      case 'entrance_front_left':
      case 'entrance_front_right':
        vehicleCompData.entrancesArray.push([mesh.position.x, mesh.position.y, mesh.position.z])
        break

      case 'wheel_front_left':
      case 'wheel_front_right':
      case 'wheel_rear_left':
      case 'wheel_rear_right':
        const clonedMesh = mesh.clone()
        isClient && mode != 'editor' ? deleteArr.push(mesh) : ''
        vehicleCompData.arrayWheelsPosition.push([mesh.position.x, mesh.position.y, mesh.position.z])
        isClient && mode != 'editor' ? vehicleCompData.arrayWheelsMesh.push(clonedMesh) : ''
        isClient && mode != 'editor' ? Engine.scene.add(clonedMesh) : ''
        // @ts-ignore
        mesh.userData.restLength != undefined
          ? (vehicleCompData.suspensionRestLength = parseFloat(mesh.userData.restLength))
          : ''
        break

      case 'steering_wheel':
        // to do
        break
    }
    // parse colliders of car
    switch (mesh.userData.type) {
      case 'sphere':
        vehicleCompData.vehicleSphereColliders.push(mesh)
        deleteArr.push(mesh)
        break
      case 'trimesh':
        vehicleCompData.vehicleSphereColliders.push(mesh)
        deleteArr.push(mesh)
        break
    }
  })

  // delete colliders and else mesh from threejs scene
  for (let i = 0; i < deleteArr.length; i++) {
    deleteArr[i].parent.remove(deleteArr[i])
  }

  return vehicleCompData
}

function addCollidersShapeInOneBody(entity: Entity, addShapeArray, mass = 0) {
  throw new Error('VEHICLES NOT IMPLEMENTED - PHYSX REFACTOR')
  // console.warn(mass);
  // const body = new Body({mass});
  // for (let i = 0; i < addShapeArray.length; i++) {
  //   const shape = addCollidersToNetworkVehicle({ entity,
  //     parameters: {
  //       type: addShapeArray[i].userData.type,
  //       scale: addShapeArray[i].scale,
  //       position: addShapeArray[i].position,
  //       quaternion: addShapeArray[i].quaternion,
  //       mesh: addShapeArray[i].userData.type === 'trimesh' ? addShapeArray[i] : null
  //     }
  //   });
  //   body.addShape(shape.shape, new Vec3(shape.position.x, shape.position.y, shape.position.z));
  // }
  // return body;
}

export function addCollidersToNetworkVehicle(args: { parameters?: any; entity?: Entity }) {
  throw new Error('VEHICLES NOT IMPLEMENTED - PHYSX REFACTOR')
  // let shape = null;
  // switch (args.parameters.type) {
  //   case 'box':
  //     shape = createBoxCollider(args.parameters.scale);
  //     break;

  //   case 'cylinder':
  //     shape = createCylinderCollider(args.parameters.scale);
  //     break;

  //   case 'sphere':
  //     shape = createSphereCollider(args.parameters.scale);
  //     break;

  //   case 'trimesh':
  // 		if (args.parameters.mesh != null && args.parameters.mesh != undefined) {
  // 			shape = createTrimeshFromMesh(args.parameters.mesh);
  // 		} else if (args.parameters.vertices != null && args.parameters.vertices != undefined) {
  // 			shape = createTrimeshFromArrayVertices(args.parameters.vertices, args.parameters.indices);
  // 		} else {
  // 			console.warn('!!! dont have any mesh or vertices array to create trimesh');
  // 			return;
  // 		}
  //     break;

  //   default:
  //     console.warn('create Collider undefined type !!!');
  //     shape = createBoxCollider(args.parameters.scale || {x:1, y:1, z:1});
  //     break;
  // }
  // return { shape: shape, position: args.parameters.position};
}

export function createVehicleFromSceneData(entity: Entity, args: any) {
  createNetworkVehicle({
    parameters: {
      vehicleCollider: addCollidersShapeInOneBody(entity, [], args.mass),
      seatsArray: args.seatsArray,
      entrancesArray: args.entrancesArray,
      arrayWheelsPosition: args.arrayWheelsPosition,
      suspensionRestLength: args.suspensionRestLength,
      startPosition: [...args.startPosition],
      startQuaternion: [...args.startQuaternion],
      interactionPartsPosition: args.interactionPartsPosition
    },
    //@ts-ignore
    uniqueId: args.sceneEntityId,
    entity: entity
  })
}

export function createVehicleFromModel(entity: Entity, mesh: any, sceneEntityId: string) {
  const parameters = parseCarModel(mesh)
  console.warn(parameters.mass)
  createNetworkVehicle({
    parameters: {
      vehicleCollider: addCollidersShapeInOneBody(entity, parameters.vehicleSphereColliders, parameters.mass),
      vehicleMesh: parameters.vehicleMesh,
      seatsArray: parameters.seatsArray,
      vehicleDoorsArray: parameters.vehicleDoorsArray,
      arrayWheelsMesh: parameters.arrayWheelsMesh,
      entrancesArray: parameters.entrancesArray,
      arrayWheelsPosition: parameters.arrayWheelsPosition,
      suspensionRestLength: parameters.suspensionRestLength,
      startPosition: [...parameters.startPosition],
      startQuaternion: [...parameters.startQuaternion],
      interactionPartsPosition: parameters.interactionPartsPosition
    },
    //@ts-ignore
    uniqueId: sceneEntityId,
    entity: entity
  })
}

export function createNetworkVehicle(args: {
  parameters?: any
  networkId?: string | number
  uniqueId: string
  entity?: Entity
}) {
  const networkComponent = initializeNetworkObject({
    entity: args.entity,
    prefabType: PrefabType.Vehicle,
    uniqueId: args.uniqueId,
    ownerId: null,
    override: {
      networkComponents: [
        {
          type: VehicleComponent,
          data: args.parameters
        },
        {
          type: Interactable,
          data: {
            interactionParts: ['door_front_left', 'door_front_right'],
            onInteraction: getInCar,
            onInteractionCheck: getInCarPossible,
            //onInteractionFocused: onInteractionHover,
            //@ts-ignore
            interactionPartsPosition: args.parameters.interactionPartsPosition,
            data: {
              interactionText: 'get in car'
            }
          }
        }
      ]
    }
  })
  if (!isClient) {
    Network.instance.worldState.createObjects.push({
      networkId: networkComponent.networkId,
      ownerId: networkComponent.ownerId,
      prefabType: PrefabType.Vehicle,
      uniqueId: networkComponent.uniqueId,
      parameters: ''
    })
  }
}

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkVehicle: NetworkPrefab = {
  initialize: createNetworkVehicle,
  // These will be created for all players on the network
  networkComponents: [
    { type: TransformComponent },
    { type: Input, data: { schema: VehicleInputSchema } },
    { type: VehicleComponent },
    { type: Interactable }
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  clientComponents: [{ type: InterpolationComponent }],
  serverComponents: [],
  onAfterCreate: [],
  onBeforeDestroy: []
}
