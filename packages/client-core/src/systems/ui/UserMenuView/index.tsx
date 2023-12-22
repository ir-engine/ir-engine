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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { XRUI, createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { defineState, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { FriendService, FriendState } from '../../../social/services/FriendService'
import { PopupMenuServices } from '../../../user/components/UserMenu/PopupMenuService'
import { useUserAvatarThumbnail } from '../../../user/functions/useUserAvatarThumbnail'
import { AuthState } from '../../../user/services/AuthService'
import { AvatarMenus } from '../../AvatarUISystem'
import XRTextButton from '../../components/XRTextButton'
import styles from './index.scss?inline'

export const AvatarUIContextMenuState = defineState({
  name: 'AvatarUISystem',
  initial: () => {
    const ui = createXRUI(AvatarContextMenu) as XRUI<null>
    removeComponent(ui.entity, VisibleComponent)
    return {
      ui,
      id: null! as string | UserID
    }
  }
})

export const AvatarUIContextMenuService = {
  setId: (id: UserID) => {
    const avatarUIContextMenuState = getMutableState(AvatarUIContextMenuState)
    avatarUIContextMenuState.id.set(id)
  }
}

const AvatarContextMenu = () => {
  const detailState = useHookstate(getMutableState(AvatarUIContextMenuState))
  const friendState = useHookstate(getMutableState(FriendState))
  const authState = useHookstate(getMutableState(AuthState))
  const selfId = authState.user.id?.value ?? ''

  const peers = NetworkState.worldNetwork?.peers
  const user = peers
    ? Object.values(peers).find((peer) => peer.userId === detailState.id.value) || undefined
    : undefined
  const { t } = useTranslation()

  const isFriend = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'friend'
  )
  const isRequested = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'requested'
  )
  const isPending = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'pending'
  )
  const isBlocked = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'blocked'
  )
  const isBlocking = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'blocking'
  )

  const handleMute = () => {
    console.log('Mute pressed')
  }

  useEffect(() => {
    if (detailState.id.value !== '') {
      const tappedUser = Object.values(NetworkState.worldNetwork.peers).find(
        (peer) => peer.userId === detailState.id.value
      )
      PopupMenuServices.showPopupMenu(AvatarMenus.AvatarContext, { user: tappedUser })
    }
  }, [detailState.id])

  const userThumbnail = useUserAvatarThumbnail(user?.userId)

  return (
    <>
      {user?.userId && (
        <div className={styles.rootContainer}>
          <img
            style={{
              height: 'auto',
              maxWidth: '100%'
            }}
            className={styles.ownerImage}
            src={userThumbnail}
            alt=""
            crossOrigin="anonymous"
          />
          <div className={styles.buttonContainer}>
            <section className={styles.buttonSection}>
              {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.requestFriend(selfId, user?.userId)}>
                  {t('user:personMenu.addAsFriend')}
                </XRTextButton>
              )}

              {isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.unfriend(selfId, user?.userId)}>
                  {t('user:personMenu.unFriend')}
                </XRTextButton>
              )}

              {isPending && (
                <>
                  <XRTextButton onClick={() => FriendService.acceptFriend(selfId, user?.userId)}>
                    {t('user:personMenu.acceptRequest')}
                  </XRTextButton>

                  <XRTextButton onClick={() => FriendService.declineFriend(selfId, user?.userId)}>
                    {t('user:personMenu.declineRequest')}
                  </XRTextButton>
                </>
              )}

              {isRequested && (
                <XRTextButton onClick={() => FriendService.unfriend(selfId, user?.userId)}>
                  {t('user:personMenu.cancelRequest')}
                </XRTextButton>
              )}

              <XRTextButton onClick={handleMute}>{t('user:personMenu.mute')}</XRTextButton>

              {isFriend && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.blockUser(selfId, user?.userId)}>
                  {t('user:personMenu.block')}
                </XRTextButton>
              )}

              {isBlocking && (
                <XRTextButton onClick={() => FriendService.unblockUser(selfId, user?.userId)}>
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
