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

import {
  defineComponent,
  deserializeComponent,
  Easing,
  getAuthoringCounterpart,
  getComponent,
  removeComponent,
  S,
  useEntityContext
} from '@ir-engine/ecs'
import { StandardCallbacks } from '@ir-engine/spatial/src/common/CallbackComponent'
import { useEffect } from 'react'
import { NodeID, NodeIDSchema } from '../../gltf/NodeIDComponent'
import { BehaviorComponent } from './BehaviorComponent'
import { MediaComponent } from './MediaComponent'
import { TriggerCallbackComponent } from './TriggerCallbackComponent'

/**
 * Backwards compatible triggers components
 * - automatically migrates to BehaviorComponent
 * @deprecated
 */
export const VideoTriggerComponent = defineComponent({
  name: 'VideoTriggerComponent',
  jsonID: 'EE_video_trigger',

  schema: S.Object({
    mediaEntityUUID: NodeIDSchema(),
    resetEnter: S.Bool(false),
    resetExit: S.Bool(false),
    targetAudioVolume: S.Number(1)
  }),

  onSet: (simulationEntity, c, json) => {
    if (!json) return

    const entity = getAuthoringCounterpart(simulationEntity) || simulationEntity

    deserializeComponent(entity, TriggerCallbackComponent, {
      triggers: [
        {
          onEnter: 'onEnter',
          onExit: 'onExit',
          target: '' as NodeID
        },
        ...(getComponent(entity, TriggerCallbackComponent)?.triggers || [])
      ]
    })

    deserializeComponent(entity, BehaviorComponent, {
      behaviors: [
        // enter
        {
          conditions: [
            {
              type: 'callback',
              callback: 'onEnter',
              nodeID: '' as NodeID
            }
          ],
          effects: [
            {
              type: 'callback',
              callback: StandardCallbacks.PLAY,
              nodeID: json.mediaEntityUUID ?? ('' as NodeID),
              parameters: [json.resetEnter ? true : false] // reset
            },
            {
              type: 'transition',
              nodeID: json.mediaEntityUUID ?? ('' as NodeID),
              jsonID: MediaComponent.jsonID,
              propertyPath: 'volume',
              value: json.targetAudioVolume ?? 1,
              duration: 1000,
              easing: Easing.exponential.in.path
            }
          ],
          networked: false
        },
        // exit
        {
          conditions: [
            {
              type: 'callback',
              callback: 'onExit',
              nodeID: '' as NodeID
            }
          ],
          effects: [
            {
              type: 'transition',
              nodeID: json.mediaEntityUUID ?? ('' as NodeID),
              jsonID: MediaComponent.jsonID,
              propertyPath: 'volume',
              value: 0,
              duration: 1000,
              easing: Easing.exponential.out.path
            },
            {
              type: 'callback',
              callback: StandardCallbacks.PAUSE,
              nodeID: json.mediaEntityUUID ?? ('' as NodeID),
              parameters: []
            }
          ],
          networked: false
        }
      ]
    })
  },

  reactor: () => {
    const simulationEntity = useEntityContext()
    const entity = getAuthoringCounterpart(simulationEntity) || simulationEntity

    useEffect(() => {
      removeComponent(entity, VideoTriggerComponent)
    }, [])

    return null
  }
})
