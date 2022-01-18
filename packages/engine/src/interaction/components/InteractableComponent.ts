import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type InteractableComponentType = {
  interactable?: boolean
  interactionType?: string
  interactionText?: string
  interactionDistance?: number
  interactionThemeIndex?: number
  interactionName?: string
  interactionDescription?: string
  interactionImages?: any
  interactionVideos?: any
  interactionUrls?: any
  interactionModels?: any
  interactionUserData?: any
  mediaIndex?: number
  callback?: any
  action?: any
  intensity?: number
  validUserId?: UserId
}

export const InteractableComponent = createMappedComponent<InteractableComponentType>('InteractableComponent')
