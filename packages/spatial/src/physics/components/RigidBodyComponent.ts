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

import { Types } from 'bitecs'

import { useEntityContext } from '@etherealengine/ecs'
import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'

import { useImmediateEffect } from '@etherealengine/hyperflux'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Physics } from '../classes/Physics'
import { Body, BodyTypes } from '../types/PhysicsTypes'

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
  angularVelocity: Vector3Schema
}

export const RigidBodyComponent = defineComponent({
  name: 'RigidBodyComponent',
  jsonID: 'EE_rigidbody',
  schema: SCHEMA,

  onInit(entity) {
    return {
      type: 'fixed' as Body,
      ccd: false,
      allowRolling: true,
      enabledRotations: [true, true, true] as [boolean, boolean, boolean],
      // rigidbody desc values
      canSleep: true,
      gravityScale: 1,
      // internal
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
    if (!json) return

    if (typeof json.type === 'string') component.type.set(json.type)
    if (typeof json.ccd === 'boolean') component.ccd.set(json.ccd)
    if (typeof json.allowRolling === 'boolean') component.allowRolling.set(json.allowRolling)
    if (typeof json.canSleep === 'boolean') component.canSleep.set(json.canSleep)
    if (typeof json.gravityScale === 'number') component.gravityScale.set(json.gravityScale)
    if (
      Array.isArray(json.enabledRotations) &&
      json.enabledRotations.length === 3 &&
      typeof json.enabledRotations[0] === 'boolean' &&
      typeof json.enabledRotations[1] === 'boolean' &&
      typeof json.enabledRotations[2] === 'boolean'
    ) {
      component.enabledRotations.set(json.enabledRotations)
    }
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value as Body,
      ccd: component.ccd.value,
      allowRolling: component.allowRolling.value,
      enabledRotations: component.enabledRotations.value,
      canSleep: component.canSleep.value,
      gravityScale: component.gravityScale.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, RigidBodyComponent)
    const physicsWorld = Physics.useWorld(entity)!

    useImmediateEffect(() => {
      if (!physicsWorld) return
      Physics.createRigidBody(physicsWorld, entity)
      return () => {
        Physics.removeRigidbody(physicsWorld, entity)
      }
    }, [physicsWorld])

    useImmediateEffect(() => {
      if (!physicsWorld) return
      const type = component.type.value
      setComponent(entity, getTagComponentForRigidBody(type))
      Physics.setRigidBodyType(physicsWorld, entity, type)
      return () => {
        removeComponent(entity, getTagComponentForRigidBody(type))
      }
    }, [physicsWorld, component.type])

    useImmediateEffect(() => {
      if (!physicsWorld) return
      Physics.enabledCcd(physicsWorld, entity, component.ccd.value)
    }, [physicsWorld, component.ccd])

    useImmediateEffect(() => {
      if (!physicsWorld) return
      const value = component.allowRolling.value
      /**
       * @todo Change this back to `Physics.lockRotations( entity, !value )` when we update to Rapier >= 0.12.0
       * https://github.com/dimforge/rapier.js/issues/282  */
      Physics.setEnabledRotations(physicsWorld, entity, [value, value, value])
    }, [component.allowRolling.value])

    useImmediateEffect(() => {
      if (!physicsWorld) return
      Physics.setEnabledRotations(physicsWorld, entity, component.enabledRotations.value as [boolean, boolean, boolean])
    }, [component.enabledRotations[0].value, component.enabledRotations[1].value, component.enabledRotations[2].value])

    return null
  }
})

export const RigidBodyDynamicTagComponent = defineComponent({ name: 'RigidBodyDynamicTagComponent' })
export const RigidBodyFixedTagComponent = defineComponent({ name: 'RigidBodyFixedTagComponent' })
export const RigidBodyKinematicTagComponent = defineComponent({ name: 'RigidBodyKinematicTagComponent' })

type RigidBodyTypes =
  | typeof RigidBodyDynamicTagComponent
  | typeof RigidBodyFixedTagComponent
  | typeof RigidBodyKinematicTagComponent

export const getTagComponentForRigidBody = (type: Body): RigidBodyTypes => {
  switch (type) {
    case BodyTypes.Dynamic:
      return RigidBodyDynamicTagComponent
    case BodyTypes.Fixed:
      return RigidBodyFixedTagComponent
    case BodyTypes.Kinematic:
      return RigidBodyKinematicTagComponent
  }
}
