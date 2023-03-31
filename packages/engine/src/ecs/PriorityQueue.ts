import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'

import { Entity } from './classes/Entity'
import { entityExists } from './functions/EntityFunctions'

export const createPriorityQueue = (args: { accumulationBudget: number }) => {
  const accumulatingPriorities = new Map<
    Entity,
    {
      normalizedPriority: number
      accumulatedPriority: number
    }
  >()

  const priorityEntities = new Set<Entity>()

  let totalAccumulation = 0

  const queue = {
    accumulatingPriorities: accumulatingPriorities as DeepReadonly<typeof accumulatingPriorities>,
    removeEntity: (entity: Entity) => {
      accumulatingPriorities.delete(entity)
    },
    addPriority: (entity: Entity, priority: number) => {
      if (!accumulatingPriorities.has(entity))
        accumulatingPriorities.set(entity, { normalizedPriority: 0, accumulatedPriority: 0 })
      const item = accumulatingPriorities.get(entity)!
      item.accumulatedPriority += priority
      totalAccumulation += priority
    },
    update: () => {
      priorityEntities.clear()
      for (const [entity, item] of accumulatingPriorities) {
        item.normalizedPriority += (item.accumulatedPriority * queue.accumulationBudget) / totalAccumulation
        item.accumulatedPriority = 0
        const exists = entityExists(entity)
        if (item.normalizedPriority >= 1 || !exists) {
          if (exists) priorityEntities.add(entity)
          queue.removeEntity(entity)
        }
      }
      totalAccumulation = 0
    },
    priorityEntities: priorityEntities as ReadonlySet<Entity>,
    accumulationBudget: args.accumulationBudget
  }

  return queue
}
