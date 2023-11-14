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

import { NodeCategory, SocketsList, makeEventNodeDefinition } from '@behave-graph/core'
import { Entity } from '../../../../../ecs/classes/Entity'
import {
  Query,
  defineQuery,
  getComponent,
  removeComponent,
  removeQuery
} from '../../../../../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../../../../../ecs/functions/EngineFunctions'
import {
  SystemDefinitions,
  SystemUUID,
  defineSystem,
  disableSystem,
  startSystem
} from '../../../../../ecs/functions/SystemFunctions'
import { CollisionComponent } from '../../../../../physics/components/CollisionComponent'
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

  // socket configuration support
  configuration: {
    numInputs: {
      valueType: 'number',
      defaultValue: 1
    }
  },

  // flow node inputs
  in: (_, graphApi) => {
    const sockets: SocketsList = []

    sockets.push({ key: 'entity', valueType: 'entity' })

    // can listen to entry or exit of that component (being added or removed)
    const type = () => {
      const choices = ['enter', 'exit']
      return {
        key: 'type',
        valueType: 'string',
        choices: choices,
        defaultValue: choices[0]
      }
    }

    // a 'system' is defining the system
    const system = () => {
      const systemDefinitions = Array.from(SystemDefinitions.keys()).map((key) => key as string)
      const groups = systemDefinitions.filter((key) => key.includes('group')).sort()
      const nonGroups = systemDefinitions.filter((key) => !key.includes('group')).sort()
      const choices = [...groups, ...nonGroups]
      return {
        key: 'system',
        valueType: 'string',
        choices: choices,
        defaultValue: InputSystemGroup
      }
    }

    // build a list of sockets to paint to the display for the user interface to behave graph
    sockets.push({ ...type() }, { ...system() })

    return sockets
  },

  out: {
    flow: 'flow',
    entity: 'entity',
    target: 'entity'
  },

  initialState: initialState(),

  init: ({ read, write, commit, graph, configuration }) => {
    const type = read<string>('type')
    const system = read<SystemUUID>('system')

    const entityFilter = read<Entity>('entity')

    const query = defineQuery([CollisionComponent])[type]

    interface Schema {
      [key: Entity]: any
    }
    const candidates: Schema = {}

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
    startSystem(systemUUID, { with: system })

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
