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

import { NodeCategory, makeEventNodeDefinition } from '@behave-graph/core'
import { Entity } from '../../../../../ecs/classes/Entity'
import {
  Query,
  defineQuery,
  getComponent,
  removeComponent,
  removeQuery
} from '../../../../../ecs/functions/ComponentFunctions'
import { SystemUUID, defineSystem, disableSystem, startSystem } from '../../../../../ecs/functions/SystemFunctions'
import { CollisionComponent } from '../../../../../physics/components/CollisionComponent'
import { PhysicsSystem } from '../../../../../physics/systems/PhysicsSystem'
import { NameComponent } from '../../../../../scene/components/NameComponent'

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

// a behave graph node
export const OnCollision = makeEventNodeDefinition({
  typeName: 'engine/onCollision',
  category: NodeCategory.Event,
  label: 'Collision Events',

  configuration: {},

  in: {
    entity: 'entity'
  },

  out: {
    flow: 'flow',
    entity: 'entity',
    target: 'entity'
  },

  initialState: initialState(),

  init: ({ read, write, commit, graph, configuration }) => {
    const entityFilter = read<Entity>('entity')
    const query = defineQuery([CollisionComponent]).enter

    const systemUUID = defineSystem({
      uuid: 'behave-graph-onCollision-' + systemCounter++,
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

    // start the actual system
    startSystem(systemUUID, { after: PhysicsSystem })

    // return a copy of the state for some reason? @todo why?
    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID }, graph: { getDependency } }) => {
    disableSystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
