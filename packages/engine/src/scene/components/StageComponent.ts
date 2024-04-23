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
