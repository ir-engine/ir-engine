import { EntityJsonType, SceneJsonType } from '@etherealengine/common/src/schema.type.module'
import { v4 as uuid } from 'uuid'

// puts the scene settings from the the root entity into a sub entity
export const migrateSceneSettings = (json: SceneJsonType) => {
  if (!json.root) return
  const rootEntity = json.entities[json.root]
  if (!rootEntity) return
  if (json.entities[json.root].components.length) {
    const newEntity = {
      name: 'Settings',
      components: JSON.parse(JSON.stringify(rootEntity.components)),
      parent: json.root,
      index: 0
    } as EntityJsonType

    // remove all root entity components
    json.entities[json.root].components = []

    // increment all indexes as our new entity will be at the start
    for (const entity of Object.values(json.entities)) {
      if (typeof entity.index === 'number') entity.index = entity.index + 1
    }

    // force reordering so our new entity can be at the start
    json.entities = {
      [json.root]: json.entities[json.root],
      [uuid()]: newEntity,
      ...json.entities
    }
  }
}
