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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  defineComponent,
  getMutableComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { LoopType } from '@etherealengine/ui/src/components/editor/properties/customTriggers/AnimationTriggerNodeEditor'
import { useEffect } from 'react'
import { AnimationActionLoopStyles, LoopOnce, LoopPingPong, LoopRepeat } from 'three'
import { LoopAnimationComponent } from './avatar/components/LoopAnimationComponent'

const LoopTypeLookup = (index: LoopType) => {
  switch (index) {
    case LoopType.LoopOnce:
      return LoopOnce as AnimationActionLoopStyles
    case LoopType.LoopPingPong:
      return LoopPingPong as AnimationActionLoopStyles
    case LoopType.LoopRepeat:
      return LoopRepeat as AnimationActionLoopStyles
    default:
      throw 'Loop Type not found'
  }
}

export const AnimationTriggerComponent = defineComponent({
  name: 'AnimationTriggerComponent',
  jsonID: 'EE_animation_trigger',

  onInit(entity) {
    return {
      animationEntityUUID: null as EntityUUID | null,
      enterClipIndex: -1,
      exitClipIndex: -1,
      enterLoopType: LoopType.LoopOnce,
      exitLoopType: LoopType.LoopOnce
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.animationEntityUUID !== 'undefined') component.animationEntityUUID.set(json.animationEntityUUID)
    if (typeof json.enterClipIndex !== 'undefined') component.enterClipIndex.set(json.enterClipIndex)
    if (typeof json.exitClipIndex !== 'undefined') component.exitClipIndex.set(json.exitClipIndex)
    if (typeof json.enterLoopType !== 'undefined') component.enterLoopType.set(json.enterLoopType)
    if (typeof json.exitLoopType !== 'undefined') component.exitLoopType.set(json.exitLoopType)
  },

  toJSON(entity, component) {
    return {
      animationEntityUUID: component.animationEntityUUID.value,
      enterClipIndex: component.enterClipIndex.value,
      exitClipIndex: component.exitClipIndex.value,
      enterLoopType: component.enterLoopType.value,
      exitLoopType: component.exitLoopType.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, AnimationTriggerComponent)
    const animationEnity = UUIDComponent.getEntityByUUID(component.animationEntityUUID.value as EntityUUID)
    const animation = getMutableComponent(animationEnity, LoopAnimationComponent)

    useEffect(() => {
      const Enter = () => {
        if (component.enterClipIndex.value >= 0) {
          animation.activeClipIndex.set(component.enterClipIndex.value)
          animation.loop.set(LoopTypeLookup(component.enterLoopType.value))
          //animation.clampWhenFinished.set(true)
          animation.paused.set(false)
          animation.time.set(0)
        } else {
          animation.paused.set(true)
        }
      }

      const Exit = () => {
        if (component.exitClipIndex.value >= 0) {
          animation.activeClipIndex.set(component.exitClipIndex.value)
          animation.loop.set(LoopTypeLookup(component.exitLoopType.value))
          //animation.
          animation.paused.set(false)
          animation.time.set(0)
        } else {
          animation.paused.set(true)
        }
      }

      setCallback(entity, 'onAnimationTriggerEnter', (triggerEntity: Entity, otherEntity: Entity) => {
        Enter()
      })
      setCallback(entity, 'onAnimationTriggerExit', (triggerEntity: Entity, otherEntity: Entity) => {
        Exit()
      })

      const triggerComp = getMutableComponent(entity, TriggerComponent)
      triggerComp.triggers.merge([
        {
          onEnter: 'onAnimationTriggerEnter',
          onExit: 'onAnimationTriggerExit',
          target: '' as EntityUUID
        }
      ])
    }, [])

    return null
  }
})
