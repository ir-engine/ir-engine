import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { defineMappedComponent } from '../../ecs/functions/ComponentFunctions'

// export type InteractionContent = {
//   type: 'text',
//   value: string
// } | {
//   type: 'model',
//   url: string
// } | {
//   type: 'image',
//   url: string
// } | {
//   type: 'html',
//   value: string
// }

export const DEFAULT_INTERACTABLE = 'default' as const
export const EQUIPPABLE_INTERACTABLE = 'equippable' as const

export type InteractableComponentType = {
  interactionType?: typeof EQUIPPABLE_INTERACTABLE | typeof DEFAULT_INTERACTABLE | string
  // interactionContent?: InteractionContent[]
  interactionText?: string
  interactionDistance?: number
  interactionName?: string
  interactionDescription?: string
  interactionImages?: string[]
  interactionVideos?: string[]
  interactionUrls?: string[]
  interactionModels?: string[]
  interactionUserData?: any
  action?: any
  validUserId?: UserId
}

export const InteractableComponent = defineMappedComponent('interactable')
  .withReactiveType<InteractableComponentType>()
  .build()
