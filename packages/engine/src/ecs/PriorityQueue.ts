import { Types } from 'bitecs'
import Heap from 'heap-js'

import { Entity } from './classes/Entity'
import { defineComponent, defineQuery } from './functions/ComponentFunctions'

export const createPriorityQueue = (entities: Entity[], name: string, args: { priorityThreshold: number }) => {
  const PriorityComponent = defineComponent({
    name: 'PriorityComponent_' + name,
    schema: {
      priority: Types.f64
    }
  })

  const comparison = (a, b) => PriorityComponent.priority[b] - PriorityComponent.priority[a]
  const heap = new Heap<Entity>(comparison)

  heap.init(entities)

  const priorityEntities = new Set()

  const popFunc = (entity: Entity) => {
    const priority = PriorityComponent.priority[entity]
    if (priority > queue.priorityThreshold) {
      PriorityComponent.priority[entity] = 0
      priorityEntities.add(heap.pop())
    }
  }

  const queue = {
    heap,
    setPriority: (entity: Entity, priority: number) => {
      PriorityComponent.priority[entity] = priority
    },
    addPriority: (entity: Entity, priority: number) => {
      PriorityComponent.priority[entity] += priority
    },
    update: () => {
      priorityEntities.clear()
      heap.init(entities)
      heap.toArray().filter(popFunc)
    },
    priorityEntities,
    priorityThreshold: args.priorityThreshold
  }
  globalThis.queue = queue
  return queue
}
