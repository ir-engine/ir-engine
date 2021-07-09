import { Matrix4, Vector3 } from 'three'
import { CharacterAnimations } from '../../character/CharacterAnimations'
import { changeAnimation } from '../../character/functions/updateVectorAnimation'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { PlayerInCar } from '../components/PlayerInCar'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VehicleComponent } from '../components/VehicleComponent'
import { VehicleState } from '../enums/VehicleStateEnum'
import { isClient } from '../../common/functions/isClient'

/**
 * @author HydraFire <github.com/HydraFire>
 * @param entity is the entity to handle state changes to
 * @param seat idex array of seats
 */

function doorAnimation (entityCar, seat, timer, timeAnimation, angel) {
  const vehicle = getComponent<VehicleComponent>(entityCar, VehicleComponent)
  const mesh = vehicle.vehicleDoorsArray[seat]
  if (mesh === undefined) return
  const andelPetTick = angel / (timeAnimation / 2)
  if (timer > (timeAnimation / 2)) {
    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeRotationY(
      mesh.position.x > 0 ? -((timeAnimation - timer) * andelPetTick) : (timeAnimation - timer) * andelPetTick
    ))
  } else {
    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeRotationY(
      mesh.position.x > 0 ? -(timer * andelPetTick) : (timer * andelPetTick)
    ))
  }
}

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
}

export const onAddEndingInCar = (entity: Entity, entityCar: Entity, seat: number, delta: number): void => {
  const playerInCar = getMutableComponent(entity, PlayerInCar)

  const carTimeOut = playerInCar.timeOut//! isClient ? playerInCar.timeOut / delta : playerInCar.timeOut;

  playerInCar.currentFrame += playerInCar.animationSpeed

  doorAnimation(entityCar, seat, playerInCar.currentFrame, carTimeOut, playerInCar.angel)
  positionEnter(entity, entityCar, seat)
  let timeOut = false

  if (playerInCar.currentFrame > carTimeOut) {
    playerInCar.currentFrame = 0
    timeOut = true
    getMutableComponent(entity, PlayerInCar).state = VehicleState.onUpdate
  }

  if (!isClient) return

  if (timeOut) {
    changeAnimation(entity, {
      animationId: CharacterAnimations.DRIVING,
      transitionDuration: 0.3
    })
  }
}
