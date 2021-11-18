import { Entity } from '../../ecs/classes/Entity'

export type InteractionCheckHandler = (
  clientEntity: Entity,
  interactiveEntity: Entity,
  focusedPart?: number,
  args?: any
) => boolean

export type InteractionData = {
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
}
