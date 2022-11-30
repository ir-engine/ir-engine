import { Types } from 'bitecs'
import Heap from 'heap-js'

import { Entity } from './classes/Entity'
import { INITIAL_COMPONENT_SIZE } from './functions/ComponentFunctions'

export const createPriorityQueue = (entities: Entity[], args: { priorityThreshold: number }) => {
  const priorities = new Float64Array(INITIAL_COMPONENT_SIZE)

  const comparison = (a, b) => priorities[b] - priorities[a]
  const heap = new Heap<Entity>(comparison)

  heap.init(entities)

  const priorityEntities = new Set<Entity>()

  const popFunc = (entity: Entity) => {
    const priority = priorities[entity]
    if (priority > queue.priorityThreshold) {
      priorities[entity] = 0
      priorityEntities.add(heap.pop()!)
    }
  }

  const queue = {
    heap,
    setPriority: (entity: Entity, priority: number) => {
      priorities[entity] = priority
    },
    addPriority: (entity: Entity, priority: number) => {
      priorities[entity] += priority
    },
    update: () => {
      priorityEntities.clear()
      heap.init(entities)
      heap.toArray().filter(popFunc)
    },
    priorityEntities,
    priorityThreshold: args.priorityThreshold
  }

  return queue
}
