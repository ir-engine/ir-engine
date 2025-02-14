import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { defineState, getMutableState } from '@ir-engine/hyperflux'
import EmbedFrame from '../user/menus/avatar/EmbedFrame'

export const OverlayComponentState = defineState({
  name: 'ir.engine.interaction.PopupState',
  initial: () => ({
    iframe: EmbedFrame
  })
})

export const OverlaySystem = defineSystem({
  uuid: 'ir.client.OverlaySystem',
  insert: {},
  reactor: () => {
    getMutableState(OverlayComponentState)
    return null
  }
})
