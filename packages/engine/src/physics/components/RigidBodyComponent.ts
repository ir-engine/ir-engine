import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'
import { Types } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  createMappedComponent,
  defineComponent,
  getComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'

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
  schema: SCHEMA,

  onInit(entity) {
    return {
      body: null! as RigidBody,
      previousPosition: proxifyVector3(this.previousPosition, entity),
      previousRotation: proxifyQuaternion(this.previousRotation, entity),
      position: proxifyVector3(this.position, entity),
      rotation: proxifyQuaternion(this.rotation, entity),
      targetKinematicPosition: proxifyVector3(this.targetKinematicPosition, entity),
      targetKinematicRotation: proxifyQuaternion(this.targetKinematicRotation, entity),
      linearVelocity: proxifyVector3(this.linearVelocity, entity),
      angularVelocity: proxifyVector3(this.angularVelocity, entity),
      scale: proxifyVector3(this.scale, entity),
      /** If multiplier is 0, ridigbody moves immediately to target pose, linearly interpolating between substeps */
      targetKinematicLerpMultiplier: 0
    }
  },

  onSet: (entity, component, json: { body: RigidBody }) => {
    if (typeof json.body === 'object') component.body.set(json.body as RigidBody)
    else throw new Error('RigidBodyComponent expects a RigidBody instance')
  },

  onRemove: (entity, component) => {
    const world = Engine.instance.physicsWorld
    const rigidBody = component.body.value
    if (rigidBody) {
      const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody.bodyType())
      if (world.bodies.contains(rigidBody.handle)) {
        world.removeRigidBody(rigidBody)
      }
      removeComponent(entity, RigidBodyTypeTagComponent)
    }
  }
})

export const RigidBodyDynamicTagComponent = createMappedComponent<true>('RigidBodyDynamicTagComponent')
export const RigidBodyFixedTagComponent = createMappedComponent<true>('RigidBodyFixedTagComponent')
export const RigidBodyKinematicPositionBasedTagComponent = createMappedComponent<true>(
  'RigidBodyKinematicPositionBasedTagComponent'
)
export const RigidBodyKinematicVelocityBasedTagComponent = createMappedComponent<true>(
  'RigidBodyKinematicVelocityBasedTagComponent'
)

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
  const oldTypeTag = getTagComponentForRigidBody(rigidbody.body.bodyType())
  removeComponent(entity, oldTypeTag)
  rigidbody.body.setBodyType(type, false)
  const typeTag = getTagComponentForRigidBody(type)
  setComponent(entity, typeTag)
}
