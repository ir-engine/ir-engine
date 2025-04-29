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
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import React, { useEffect } from 'react'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Physics } from '../classes/Physics'
import { Body, BodyTypes } from '../types/PhysicsTypes'

import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { Quaternion, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

const options = {
  deserialize: (curr, value) => curr.copy(value)
}

const assignVec3 =
  (property: string) =>
  (entity: Entity): Vector3 =>
    proxifyVector3(RigidBodyComponent[property], entity)

const assignQuat =
  (property: string) =>
  (entity: Entity): Quaternion =>
    proxifyQuaternion(RigidBodyComponent[property], entity)

export const RigidBodyComponent = defineComponent({
  name: 'RigidBodyComponent',
  jsonID: 'EE_rigidbody',
  schema: S.Object({
    type: S.Enum(BodyTypes, BodyTypes.Fixed),
    ccd: S.Bool(false),
    allowRolling: S.Bool(true),
    enabledRotations: S.Tuple([S.Bool(), S.Bool(), S.Bool()], [true, true, true]),
    // rigidbody desc values
    canSleep: S.Bool(true),
    gravityScale: S.Number(1),
    // internal
    /** @deprecated  @todo make the physics api properly reactive to remove this property  */
    initialized: S.NonSerialized(S.Bool(false)),
    previousPosition: S.NonSerialized(T.Vec3(assignVec3('previousPosition'))),
    previousRotation: S.NonSerialized(T.Quaternion(assignQuat('previousRotation'))),
    position: S.NonSerialized(T.Vec3(assignVec3('position'))),
    rotation: S.NonSerialized(T.Quaternion(assignQuat('rotation'))),
    targetKinematicPosition: S.NonSerialized(T.Vec3(assignVec3('targetKinematicPosition'))),
    targetKinematicRotation: S.NonSerialized(T.Quaternion(assignQuat('targetKinematicRotation'))),
    linearVelocity: S.NonSerialized(T.Vec3(assignVec3('linearVelocity'))),
    angularVelocity: S.NonSerialized(T.Vec3(assignVec3('angularVelocity'))),
    /** If multiplier is 0, ridigbody moves immediately to target pose, linearly interpolating between substeps */
    targetKinematicLerpMultiplier: S.NonSerialized(S.Number(0))
  }),

  storage: {
    previousPosition: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    previousRotation: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array),
      w: createResizableTypeArray(Float64Array)
    },
    position: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    rotation: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array),
      w: createResizableTypeArray(Float64Array)
    },
    targetKinematicPosition: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    targetKinematicRotation: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array),
      w: createResizableTypeArray(Float64Array)
    },
    linearVelocity: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    angularVelocity: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
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
    if (!component.initialized.value) return
    TransformComponent.dirty[entity] = 1
  }, [component.initialized.value])

  useEffect(() => {
    if (!physicsWorld) return
    Physics.createRigidBody(physicsWorld, entity)
    component.initialized.set(true)
    return () => {
      Physics.removeRigidbody(physicsWorld, entity)
      if (!hasComponent(entity, RigidBodyComponent)) return
      getMutableComponent(entity, RigidBodyComponent).initialized.set(false)
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
