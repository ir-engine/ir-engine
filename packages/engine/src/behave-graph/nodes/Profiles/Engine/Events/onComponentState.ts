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
import { ComponentMap, useOptionalComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { SystemUUID, defineSystem, disableSystem, startSystem } from '../../../../../ecs/functions/SystemFunctions'

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
    flow: 'flow',
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
  out: { flow: 'flow' },
  initialState: initialState(),
  init: ({ read, write, commit, graph }) => {
    const entity = read<Entity>('entity')
    const Component = ComponentMap.get(read<string>('componentName'))!

    const systemUUID = defineSystem({
      uuid: 'behave-graph-onComponentState-' + systemCounter++,
      reactor: () => {
        const c = useOptionalComponent(entity, Component)

        useEffect(() => {
          if (c) {
            //            write()
            commit('flow')
          }
        }, [c])

        // useComponentState()
        //for (const eid of query()) {
        //}
        return null
      }
    })

    startSystem(systemUUID, {})

    // entityExists.magic.compeonentname.reacotr()

    // - listen for collisions between a and b

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
