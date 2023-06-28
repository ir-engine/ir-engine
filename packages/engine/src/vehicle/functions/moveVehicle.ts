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

import { QueryFilterFlags } from '@dimforge/rapier3d-compat'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { smootheLerpAlpha } from '@etherealengine/common/src/utils/smootheLerpAlpha'
import { getState } from '@etherealengine/hyperflux'

import { ObjectDirection } from '../../common/constants/Axis3D'
import { V_000, V_010 } from '../../common/constants/MathConstants'
import checkPositionIsValid from '../../common/functions/checkPositionIsValid'
import { lerp } from '../../common/functions/MathLerpFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentType, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeAndUpdateWorldOrigin, updateWorldOrigin } from '../../transform/updateWorldOrigin'
import { getCameraMode, hasMovementControls, ReferenceSpace, XRState } from '../../xr/XRState'
import { VehicleComponent } from '../components/VehicleComponent'
import { VehicleControllerComponent } from '../components/VehicleControllerComponent'

const vehicleGroundRaycastDistanceIncrease = 0.5
const vehicleGroundRaycastDistanceOffset = 1
const vehicleGroundRaycastAcceptableDistance = 1.2

/**
 * raycast internals
 */
const vehicleGroundRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: ObjectDirection.Down,
  maxDistance: vehicleGroundRaycastDistanceOffset + vehicleGroundRaycastDistanceIncrease,
  groups: 0
}

const cameraDirection = new Vector3()
const forwardOrientation = new Quaternion()
const targetWorldMovement = new Vector3()
const desiredMovement = new Vector3()
const finalVehicleMovement = new Vector3()

const minimumDistanceSquared = 0.5 * 0.5
const currentDirection = new Vector3()
/**
 * Vehicle movement via gamepad
 */
export const applyGamepadInput = (entity: Entity) => {
  if (!entity) return

  const camera = Engine.instance.camera
  const deltaSeconds = getState(EngineState).simulationTimestep / 1000
  const controller = getComponent(entity, VehicleControllerComponent)
}
