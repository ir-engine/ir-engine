import { createEngine, createEntity, destroyEngine, Entity, removeEntity } from '@ir-engine/ecs'
import { test as base } from 'vitest'

export const it = base.extend<{ entity: Entity }>({
  // eslint-disable-next-line no-empty-pattern
  entity: async ({}, use) => {
    createEngine()
    const entity = createEntity()
    await use(entity)
    removeEntity(entity)
    destroyEngine()
  }
})
