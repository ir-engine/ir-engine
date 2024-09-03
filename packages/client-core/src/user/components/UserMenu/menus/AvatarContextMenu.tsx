/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@ir-engine/client-core/src/common/components/Avatar'
import Button from '@ir-engine/client-core/src/common/components/Button'
import commonStyles from '@ir-engine/client-core/src/common/components/common.module.scss'
import Menu from '@ir-engine/client-core/src/common/components/Menu'
import Text from '@ir-engine/client-core/src/common/components/Text'
import { useGet } from '@ir-engine/common'
import { UserID, userPath } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import Box from '@ir-engine/ui/src/primitives/mui/Box'
import Chip from '@ir-engine/ui/src/primitives/mui/Chip'

import { NotificationService } from '../../../../common/services/NotificationService'
import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { FriendService, FriendState } from '../../../../social/services/FriendService'
import { AvatarUIContextMenuState } from '../../../../systems/ui/UserMenuView'
import { useUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { AuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

interface Props {
  onBack?: () => void
}

const AvatarContextMenu = ({ onBack }: Props): JSX.Element => {
  const { t } = useTranslation()
  const friendState = useMutableState(FriendState)
  const avatarUIContextMenuState = useMutableState(AvatarUIContextMenuState)
  const userId = avatarUIContextMenuState.id.value as UserID
  const user = useGet(userPath, userId)

  const authState = useMutableState(AuthState)
  const selfId = authState.user.id?.value ?? ''

  const isFriend = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'friend')
  const isRequested = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'requested')
  const isPending = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'pending')
  const isBlocked = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'blocked')
  const isBlocking = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'blocking')

  const userName = isFriend
    ? isFriend.relatedUser.name
    : isRequested
    ? isRequested.relatedUser.name
    : isPending
    ? isPending.relatedUser.name
    : isBlocked
    ? isBlocked.relatedUser.name
    : isBlocking
    ? isBlocking.relatedUser.name
    : user.data?.name ?? 'A user'

  useEffect(() => {
    if (friendState.updateNeeded.value) {
      FriendService.getUserRelationship(selfId)
    }
  }, [friendState.updateNeeded.value])

  const handleMute = () => {
    console.log('Mute pressed')
    NotificationService.dispatchNotify('Mute Pressed', { variant: 'info' })
  }

  const userThumbnail = useUserAvatarThumbnail(userId)

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
        <Box
          className={styles.menuContent}
          style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '10px' }}
        >
          <Avatar imageSrc={userThumbnail} size={150} sx={{ margin: '0 auto' }} />

          <Text variant="h6" align="center" mt={2} mb={1}>
            {userName}
          </Text>

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
