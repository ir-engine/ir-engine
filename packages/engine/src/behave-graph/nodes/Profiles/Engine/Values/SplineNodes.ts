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

import { Assert, NodeCategory, makeAsyncNodeDefinition, makeFunctionNodeDefinition } from '@behave-graph/core'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Entity } from '../../../../../ecs/classes/Entity'
import { getComponent, getOptionalComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { defineQuery } from '../../../../../ecs/functions/QueryFunctions'
import { SystemUUID, defineSystem, destroySystem } from '../../../../../ecs/functions/SystemFunctions'
import { PresentationSystemGroup } from '../../../../../ecs/functions/SystemGroups'
import { NameComponent } from '../../../../../scene/components/NameComponent'
import { SplineComponent } from '../../../../../scene/components/SplineComponent'
import { SplineTrackComponent } from '../../../../../scene/components/SplineTrackComponent'
import { UUIDComponent } from '../../../../../scene/components/UUIDComponent'

const splineQuery = defineQuery([SplineComponent])

export const getSpline = makeFunctionNodeDefinition({
  typeName: 'engine/spline/getSpline',
  category: NodeCategory.Query,
  label: 'Get Spline Entity',
  in: {
    spline: (_, graphApi) => {
      const choices = splineQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent) as string
      }))
      choices.unshift({ text: 'none', value: '' as string })
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write }) => {
    const splineEntityUUID = read<string>('spline')
    Assert.mustBeTrue(splineEntityUUID !== '', 'Please select spline entity')
    const splineEntity = UUIDComponent.entitiesByUUID[splineEntityUUID]
    write('entity', splineEntity)
  }
})

let systemCounter = 0
type State = {
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})
export const addSplineTrack = makeAsyncNodeDefinition({
  typeName: 'engine/spline/addSplineTrack',
  category: NodeCategory.Action,
  label: 'Add spline track',
  in: {
    flow: 'flow',
    entity: 'entity',
    velocity: 'float',
    splineUUID: 'string',
    isLoop: 'boolean',
    lockToXZPlane: 'boolean',
    enableRotation: 'boolean',
    reset: 'boolean'
  },
  out: { flow: 'flow', trackEnd: 'flow', entity: 'entity' },
  initialState: initialState(),
  triggered: ({ read, write, commit, finished }) => {
    const entity = Number(read('entity')) as Entity
    const splineUuid = read<EntityUUID>('splineUUID')
    const velocity = read<number>('velocity')
    const isLoop = read<boolean>('isLoop')
    const lockToXZPlane = read<boolean>('lockToXZPlane')
    const enableRotation = read<boolean>('enableRotation')
    const alpha = read<number>('reset') ? 0 : undefined

    setComponent(entity, SplineTrackComponent, {
      alpha: alpha,
      splineEntityUUID: splineUuid,
      velocity: velocity,
      enableRotation: enableRotation,
      lockToXZPlane: lockToXZPlane,
      loop: isLoop
    })

    write('entity', entity)
    const systemUUID = defineSystem({
      uuid: 'behave-graph-spline-tracker-' + systemCounter++,
      insert: { with: PresentationSystemGroup },
      execute: () => {
        // can we hook into the spline track reactor somehow? this feels wasteful, but probably the right way to do it
        const splineTrack = getComponent(entity, SplineTrackComponent)
        if (splineTrack.loop) return
        const splineEntity = UUIDComponent.entitiesByUUID[splineTrack.splineEntityUUID!]
        if (!splineEntity) return
        const spline = getOptionalComponent(splineEntity, SplineComponent)
        if (!spline) return
        if (Math.floor(splineTrack.alpha) > spline!.elements.length - 1) {
          commit('trackEnd')
          finished?.()
          destroySystem(systemUUID) // we only want to run it once
          return
        }
      }
    })

    commit('flow')
    const state: State = {
      systemUUID
    }

    return state
  },
  dispose: ({ state: { systemUUID }, graph: { getDependency } }) => {
    if (systemUUID) destroySystem(systemUUID) // for if we shut down the graph early
    return initialState()
  }
})

//scene transition
