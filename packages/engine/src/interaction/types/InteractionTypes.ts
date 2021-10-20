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
  payloadName?: string
  payloadUrl?: string
  payloadBuyUrl?: string
  payloadLearnMoreUrl?: string
  payloadHtmlContent?: string
  action?: any
}
