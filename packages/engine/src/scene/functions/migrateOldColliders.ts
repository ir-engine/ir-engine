import { RigidBodyType } from '@dimforge/rapier3d-compat'
import { ComponentJsonType, EntityJsonType } from '@etherealengine/common/src/schema.type.module'
import { SerializedComponentType } from '@etherealengine/ecs'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { ColliderComponent as OldColliderComponent } from '../components/ColliderComponent'

/**
 * Converts old ColliderComponent to RigidbodyComponent, new ColliderComponent and TriggerComponent
 * - ModelComponent handles making children components
 */
export const migrateFromOldComponent = (oldJSON: EntityJsonType) => {
  /** Model handles migration */
  const newComponents = [] as ComponentJsonType[]
  for (const component of oldJSON.components) {
    if (component.name !== OldColliderComponent.jsonID) continue

    const data = component.props as SerializedComponentType<typeof OldColliderComponent>
    /** shapeType is undefined for GLTF metadata */
    // if (typeof data.shapeType === 'undefined') continue
    newComponents.push({
      name: RigidBodyComponent.jsonID,
      props: {
        type:
          data.bodyType === RigidBodyType.Fixed
            ? 'fixed'
            : data.bodyType === RigidBodyType.Dynamic
            ? 'dynamic'
            : 'kinematic'
      }
    })
    newComponents.push({
      name: ColliderComponent.jsonID,
      props: {
        shape: data.shapeType,
        collisionLayer: data.collisionLayer,
        collisionMask: data.collisionMask,
        restitution: data.restitution
      }
    })
    if (data.isTrigger) {
      newComponents.push({
        name: TriggerComponent.jsonID,
        props: data.triggers
      })
    }
  }

  if (!newComponents.length) return

  oldJSON.components.push(...newComponents)
  oldJSON.components = oldJSON.components.filter((component) => component.name !== OldColliderComponent.jsonID)
}
