/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getComponent, removeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery, Query, removeQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem, destroySystem, SystemUUID } from '@ir-engine/ecs/src/SystemFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { CollisionComponent } from '@ir-engine/spatial/src/physics/components/CollisionComponent'
import { PhysicsSystem } from '@ir-engine/spatial/src/physics/PhysicsModule'
import { makeEventNodeDefinition, NodeCategory } from '@ir-engine/visual-script'

let systemCounter = 0

// define a type for state
type State = {
  query: Query
  systemUUID: SystemUUID
}

// define initial state based on a type
const initialState = (): State => ({
  query: undefined!,
  systemUUID: '' as SystemUUID
})

// a visual script node
export const OnCollision = makeEventNodeDefinition({
  typeName: 'engine/onCollision',
  category: NodeCategory.Engine,
  label: 'Collision Events',

  // socket configuration support
  configuration: {},

  // flow node inputs
  in: {
    entity: 'entity'
  },

  out: {
    flow: 'flow',
    entity: 'entity',
    target: 'entity'
  },

  initialState: initialState(),

  init: ({ read, write, commit }) => {
    const entityFilter = read<Entity>('entity')
    const query = defineQuery([CollisionComponent])

    // @todo this could be moved to a global system
    // @todo this could be using useComponent although that is asynchronous

    const systemUUID = defineSystem({
      uuid: 'visual-script-onCollision-' + systemCounter++,
      insert: { after: PhysicsSystem },
      execute: () => {
        const results = query()
        for (const entity of results) {
          if (entityFilter && entityFilter != entity) continue
          const name = getComponent(entity, NameComponent)
          const collision = getComponent(entity, CollisionComponent)
          // @todo maybe there should be that delay timer hack?
          for (const [e, hit] of collision) {
            write('entity', entity)
            write('target', e)
            commit('flow', () => {})
          }
          // @todo this should be done in the physics engine rather than here - hack
          removeComponent(entity, CollisionComponent)
        }
      }
    })

    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID } }) => {
    destroySystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
