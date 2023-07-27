/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
    accumulationBudget: args.accumulationBudget,
    reset: () => {
      totalAccumulation = 0
      accumulatingPriorities.clear()
      priorityEntities.clear()
    }
  }

  return queue
}
