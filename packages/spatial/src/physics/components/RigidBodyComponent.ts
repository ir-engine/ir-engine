/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import { ECSSchema } from '@ir-engine/ecs/src/ComponentSchemaUtils'
import { useEffect } from 'react'
import { QuaternionProxy, Vec3Proxy } from '../../common/proxies/createThreejsProxy'
import { Physics } from '../classes/Physics'
import { Body, BodyTypes } from '../types/PhysicsTypes'

const SCHEMA = {
  previousPosition: ECSSchema.Vec3,
  previousRotation: ECSSchema.Quaternion,
  position: ECSSchema.Vec3,
  rotation: ECSSchema.Quaternion,
  targetKinematicPosition: ECSSchema.Vec3,
  targetKinematicRotation: ECSSchema.Quaternion,
  linearVelocity: ECSSchema.Vec3,
  angularVelocity: ECSSchema.Vec3
}

export const RigidBodyComponent = defineComponent({
  name: 'RigidBodyComponent',
  jsonID: 'EE_rigidbody',
  schema: SCHEMA,

  onInit(initial) {
    return {
      type: 'fixed' as Body,
      ccd: false,
      allowRolling: true,
      enabledRotations: [true, true, true] as [boolean, boolean, boolean],
      // rigidbody desc values
      canSleep: true,
      gravityScale: 1,
      // internal
      /** @deprecated  @todo make the physics api properly reactive to remove this property  */
      initialized: false,
      previousPosition: Vec3Proxy(initial.previousPosition),
      previousRotation: QuaternionProxy(initial.previousRotation),
      position: Vec3Proxy(initial.position),
      rotation: QuaternionProxy(initial.rotation),
      targetKinematicPosition: Vec3Proxy(initial.targetKinematicPosition),
      targetKinematicRotation: QuaternionProxy(initial.targetKinematicRotation),
      linearVelocity: Vec3Proxy(initial.linearVelocity),
      angularVelocity: Vec3Proxy(initial.angularVelocity),
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

  toJSON: (component) => {
    return {
      type: component.type,
      ccd: component.ccd,
      allowRolling: component.allowRolling,
      enabledRotations: component.enabledRotations,
      canSleep: component.canSleep,
      gravityScale: component.gravityScale
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, RigidBodyComponent)
    const physicsWorld = Physics.useWorld(entity)!

    useEffect(() => {
      if (!physicsWorld) return
      Physics.createRigidBody(physicsWorld, entity)
      component.initialized.set(true)
      return () => {
        Physics.removeRigidbody(physicsWorld, entity)
        if (!hasComponent(entity, RigidBodyComponent)) return
        component.initialized.set(false)
      }
    }, [physicsWorld])

    useEffect(() => {
      if (!physicsWorld) return
      const type = component.type.value
      setComponent(entity, getTagComponentForRigidBody(type))
      Physics.setRigidBodyType(physicsWorld, entity, type)
      return () => {
        removeComponent(entity, getTagComponentForRigidBody(type))
      }
    }, [physicsWorld, component.type])

    useEffect(() => {
      if (!physicsWorld) return
      Physics.enabledCcd(physicsWorld, entity, component.ccd.value)
    }, [physicsWorld, component.ccd])

    useEffect(() => {
      if (!physicsWorld) return
      const value = component.allowRolling.value
      /**
       * @todo Change this back to `Physics.lockRotations( entity, !value )` when we update to Rapier >= 0.12.0
       * https://github.com/dimforge/rapier.js/issues/282  */
      Physics.setEnabledRotations(physicsWorld, entity, [value, value, value])
    }, [component.allowRolling.value])

    useEffect(() => {
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
