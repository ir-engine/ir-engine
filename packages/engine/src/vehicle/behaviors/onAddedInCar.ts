import { Euler, Matrix4, Vector3 } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { CameraModes } from '../../camera/types/CameraModes'
import { initializeDriverState } from '../../character/animations/DrivingAnimations'
import { CharacterAnimations } from '../../character/CharacterAnimations'
import { CharacterComponent } from '../../character/components/CharacterComponent'
import { changeAnimation } from '../../character/functions/updateVectorAnimation'
import { Entity } from '../../ecs/classes/Entity'
import { getMutableComponent, getComponent, addComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver'
import { Network } from '../../networking/classes/Network'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { PlayerInCar } from '../components/PlayerInCar'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VehicleComponent } from '../components/VehicleComponent'
import { VehicleState } from '../enums/VehicleStateEnum'
import { ControllerColliderComponent } from '../../character/components/ControllerColliderComponent'
import { isClient } from '../../common/functions/isClient'

/**
 * @author HydraFire <github.com/HydraFire>
 * @param entity is the entity to handle state changes to
 * @param seat idex array of seats
 */

function positionEnter (entity, entityCar, seat) {
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent)
  const vehicle = getComponent<VehicleComponent>(entityCar, VehicleComponent)
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent)

  const position = new Vector3(...vehicle.entrancesArray[seat])
    .applyQuaternion(transformCar.rotation)
    .add(transformCar.position)
    .setY(transform.position.y)

  transform.position.set(
    position.x,
    position.y,
    position.z
  )

  transform.rotation.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transformCar.rotation),
      new Matrix4().makeRotationY(-Math.PI / 2)
    )
  )
  //  console.warn(new Euler().setFromQuaternion(transformCar.rotation).y);
  return (new Euler().setFromQuaternion(transformCar.rotation)).y
}

export const onAddedInCar = (entity: Entity, entityCar: Entity, seat: number, delta: number): void => {
  const networkDriverId = getComponent<NetworkObject>(entity, NetworkObject).networkId
  const vehicle = getMutableComponent<VehicleComponent>(entityCar, VehicleComponent)
  vehicle[vehicle.seatPlane[seat]] = networkDriverId

  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
  PhysicsSystem.instance.removeController(collider.controller)

  const orientation = positionEnter(entity, entityCar, seat)
  getMutableComponent(entity, PlayerInCar).state = VehicleState.onAddEnding

  // CLIENT
  initializeDriverState(entity)

  changeAnimation(entity, {
    animationId: CharacterAnimations.ENTERING_VEHICLE_DRIVER,
    transitionDuration: 0.3
  })

  if (!isClient || Network.instance.localAvatarNetworkId !== networkDriverId) return
  addComponent(entityCar, LocalInputReceiver)
  removeComponent(entity, FollowCameraComponent)
  addComponent(entity, FollowCameraComponent, {
    distance: 7,
    locked: false,
    mode: CameraModes.ThirdPerson,
    theta: Math.round(((270 / Math.PI) * (orientation / 3 * 2)) + 180),
    phi: 20,
    collisionMask: CollisionGroups.Default | CollisionGroups.Car
  })
}
