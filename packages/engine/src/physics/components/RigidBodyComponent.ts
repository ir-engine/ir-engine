import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'
import { Types } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { createMappedComponent, defineComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'

interface RigidBodyComponentType {
  body: RigidBody
  previousPosition: Vector3
  previousRotation: Quaternion
  previousLinearVelocity: Vector3
  previousAngularVelocity: Vector3
}

const { f32 } = Types
const Vector3Schema = { x: f32, y: f32, z: f32 }
const QuaternionSchema = { x: f32, y: f32, z: f32, w: f32 }
const SCHEMA = {
  previousPosition: Vector3Schema,
  previousRotation: QuaternionSchema,
  previousLinearVelocity: Vector3Schema,
  previousAngularVelocity: Vector3Schema
}

export const RigidBodyComponent = defineComponent<RigidBodyComponentType, typeof SCHEMA, RigidBodyComponentType>({
  name: 'RigidBodyComponent',
  schema: SCHEMA,

  onAdd: (entity) => {
    return {
      body: null!,
      previousPosition: new Vector3(),
      previousRotation: new Quaternion(),
      previousLinearVelocity: new Vector3(),
      previousAngularVelocity: new Vector3()
    }
  },

  onUpdate: (entity, component, json) => {
    if (typeof json.body === 'object') component.body = json.body as RigidBody
  },

  onRemove: (entity, component) => {
    const world = Engine.instance.currentWorld.physicsWorld
    const rigidBody = component.body
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
