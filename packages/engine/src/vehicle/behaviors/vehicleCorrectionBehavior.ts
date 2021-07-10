/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Euler, Quaternion } from 'three'
import { Behavior } from '../../common/interfaces/Behavior'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { VehicleComponent } from '../components/VehicleComponent'
import { vehicleInterpolationBehavior } from './vehicleInterpolationBehavior'

export const vehicleCorrectionBehavior: Behavior = (entity: Entity, args): void => {
  const vehicleComponent = getComponent(entity, VehicleComponent) as VehicleComponent
  const vehicle = vehicleComponent.vehiclePhysics
  const chassisBody = vehicle.chassisBody
  const isDriver = vehicleComponent.driver == Network.instance.localAvatarNetworkId

  if (isDriver) {
    args.state.push({
      networkId: args.networkId,
      x: chassisBody.position.x,
      y: chassisBody.position.y,
      z: chassisBody.position.z,
      qX: chassisBody.quaternion.x,
      qY: chassisBody.quaternion.y,
      qZ: chassisBody.quaternion.z,
      qW: chassisBody.quaternion.w
    })
  }

  if (args.correction == null || args.snapshot == null) return

  const isPassenger = vehicleComponent.passenger == Network.instance.localAvatarNetworkId
  // for passager
  if (isPassenger) {
    if (args.interpolation == null) return
    vehicleInterpolationBehavior(entity, { snapshot: args.interpolation })
    return
  }

  const isMoved = vehicleComponent.isMoved
  const wheels = vehicleComponent.arrayWheelsMesh

  const carSpeed = vehicle.currentVehicleSpeedKmHour
  const correction = 180 - carSpeed / 4

  let offsetX = 0,
    offsetY = 0,
    offsetZ = 0
  offsetX = args.correction.x - args.snapshot.x
  offsetY = args.correction.y - args.snapshot.y
  offsetZ = args.correction.z - args.snapshot.z

  const sumOffset = Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ)
  if (sumOffset > 15) {
    chassisBody.position.x = args.snapshot.x
    chassisBody.position.y = args.snapshot.y
    chassisBody.position.z = args.snapshot.z
    chassisBody.quaternion.x = args.snapshot.qX
    chassisBody.quaternion.y = args.snapshot.qY
    chassisBody.quaternion.z = args.snapshot.qZ
    chassisBody.quaternion.w = args.snapshot.qW
  } else if (sumOffset > 0.01) {
    chassisBody.position.x -= offsetX / correction
    chassisBody.position.y -= offsetY / correction
    chassisBody.position.z -= offsetZ / correction
  }

  let offsetqX = 0,
    offsetqY = 0,
    offsetqZ = 0
  let clientSnapshotEuler = null,
    interpolationSnapshotEuler = null,
    chassisBodyEuler = null,
    correctionQuaternion = null

  clientSnapshotEuler = new Euler().setFromQuaternion(
    new Quaternion().set(args.correction.qX, args.correction.qY, args.correction.qZ, args.correction.qW)
  )

  interpolationSnapshotEuler = new Euler().setFromQuaternion(
    new Quaternion().set(args.snapshot.qX, args.snapshot.qY, args.snapshot.qZ, args.snapshot.qW)
  )

  offsetqX = clientSnapshotEuler.x - interpolationSnapshotEuler.x
  offsetqY = clientSnapshotEuler.y - interpolationSnapshotEuler.y
  offsetqZ = clientSnapshotEuler.z - interpolationSnapshotEuler.z

  if (Math.abs(offsetqY) > 0.001) {
    // TO DO rotation quaternion with out Euler transforms
    chassisBodyEuler = new Euler().setFromQuaternion(
      new Quaternion().set(
        chassisBody.quaternion.x,
        chassisBody.quaternion.y,
        chassisBody.quaternion.z,
        chassisBody.quaternion.w
      )
    )

    correctionQuaternion = new Quaternion().setFromEuler(
      new Euler().set(chassisBodyEuler.x, chassisBodyEuler.y - offsetqY / correction, chassisBodyEuler.z)
    )

    chassisBody.quaternion.set(
      correctionQuaternion.x,
      correctionQuaternion.y,
      correctionQuaternion.z,
      correctionQuaternion.w
    )
  }

  for (let i = 0; i < wheels.length; i++) {
    wheels[i].position.set(
      vehicle.wheelInfos[i].worldTransform.position.x,
      vehicle.wheelInfos[i].worldTransform.position.y,
      vehicle.wheelInfos[i].worldTransform.position.z
    )
    wheels[i].quaternion.set(
      vehicle.wheelInfos[i].worldTransform.quaternion.x,
      vehicle.wheelInfos[i].worldTransform.quaternion.y,
      vehicle.wheelInfos[i].worldTransform.quaternion.z,
      vehicle.wheelInfos[i].worldTransform.quaternion.w
    )
  }
}

export const createNewVehicleCorrection: Behavior = (entity: Entity, args): void => {}
