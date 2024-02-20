import { EntityJsonType } from '@etherealengine/common/src/schema.type.module'
import { ComponentJSONIDMap } from '@etherealengine/ecs'

/**
 * If the entity has old components, migrate them to the new format
 * - will destructively lose information if there is a mismatch in the schema
 * @param entityJSON
 */
export const migrateOldComponents = (entityJSON: EntityJsonType) => {
  for (const component of entityJSON.components) {
    if (component.name.startsWith('EE_') || component.name === 'collider') continue

    const oldComponent = ComponentJSONIDMap.has('EE_' + component.name)
    if (!oldComponent) continue

    console.log('Migrating old component', component.name, 'to EE_' + component.name)
    component.name = 'EE_' + component.name
  }
}
