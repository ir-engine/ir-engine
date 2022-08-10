import { World } from '@xrengine/engine/src/ecs/classes/World'
import { dispatchAction } from '@xrengine/hyperflux'

import { Entity } from '../ecs/classes/Entity'
import { createXRUI } from './functions/createXRUI'
import { WidgetAppActions } from './WidgetAppService'

/**
 * The widget interface.
 *
 * @param {XRUI} ui stores a reference to the XRUI container, entity and state
 * @param {string} label is the display label of the widget
 * @param {any} icon is the icon to display on the widget menu
 * @param {Function} system is a system that will run while a widget is enabled and visible
 */

export const WidgetName = {
  PROFILE: 'ProfileMenu',
  SETTINGS: 'SettingsMenu',
  SOCIALS: 'SocialsMenu',
  LOCATION: 'LocationMenu',
  ADMIN_CONTROLS: 'AdminControlsMenu',
  MEDIA_SESSION: 'MediaSessionMenu',
  CHAT: 'Chat',
  EMOTE: 'Emote',
  READY_PLAYER: 'ReadyPlayer',
  SELECT_AVATAR: 'SelectAvatar',
  SHARE_LOCATION: 'ShareLocation',
  UPLOAD_AVATAR: 'UploadAvatar'
}

export type Widget = {
  ui: ReturnType<typeof createXRUI>
  label: string
  icon?: any
  system: () => void
}

export const registerWidget = (world: World, xruiEntity: Entity, widget: Widget) => {
  const id = `${widget.label}-${xruiEntity}`
  dispatchAction(WidgetAppActions.registerWidget({ id }))
  world.widgets.set(id, widget)
}

export const Widgets = {
  registerWidget
}
