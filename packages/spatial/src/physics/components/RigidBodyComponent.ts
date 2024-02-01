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

import { RigidBody, RigidBodyDesc, RigidBodyType } from '@dimforge/rapier3d-compat'
import { Types } from 'bitecs'

import { useEntityContext } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { getState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Physics } from '../classes/Physics'
import { PhysicsState } from '../state/PhysicsState'
import { Body } from '../types/PhysicsTypes'

const { f64 } = Types
const Vector3Schema = { x: f64, y: f64, z: f64 }
const QuaternionSchema = { x: f64, y: f64, z: f64, w: f64 }
const SCHEMA = {
  previousPosition: Vector3Schema,
  previousRotation: QuaternionSchema,
  position: Vector3Schema,
  rotation: QuaternionSchema,
  targetKinematicPosition: Vector3Schema,
  targetKinematicRotation: QuaternionSchema,
  linearVelocity: Vector3Schema,
  angularVelocity: Vector3Schema,
  scale: Vector3Schema
}

export const RigidBodyComponent = defineComponent({
  name: 'RigidBodyComponent',
  jsonID: 'ee_rigidbody',
  schema: SCHEMA,

  onInit(entity) {
    return {
      type: 'fixed' as Body,
      body: null as RigidBody | null,
      previousPosition: proxifyVector3(this.previousPosition, entity),
      previousRotation: proxifyQuaternion(this.previousRotation, entity),
      position: proxifyVector3(this.position, entity),
      rotation: proxifyQuaternion(this.rotation, entity),
      targetKinematicPosition: proxifyVector3(this.targetKinematicPosition, entity),
      targetKinematicRotation: proxifyQuaternion(this.targetKinematicRotation, entity),
      linearVelocity: proxifyVector3(this.linearVelocity, entity),
      angularVelocity: proxifyVector3(this.angularVelocity, entity),
      /** If multiplier is 0, ridigbody moves immediately to target pose, linearly interpolating between substeps */
      targetKinematicLerpMultiplier: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) throw new Error('no RigidBodyComponent supplied ' + entity)

    if (component.body.value !== null) throw new Error('RigidBodyComponent already initialized ' + entity)

    /** backwards compatibility for manually creating rigidbodies */
    if (typeof json.body === 'object') component.body.set(json.body)
    else {
      if (typeof json.type === 'string') component.type.set(json.type)
    }
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value as Body
    }
  },

  onRemove: (entity, component) => {
    const world = getState(PhysicsState).physicsWorld
    const rigidBody = component.body.value
    if (rigidBody) {
      const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody.bodyType())
      if (world.bodies.contains(rigidBody.handle)) {
        world.removeRigidBody(rigidBody)
      }
      removeComponent(entity, RigidBodyTypeTagComponent)
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, RigidBodyComponent)

    useEffect(() => {
      let rigidBodyDesc: RigidBodyDesc = undefined!
      switch (component.type.value) {
        case 'dynamic':
        default:
          rigidBodyDesc = RigidBodyDesc.dynamic()
          break

        case 'fixed':
          rigidBodyDesc = RigidBodyDesc.fixed()
          break

        case 'kinematic':
          rigidBodyDesc = RigidBodyDesc.kinematicPositionBased()
          break
      }

      Physics.createRigidBody(entity, getState(PhysicsState).physicsWorld, rigidBodyDesc)

      return () => {
        Physics.removeRigidBody(entity, getState(PhysicsState).physicsWorld)
      }
    }, [component.type])

    return null
  }
})

export const RigidBodyDynamicTagComponent = defineComponent({ name: 'RigidBodyDynamicTagComponent' })
export const RigidBodyFixedTagComponent = defineComponent({ name: 'RigidBodyFixedTagComponent' })
export const RigidBodyKinematicPositionBasedTagComponent = defineComponent({
  name: 'RigidBodyKinematicPositionBasedTagComponent'
})
export const RigidBodyKinematicVelocityBasedTagComponent = defineComponent({
  name: 'RigidBodyKinematicVelocityBasedTagComponent'
})

type RigidBodyTypes =
  | typeof RigidBodyDynamicTagComponent
  | typeof RigidBodyFixedTagComponent
  | typeof RigidBodyKinematicPositionBasedTagComponent
  | typeof RigidBodyKinematicVelocityBasedTagComponent

export const getTagComponentForRigidBody = (type: RigidBodyType): RigidBodyTypes => {
  switch (type) {
    case RigidBodyType.Dynamic:
      return RigidBodyDynamicTagComponent

    case RigidBodyType.Fixed:
      return RigidBodyFixedTagComponent

    case RigidBodyType.KinematicPositionBased:
      return RigidBodyKinematicPositionBasedTagComponent

    case RigidBodyType.KinematicVelocityBased:
      return RigidBodyKinematicVelocityBasedTagComponent
  }
}

export const setRigidBodyType = (entity: Entity, type: RigidBodyType) => {
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const oldTypeTag = getTagComponentForRigidBody(rigidbody.body!.bodyType())
  removeComponent(entity, oldTypeTag)
  rigidbody.body!.setBodyType(type, false)
  const typeTag = getTagComponentForRigidBody(type)
  setComponent(entity, typeTag)
}
