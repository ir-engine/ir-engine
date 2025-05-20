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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useGet } from '@ir-engine/common'
import { UserID, userPath } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'

import { Button } from '@ir-engine/ui'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { ModalState } from '../../../common/services/ModalState'
import { useUserAvatarThumbnail } from '../../../hooks/useUserAvatarThumbnail'
import { FriendService, FriendState } from '../../../social/services/FriendService'
import { AuthState } from '../../services/AuthService'
import FriendsMenu from './FriendsMenu'

const AvatarContextMenu = ({ userId }: { userId: UserID }): JSX.Element => {
  const { t } = useTranslation()
  const friendState = useMutableState(FriendState)

  const authState = useMutableState(AuthState)
  const selfId = authState.user.id?.value ?? ''
  userId = selfId!
  const user = useGet(userPath, userId)

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

  const userThumbnail = useUserAvatarThumbnail(userId)

  return (
    <Modal showCloseButton={false} hideFooter={true} className="rounded">
      <div className="flex flex-col items-center justify-center gap-y-2">
        <AvatarImage src={userThumbnail} />
        <Text fontSize="xl">{userName}</Text>
        {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
          <Button
            fullWidth
            onClick={() => {
              FriendService.requestFriend(selfId, userId)
              ModalState.openModal(<FriendsMenu defaultSelectedTab="find" />)
            }}
          >
            {t('user:personMenu.addAsFriend')}
          </Button>
        )}
        {isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
          <Button
            fullWidth
            onClick={() => {
              FriendService.unfriend(selfId, userId)
              ModalState.openModal(<FriendsMenu defaultSelectedTab="find" />)
            }}
          >
            {t('user:personMenu.unFriend')}
          </Button>
        )}
        {isPending && (
          <>
            <Badge variant="warning" label={t('user:friends.pending')} />
            <Button
              fullWidth
              onClick={() => {
                FriendService.acceptFriend(selfId, userId)
                ModalState.openModal(<FriendsMenu />)
              }}
            >
              {t('user:personMenu.acceptRequest')}
            </Button>

            <Button
              fullWidth
              onClick={() => {
                FriendService.declineFriend(selfId, userId)
                ModalState.openModal(<FriendsMenu defaultSelectedTab="find" />)
              }}
            >
              {t('user:personMenu.declineRequest')}
            </Button>
          </>
        )}

        {isRequested && (
          <>
            <Badge variant="warning" label={t('user:friends.requested')} />
            <Button
              fullWidth
              onClick={() => {
                FriendService.unfriend(selfId, userId)
                ModalState.openModal(<FriendsMenu defaultSelectedTab="find" />)
              }}
            >
              {t('user:personMenu.cancelRequest')}
            </Button>
          </>
        )}

        {!isBlocked && !isBlocking && (
          <Button
            fullWidth
            onClick={() => {
              FriendService.blockUser(selfId, userId)
              ModalState.openModal(<FriendsMenu defaultSelectedTab="blocked" />)
            }}
          >
            {t('user:personMenu.block')}
          </Button>
        )}

        {isBlocking && (
          <Button
            fullWidth
            onClick={() => {
              FriendService.unblockUser(selfId, userId)
              ModalState.openModal(<FriendsMenu />)
            }}
          >
            {t('user:personMenu.unblock')}
          </Button>
        )}
      </div>
    </Modal>
  )
}

export default AvatarContextMenu
