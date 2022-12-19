import { DeepReadonly } from '@xrengine/common/src/DeepReadonly'

import { Entity } from './classes/Entity'

export const createPriorityQueue = (args: { accumulationBudget: number }) => {
  const accumulatingPriorities = new Map<
    Entity,
    {
      normalizedPriority: number
      accumulatedPriority: number
    }
  >()

  const priorityEntites = new Set<Entity>()

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
      priorityEntites.clear()
      for (const [entity, item] of accumulatingPriorities) {
        item.normalizedPriority += (item.accumulatedPriority * queue.accumulationBudget) / totalAccumulation
        item.accumulatedPriority = 0
        if (item.normalizedPriority >= 1) {
          priorityEntites.add(entity)
          queue.removeEntity(entity)
        }
      }
      totalAccumulation = 0
    },
    priorityEntities: priorityEntites as ReadonlySet<Entity>,
    accumulationBudget: args.accumulationBudget
  }

  return queue
}
