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
import { useEffect } from 'react'
import { Entity } from '../../../../../ecs/classes/Entity'
import { ComponentMap, getComponent, useOptionalComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { SystemUUID, defineSystem, disableSystem, startSystem } from '../../../../../ecs/functions/SystemFunctions'
import { NameComponent } from '../../../../../scene/components/NameComponent'

let systemCounter = 0

type State = {
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})

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
