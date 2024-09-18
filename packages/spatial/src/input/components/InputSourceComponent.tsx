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

import { Raycaster } from 'three'

import { defineQuery } from '@ir-engine/ecs'
import { defineComponent, getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { XRHandComponent, XRSpaceComponent } from '../../xr/XRComponents'
import { ReferenceSpace, XRState } from '../../xr/XRState'
import { ButtonStateMap } from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { DefaultButtonAlias } from './InputComponent'

export const InputSourceComponent = defineComponent({
  name: 'InputSourceComponent',

  schema: S.Object({
    source: S.Type<XRInputSource>({} as XRInputSource),
    buttons: S.Type<Readonly<ButtonStateMap<typeof DefaultButtonAlias>>>({}),
    raycaster: S.Class(() => new Raycaster()),
    intersections: S.Array(
      S.Object({
        entity: S.Entity(),
        distance: S.Number()
      })
    )
  }),

  onSet: (entity, component, args: { source?: XRInputSource; gamepad?: Gamepad } = {}) => {
    const source =
      args.source ??
      ({
        handedness: 'none',
        targetRayMode: 'screen',
        targetRaySpace: {} as XRSpace,
        gripSpace: undefined,
        gamepad:
          args.gamepad ??
          ({
            axes: [0, 0, 0, 0],
            buttons: [],
            connected: true,
            hapticActuators: [],
            id: 'emulated-gamepad-' + entity,
            index: 0,
            mapping: '',
            timestamp: performance.now(),
            vibrationActuator: null
          } as unknown as Gamepad),
        profiles: [],
        hand: undefined
      } as XRInputSource)

    component.source.set(source)

    // if we have a real input source, we should add the XRSpaceComponent
    if (args.source?.targetRaySpace) {
      InputSourceComponent.entitiesByInputSource.set(args.source, entity)
      const space = args.source.targetRaySpace
      const baseSpace =
        args.source.targetRayMode === 'tracked-pointer' ? ReferenceSpace.localFloor : ReferenceSpace.viewer
      if (!baseSpace) throw new Error('Base space not found')
      setComponent(entity, XRSpaceComponent, { space, baseSpace })
    }

    if (source.hand) {
      setComponent(entity, XRHandComponent)
    }
  },

  nonCapturedInputSources(entities = inputSourceQuery()) {
    return entities.filter((eid) => eid !== getState(InputState).capturingEntity)
  },

  /**
   * Gets the preferred controller entity - will return null if the entity is not in an active session or the controller is not available
   * @param {boolean} offhand specifies to return the non-preferred hand instead
   * @returns {Entity}
   */
  getPreferredInputSource: (offhand = false) => {
    const xrState = getState(XRState)
    if (!xrState.sessionActive) return
    const avatarInputSettings = getState(InputState)
    for (const inputSourceEntity of inputSourceQuery()) {
      const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
      const source = inputSourceComponent.source
      if (source?.handedness === 'none') continue
      if (!offhand && avatarInputSettings.preferredHand == source?.handedness) return source
      if (offhand && avatarInputSettings.preferredHand !== source?.handedness) return source
    }
  },

  getClosestIntersectedEntity(inputSourceEntity: Entity) {
    return getComponent(inputSourceEntity, InputSourceComponent).intersections[0]?.entity
  },

  getClosestIntersection(inputSourceEntity: Entity) {
    return getComponent(inputSourceEntity, InputSourceComponent).intersections[0]
  },

  entitiesByInputSource: new WeakMap<XRInputSource, Entity>()
})

const inputSourceQuery = defineQuery([InputSourceComponent])

/**
 * Scenario:
 * - hover over object shows UI hint
 * - click for object triggers action
 * - click and drag on object moves it around
 * - click and drag on some surfaces rotates the camera
 *
 *
 *
 *
 * Questions
 * - Can we have implicit ordering of input receiver systems? Or does it need to be explicit or non-ordered / deterministic?
 * -
 *
 */
