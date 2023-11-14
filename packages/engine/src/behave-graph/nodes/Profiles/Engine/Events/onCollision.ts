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

import { NodeCategory, SocketsList, makeEventNodeDefinition, sequence } from '@behave-graph/core'
import { Entity } from '../../../../../ecs/classes/Entity'
import {
  Component,
  ComponentMap,
  Query,
  defineQuery,
  getComponent,
  hasComponent,
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
import { RigidBodyComponent } from '../../../../../physics/components/RigidBodyComponent'
import { ColliderComponent } from '../../../../../scene/components/ColliderComponent'
import { NameComponent } from '../../../../../scene/components/NameComponent'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'

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

    // any component can be listened to
    const componentName = (index) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      return {
        key: `componentName${index}`,
        valueType: 'string',
        choices: choices,
        defaultValue: TransformComponent.name
      }
    }

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
    // @todo unsure how to get all system groups

    // build a list of sockets to paint to the display for the user interface to behave graph
    sockets.push({ ...type() }, { ...system() })

    // tack on the components to that same display
    for (const index of sequence(1, (_.numInputs ?? OnCollision.configuration?.numInputs.defaultValue) + 1)) {
      sockets.push({ ...componentName(index) })
    }

    return sockets
  },

  out: {
    flow: 'flow',
    entity: 'entity'
  },

  initialState: initialState(),

  init: ({ read, write, commit, graph, configuration }) => {
    const type = read<string>('type')
    const system = read<SystemUUID>('system')

    const queryComponents: Component[] = []
    for (const index of sequence(
      1,
      (configuration.numInputs ?? OnCollision.configuration?.numInputs.defaultValue) + 1
    )) {
      const componentName = read<string>(`componentName${index}`)
      const component = ComponentMap.get(componentName)!
      queryComponents.push(component)
    }

    const entity = read<Entity>('entity')
    const name = entity ? getComponent(entity, NameComponent) : 'no entity'

    //const query = defineQuery(queryComponents)[type]
    const query = defineQuery([CollisionComponent])[type]

    interface Schema {
      [key: Entity]: any
    }
    const candidates: Schema = {}

    const systemUUID = defineSystem({
      uuid: 'behave-graph-onCollision-' + systemCounter++,
      execute: () => {
        // find candidates that are in collision

        // find candidates with colliders - this happens rarely
        // it's kind of crazy to do this in this way...

        const results = query()
        for (const entity of results) {
          if (!hasComponent(entity, NameComponent)) {
            console.warn('hello colliding entity has no name', entity)
            continue
          }
          const name = getComponent(entity, NameComponent)

          if (!hasComponent(entity, RigidBodyComponent)) {
            console.warn('hello entity has no rigidbody', entity, name)
          }
          // const rigidbody = getComponent(entity, RigidBodyComponent)

          if (!hasComponent(entity, ColliderComponent)) {
            console.warn('hello entity has no collider', entity, name)
          }
          //const colliders = getComponent(entity, ColliderComponent)

          if (!hasComponent(entity, CollisionComponent)) {
            console.warn('hello entity has no collision', entity, name)
          }
          const collision = getComponent(entity, CollisionComponent)
          console.log('... hello found collision able....', entity, name, collision)

          //for (let i = 0; i < rigidbody.body.numColliders(); i++) {
          //  const collider = rigidbody.body.collider(i)
          //  const collisionGroup = collider.collisionGroups()
          //}

          candidates[entity] = collision
        }

        for (const entity in candidates) {
          const collision = candidates[entity]
          //console.log("... hello found collisions....",entity,collision)
          for (const [e, hit] of collision) {
            console.log('... hello found an actual collision....', e, hit)
            //if (e === getComponent(entity, GolfClubComponent).clubBodyEntity) {
            //}
          }
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

/*
export const OnComponentState = makeEventNodeDefinition({
  typeName: 'engine/onComponentState',
  category: NodeCategory.Event,
  label: 'On Component State',
  in: {
    entity: 'entity',
    componentName: (_, graphApi) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: {
    flow: 'flow',
    entity: 'entity'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph }) => {
    const entity = read<Entity>('entity')
    const componentName = read<string>('componentName')
    const Component = ComponentMap.get(componentName)!

    const name = getComponent(entity, NameComponent)

    const systemUUID = defineSystem({
      uuid: 'behave-graph-onComponentState-' + systemCounter++,
      execute: () => {
        console.log('... hello2 execute oncomponent running')
        const c = entity ? useOptionalComponent(entity, Component) : null
        if (c) {
          console.log('...hello2 got component...', entity, c)
          write('entity', entity)
          commit('flow')
        }
      },

      reactor: () => {
        console.log('... hello3 reactor oncomponent running')
        const c = entity ? useOptionalComponent(entity, Component) : null
        useEffect(() => {
          if (c) {
            console.log('...hello3 got component...', entity, c)
            write('entity', entity)
            commit('flow')
          }
        }, [c])
        return null
      }
    })

    console.log('.... hello2 got entity and now starting system', entity, name, componentName)
    startSystem(systemUUID, {})

    const state: State = {
      systemUUID
    }
    return state
  },
  dispose: ({ state: { systemUUID }, graph: { getDependency } }) => {
    disableSystem(systemUUID)
    return initialState()
  }
})
*/
