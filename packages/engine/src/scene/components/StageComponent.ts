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
  UndefinedEntity,
  defineComponent,
  useComponent,
  useEntityContext,
  useExecute
} from '@etherealengine/ecs'
import { useEffect } from 'react'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerSystem } from '../../avatar/systems/AvatarControllerSystem'
import { createInteractUI } from '../../interaction/functions/interactUI'
import { addInteractableUI } from '../../interaction/systems/InteractiveSystem'

/**
 * StageComponent defines a content-centric (rather than an avatar-centric)
 * immersive context for participants to interact with each other and
 * featured content
 */
export const StageComponent = defineComponent({
  name: 'StageComponent',
  jsonID: 'EE_stage',

  onInit: (entity) => {
    return {
      contentEntity: UndefinedEntity,
      participantArrangement: 'auto' as 'auto' | 'side-by-side' | 'conversational',
      participantEntities: [] as Array<Entity>
    }
  },

  reactor: () => {
    const stageEntity = useEntityContext()
    const selfEntity = AvatarComponent.useSelfAvatarEntity()
    const stage = useComponent(stageEntity, StageComponent)

    useEffect(() => {
      addInteractableUI(stageEntity, createInteractUI(stageEntity, 'Join Stage'))
    }, [selfEntity])

    useExecute(
      () => {
        // this seems like something that should be generalized somewhere

        const inputPointerEntity = InputPointerComponent.getPointerForCanvas(Engine.instance.viewerEntity)
        if (!inputPointerEntity) return

        const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
        const buttons = InputSourceComponent.getMergedButtons()

        const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSources()
        for (const entity of nonCapturedInputSource) {
          const inputSource = getComponent(entity, InputSourceComponent)
          if (buttons.KeyE?.down || inputSource.buttons[XRStandardGamepadButton.Trigger]?.down)
            mountEntity(selfAvatarEntity, getState(InteractState).available[0])
        }
      },
      { before: AvatarControllerSystem }
    )

    return null
  }
})
