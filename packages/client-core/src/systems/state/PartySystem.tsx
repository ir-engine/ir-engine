import { getMutableState, none, startReactor } from '@etherealengine/hyperflux'

import { Groups } from '@mui/icons-material'

import { FriendService } from '../../social/services/FriendService'
import PartyReceptorSystem, { PartyService } from '../../social/services/PartyService'
import FriendsMenu from '../../user/components/UserMenu/menus/FriendsMenu'
import PartyMenu from '../../user/components/UserMenu/menus/PartyMenu'
import { PopupMenuState } from '../../user/components/UserMenu/PopupMenuService'

export const SocialMenus = {
  Party: 'Party',
  Friends: 'Friends'
}

export default async function PartySystem() {
  const menuState = getMutableState(PopupMenuState)
  menuState.menus.merge({
    [SocialMenus.Party]: PartyMenu,
    [SocialMenus.Friends]: FriendsMenu
  })
  menuState.hotbar.merge({
    [SocialMenus.Friends]: Groups
  })

  const friendReactor = startReactor(() => {
    FriendService.useAPIListeners()
    PartyService.useAPIListeners()

    return null
  })

  const execute = () => {}

  const cleanup = async () => {
    menuState.menus[SocialMenus.Party].set(none)
    menuState.menus[SocialMenus.Friends].set(none)

    menuState.hotbar[SocialMenus.Friends].set(none)

    await friendReactor.stop()
  }

  return { execute, cleanup, subsystems: [() => Promise.resolve({ default: PartyReceptorSystem })] }
}
