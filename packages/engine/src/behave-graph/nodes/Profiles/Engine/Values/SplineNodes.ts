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

import { NodeCategory, makeAsyncNodeDefinition, makeFunctionNodeDefinition } from '@behave-graph/core'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Entity } from '../../../../../ecs/classes/Entity'
import { defineQuery, getComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../../../../../scene/components/NameComponent'
import { SplineComponent } from '../../../../../scene/components/SplineComponent'
import { SplineTrackComponent } from '../../../../../scene/components/SplineTrackComponent'

const splineQuery = defineQuery([SplineComponent])

export const getSpline = makeFunctionNodeDefinition({
  typeName: 'engine/spline/getSpline',
  category: NodeCategory.Query,
  label: 'Get Spline Entity',
  in: {
    splineName: (_, graphApi) => {
      const choices = splineQuery().map((entity) => ({ text: getComponent(entity, NameComponent), value: entity }))
      choices.unshift({ text: 'none', value: -1 as Entity })
      return {
        valueType: 'entity',
        choices: choices
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write }) => {
    const splineEntity = read<Entity>('splineName')
    write('entity', splineEntity)
  }
})

const initialState = () => {}
export const addSpline = makeAsyncNodeDefinition({
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
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity = read<Entity>('entity')
    const splineUuid = read<EntityUUID>('splineUUID')
    const velocity = read<number>('velocity')
    const isLoop = read<boolean>('isLoop')
    const lockToXZPlane = read<boolean>('lockToXZPlane')
    const enableRotation = read<boolean>('enableRotation')
    const alpha = read<number>('reset') ? 0 : undefined //
    setComponent(entity, SplineTrackComponent, {
      alpha: alpha,
      splineEntityUUID: splineUuid,
      velocity: velocity,
      enableRotation: enableRotation,
      lockToXZPlane: lockToXZPlane,
      loop: isLoop
    })

    commit('flow')
    write('entity', entity)
  },
  dispose: ({ state, graph: { getDependency } }) => {
    return initialState()
  }
})

//scene transition
