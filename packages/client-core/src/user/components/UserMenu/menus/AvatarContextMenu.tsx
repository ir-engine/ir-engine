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

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import Button from '@etherealengine/client-core/src/common/components/Button'
import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Chip from '@etherealengine/ui/src/primitives/mui/Chip'

import { NotificationService } from '../../../../common/services/NotificationService'
import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { FriendService, FriendState } from '../../../../social/services/FriendService'
import { InviteService } from '../../../../social/services/InviteService'
import { PartyState } from '../../../../social/services/PartyService'
import { AvatarUIContextMenuState } from '../../../../systems/ui/UserMenuView'
import { getUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { AuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

interface Props {
  onBack?: () => void
}

const AvatarContextMenu = ({ onBack }: Props): JSX.Element => {
  const { t } = useTranslation()
  const partyState = useHookstate(getMutableState(PartyState))
  const friendState = useHookstate(getMutableState(FriendState))
  const worldState = useHookstate(getMutableState(WorldState))
  const avatarUIContextMenuState = useHookstate(getMutableState(AvatarUIContextMenuState))
  const userId = avatarUIContextMenuState.id.value as UserId

  const authState = useHookstate(getMutableState(AuthState))
  const selfId = authState.user.id?.value ?? ''

  const userAvatarDetails = useHookstate(getMutableState(WorldState).userAvatarDetails)
  const partyOwner = partyState.party?.partyUsers?.value
    ? partyState.party.partyUsers.value.find((partyUser) => partyUser.isOwner)
    : null

  const isFriend = friendState.relationships.friend.get({ noproxy: true }).find((item) => item.id === userId)
  const isRequested = friendState.relationships.requested.get({ noproxy: true }).find((item) => item.id === userId)
  const isPending = friendState.relationships.pending.get({ noproxy: true }).find((item) => item.id === userId)
  const isBlocked = friendState.relationships.blocked.get({ noproxy: true }).find((item) => item.id === userId)
  const isBlocking = friendState.relationships.blocking.get({ noproxy: true }).find((item) => item.id === userId)

  const userName = isFriend
    ? isFriend.name
    : isRequested
    ? isRequested.name
    : isPending
    ? isPending.name
    : isBlocked
    ? isBlocked.name
    : isBlocking
    ? isBlocking.name
    : worldState.userNames[userId].value ?? 'A user'

  useEffect(() => {
    if (friendState.updateNeeded.value) {
      FriendService.getUserRelationship(selfId)
    }
  }, [friendState.updateNeeded.value])

  const inviteToParty = () => {
    if (authState.user?.partyId?.value && userId) {
      const partyId = authState.user?.partyId?.value ?? ''
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
    NotificationService.dispatchNotify('Mute Pressed', { variant: 'info' })
  }

  return (
    <Menu
      open
      contentMargin={onBack ? '-50px 0 0' : undefined}
      maxWidth="xs"
      showBackButton={!!onBack}
      onBack={onBack}
      onClose={() => {
        avatarUIContextMenuState.id.set('')
        PopupMenuServices.showPopupMenu()
      }}
    >
      {userId && (
        <Box className={styles.menuContent} display={'flex'} flexDirection={'column'}>
          <Avatar imageSrc={getUserAvatarThumbnail(userId)} size={150} sx={{ margin: '0 auto' }} />

          <Text variant="h6" align="center" mt={2} mb={1}>
            {userName}
          </Text>

          {partyState?.party?.id?.value != null &&
            partyOwner?.userId != null &&
            partyOwner.userId === authState.user.id?.value &&
            !partyState.party?.partyUsers.get({ noproxy: true })?.find((partyUser) => partyUser.userId === userId) && (
              <Button type="gradientRounded" width="70%" onClick={inviteToParty}>
                {t('user:personMenu.inviteToParty')}
              </Button>
            )}

          {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.requestFriend(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
              }}
            >
              {t('user:personMenu.addAsFriend')}
            </Button>
          )}

          {isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.unfriend(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
              }}
            >
              {t('user:personMenu.unFriend')}
            </Button>
          )}

          {isPending && (
            <>
              <Chip
                className={commonStyles.chip}
                sx={{ margin: '10px auto !important' }}
                label={t('user:friends.pending')}
                size="small"
                variant="outlined"
              />

              <Button
                type="gradientRounded"
                width="70%"
                onClick={() => {
                  FriendService.acceptFriend(selfId, userId)
                  PopupMenuServices.showPopupMenu(SocialMenus.Friends)
                }}
              >
                {t('user:personMenu.acceptRequest')}
              </Button>

              <Button
                type="gradientRounded"
                width="70%"
                onClick={() => {
                  FriendService.declineFriend(selfId, userId)
                  PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
                }}
              >
                {t('user:personMenu.declineRequest')}
              </Button>
            </>
          )}

          {isRequested && (
            <>
              <Chip
                className={commonStyles.chip}
                sx={{ margin: '10px auto !important' }}
                label={t('user:friends.requested')}
                size="small"
                variant="outlined"
              />

              <Button
                type="gradientRounded"
                width="70%"
                onClick={() => {
                  FriendService.unfriend(selfId, userId)
                  PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
                }}
              >
                {t('user:personMenu.cancelRequest')}
              </Button>
            </>
          )}

          <Button type="gradientRounded" width="70%" onClick={handleMute}>
            {t('user:personMenu.mute')}
          </Button>

          {!isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.blockUser(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'blocked' })
              }}
            >
              {t('user:personMenu.block')}
            </Button>
          )}

          {isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.unblockUser(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends)
              }}
            >
              {t('user:personMenu.unblock')}
            </Button>
          )}
        </Box>
      )}
    </Menu>
  )
}

export default AvatarContextMenu
