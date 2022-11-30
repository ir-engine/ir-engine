import Heap from 'heap-js'

import { Entity } from './classes/Entity'
import { INITIAL_COMPONENT_SIZE } from './functions/ComponentFunctions'

export const createPriorityQueue = (entities: Entity[], args: { accumulationBudget: number }) => {
  const priorities = new Float64Array(INITIAL_COMPONENT_SIZE)
  const accumulation = new Float64Array(INITIAL_COMPONENT_SIZE)

  const comparison = (a, b) => priorities[b] - priorities[a]
  const heap = new Heap<Entity>(comparison)

  heap.init(entities)

  const priorityEntities = new Set<Entity>()

  const popFunc = (entity: Entity) => {
    const priority = priorities[entity]
    if (priority > 1) {
      priorities[entity] = 0
      priorityEntities.add(heap.pop()!)
    }
  }

  let totalAccumulation = 0

  const queue = {
    heap,
    setPriority: (entity: Entity, priority: number) => {
      priorities[entity] = priority
    },
    addPriority: (entity: Entity, priority: number) => {
      accumulation[entity] = priority
      totalAccumulation += priority
    },
    update: () => {
      for (const entity of entities)
        priorities[entity] += (accumulation[entity] * queue.accumulationBudget) / totalAccumulation
      totalAccumulation = 0
      priorityEntities.clear()
      heap.init(entities)
      heap.toArray().filter(popFunc)
    },
    priorityEntities,
    accumulationBudget: args.accumulationBudget
  }

  return queue
}
