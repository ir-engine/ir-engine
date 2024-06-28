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
  createEntity,
  defineComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { TweenComponent } from '@etherealengine/spatial/src/transform/components/TweenComponent'
import { Easing, Tween } from '@tweenjs/tween.js'
import { useEffect } from 'react'
import { MediaComponent } from './scene/components/MediaComponent'
import { VideoComponent } from './scene/components/VideoComponent'

export const VideoTriggerComponent = defineComponent({
  name: 'VideoTriggerComponent',
  jsonID: 'EE_video_trigger',

  onInit(entity) {
    return {
      videoEntityUUID: null as EntityUUID | null,
      mediaEntityUUID: null as EntityUUID | null,
      resetEnter: false,
      resetExit: false
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.videoEntityUUID !== 'undefined') component.videoEntityUUID.set(json.videoEntityUUID)
    if (typeof json.mediaEntityUUID !== 'undefined') component.mediaEntityUUID.set(json.mediaEntityUUID)
    if (typeof json.resetEnter !== 'undefined') component.resetEnter.set(json.resetEnter)
    if (typeof json.resetExit !== 'undefined') component.resetExit.set(json.resetExit)
  },

  toJSON(entity, component) {
    return {
      videoEntityUUID: component.videoEntityUUID.value,
      mediaEntityUUID: component.mediaEntityUUID.value,
      resetEnter: component.resetEnter.value,
      resetExit: component.resetExit.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, VideoTriggerComponent)
    const videoEnity = UUIDComponent.getEntityByUUID(component.videoEntityUUID.value as EntityUUID)
    const video = getMutableComponent(videoEnity, VideoComponent)
    const mediaEnity = UUIDComponent.getEntityByUUID(component.mediaEntityUUID.value as EntityUUID)
    const media = getMutableComponent(mediaEnity, MediaComponent)
    const tween = createTween({ value: 0.0001 }).onUpdate(({ value }) => {
      media.volume.set(value)
    })
    let targetVolume: number

    useEffect(() => {
      const Enter = () => {
        if (component.resetEnter.value) {
          media.seekTime.set(0)
          media.forceSeekTime.set({ force: true })
        }
        media.paused.set(false)
        tween
          .stop()
          .to({ value: targetVolume }, 1000)
          .onComplete(() => {})
          .easing(Easing.Exponential.In)
          .startFromCurrentValues()
      }

      const Exit = () => {
        tween
          .stop()
          .to({ value: 0 }, 1000)
          .onComplete(() => {
            media.paused.set(true)
            if (component.resetExit.value) {
              media.seekTime.set(0)
              media.forceSeekTime.set({ force: true })
            }
          })
          .easing(Easing.Exponential.Out)
          .startFromCurrentValues()
      }

      setCallback(entity, 'onVideoTriggerEnter', (triggerEntity: Entity, otherEntity: Entity) => {
        Enter()
      })
      setCallback(entity, 'onVideoTriggerExit', (triggerEntity: Entity, otherEntity: Entity) => {
        Exit()
      })

      if (!hasComponent(entity, TriggerComponent)) {
        setComponent(entity, TriggerComponent)
      }

      const triggerComp = getMutableComponent(entity, TriggerComponent)
      triggerComp.triggers.merge([
        {
          onEnter: 'onVideoTriggerEnter',
          onExit: 'onVideoTriggerExit',
          target: '' as EntityUUID
        }
      ])

      targetVolume = media.volume.value
      media.volume.set(0)
    }, [])

    return null
  }
})

function createTween<T extends Record<string, any>>(obj: T) {
  const entity = createEntity()
  const tween = setComponent(entity, TweenComponent, new Tween<T>(obj))

  Object.assign(tween, {
    destroy: () => {
      tween.stop()
      removeEntity(entity)
    }
  })

  return tween as Tween<T> & { destroy: () => void }
}
