import { createState, useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { removeComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { XRUIInteractableComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI, XRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@etherealengine/engine/src/xrui/functions/useXRUIState'
import { defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { FriendService, useFriendState } from '../../../social/services/FriendService'
import { InviteService } from '../../../social/services/InviteService'
import { PartyService, usePartyState } from '../../../social/services/PartyService'
import { PopupMenuActions } from '../../../user/components/UserMenu/PopupMenuService'
import { getAvatarURLForUser } from '../../../user/components/UserMenu/util'
import { useAuthState } from '../../../user/services/AuthService'
import { useNetworkUserState } from '../../../user/services/NetworkUserService'
import { AvatarMenus } from '../../AvatarUISystem'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

export const AvatarUIContextMenuState = defineState({
  name: 'AvatarUISystem',
  initial: () => {
    const ui = createXRUI(AvatarContextMenu) as XRUI<null>
    removeComponent(ui.entity, VisibleComponent)
    setComponent(ui.entity, XRUIInteractableComponent)
    return {
      ui,
      id: null! as string | UserId
    }
  }
})

export function createAvatarContextMenuView() {
  return
}

const AvatarContextMenu = () => {
  const detailState = useHookstate(getMutableState(AvatarUIContextMenuState))
  const engineState = useEngineState()
  const userState = useNetworkUserState()
  const partyState = usePartyState()
  const friendState = useFriendState()

  const authState = useAuthState()
  const selfId = authState.user.id?.value ?? ''

  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  const { t } = useTranslation()

  const userAvatarDetails = useHookstate(getMutableState(WorldState).userAvatarDetails)
  const partyOwner = partyState.party?.partyUsers?.value
    ? partyState.party.partyUsers.value.find((partyUser) => partyUser.isOwner)
    : null

  const isFriend = friendState.relationships.friend.value.find((item) => item.id === user?.id.value)
  const isRequested = friendState.relationships.requested.value.find((item) => item.id === user?.id.value)
  const isPending = friendState.relationships.pending.value.find((item) => item.id === user?.id.value)
  const isBlocked = friendState.relationships.blocked.value.find((item) => item.id === user?.id.value)
  const isBlocking = friendState.relationships.blocking.value.find((item) => item.id === user?.id.value)

  const inviteToParty = () => {
    if (authState.user?.partyId?.value && user?.id?.value) {
      const partyId = authState.user?.partyId?.value ?? ''
      const userId = user.id?.value
      const sendData = {
        inviteType: 'party',
        inviteeId: userId,
        targetObjectId: partyId,
        token: null
      } as SendInvite
      InviteService.sendInvite(sendData)
    }
  }

  const handleMute = () => {
    console.log('Mute pressed')
  }

  useEffect(() => {
    if (detailState.id.value !== '') {
      const tappedUser = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
      dispatchAction(
        PopupMenuActions.showPopupMenu({ id: AvatarMenus.AvatarContext, params: { user: tappedUser?.value } })
      )
    }
  }, [detailState.id])

  return (
    <>
      <style>{styleString}</style>
      {user?.id.value && (
        <div className="rootContainer">
          <img
            className="ownerImage"
            src={getAvatarURLForUser(userAvatarDetails, user?.id?.value)}
            alt=""
            crossOrigin="anonymous"
          />
          <div className="buttonContainer">
            <section className="buttonSection">
              {partyState?.party?.id?.value != null &&
                partyOwner?.userId != null &&
                partyOwner.userId === authState.user?.id?.value &&
                user.partyId.value !== partyState.party?.id?.value && (
                  <XRTextButton onClick={inviteToParty}>{t('user:personMenu.inviteToParty')}</XRTextButton>
                )}

              {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.requestFriend(selfId, user?.id.value)}>
                  {t('user:personMenu.addAsFriend')}
                </XRTextButton>
              )}

              {isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.unfriend(selfId, user?.id.value)}>
                  {t('user:personMenu.unFriend')}
                </XRTextButton>
              )}

              {isPending && (
                <>
                  <XRTextButton onClick={() => FriendService.acceptFriend(selfId, user?.id.value)}>
                    {t('user:personMenu.acceptRequest')}
                  </XRTextButton>

                  <XRTextButton onClick={() => FriendService.declineFriend(selfId, user?.id.value)}>
                    {t('user:personMenu.declineRequest')}
                  </XRTextButton>
                </>
              )}

              {isRequested && (
                <XRTextButton onClick={() => FriendService.unfriend(selfId, user?.id.value)}>
                  {t('user:personMenu.cancelRequest')}
                </XRTextButton>
              )}

              <XRTextButton onClick={handleMute}>{t('user:personMenu.mute')}</XRTextButton>

              {isFriend && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.blockUser(selfId, user?.id.value)}>
                  {t('user:personMenu.block')}
                </XRTextButton>
              )}

              {isBlocking && (
                <XRTextButton onClick={() => FriendService.unblockUser(selfId, user?.id.value)}>
                  {t('user:personMenu.unblock')}
                </XRTextButton>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  )
}
