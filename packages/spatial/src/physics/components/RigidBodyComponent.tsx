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

import { Entity, S, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import { useEffect } from 'react'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Physics } from '../classes/Physics'
import { Body, BodyTypes } from '../types/PhysicsTypes'

import React from 'react'
import { QuatSchema, Vec3Schema } from '../../transform/components/TransformComponent'

const options = {
  deserialize: (curr, value) => curr.copy(value)
}

const assignVec3 = (property: string) => (entity: Entity) => proxifyVector3(RigidBodyComponent[property], entity)

const assignQuat = (property: string) => (entity: Entity) => proxifyQuaternion(RigidBodyComponent[property], entity)

export const RigidBodyComponent = defineComponent({
  name: 'RigidBodyComponent',
  jsonID: 'EE_rigidbody',
  schema: S.Object({
    type: S.Enum(BodyTypes, BodyTypes.Fixed),
    ccd: S.Bool(false),
    allowRolling: S.Bool(true),
    enabledRotations: S.Tuple([S.Bool(true), S.Bool(true), S.Bool(true)]),
    // rigidbody desc values
    canSleep: S.Bool(true),
    gravityScale: S.Number(1),
    // internal
    /** @deprecated  @todo make the physics api properly reactive to remove this property  */
    initialized: S.Bool(false),
    previousPosition: S.SoAProxyObject(assignVec3('previousPosition'), Vec3Schema, options),
    previousRotation: S.SoAProxyObject(assignQuat('previousRotation'), QuatSchema, options),
    position: S.SoAProxyObject(assignVec3('position'), Vec3Schema, options),
    rotation: S.SoAProxyObject(assignQuat('rotation'), QuatSchema, options),
    targetKinematicPosition: S.SoAProxyObject(assignVec3('targetKinematicPosition'), Vec3Schema, options),
    targetKinematicRotation: S.SoAProxyObject(assignQuat('targetKinematicRotation'), QuatSchema, options),
    linearVelocity: S.SoAProxyObject(assignVec3('linearVelocity'), Vec3Schema, options),
    angularVelocity: S.SoAProxyObject(assignVec3('angularVelocity'), Vec3Schema, options),
    /** If multiplier is 0, ridigbody moves immediately to target pose, linearly interpolating between substeps */
    targetKinematicLerpMultiplier: S.Number(0)
  }),

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

  reactor: () => {
    return <RigidBodyReactor />
  }
})

const RigidBodyReactor = () => {
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
