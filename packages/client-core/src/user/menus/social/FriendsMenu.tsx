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

import { cloneDeep } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFind, useGet } from '@ir-engine/common'
import {
  ChannelID,
  channelPath,
  ChannelType,
  UserID,
  UserName,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { NetworkState, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { Tooltip } from '@ir-engine/ui'
import { CheckCircleLg, CheckLg, MessageTextSquare01Lg, User01Lg, XCloseLg } from '@ir-engine/ui/src/icons'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { IoIosCall } from 'react-icons/io'
import { ModalState } from '../../../common/services/ModalState'
import { useUserAvatarThumbnail } from '../../../hooks/useUserAvatarThumbnail'
import { ChannelService, ChannelState } from '../../../social/services/ChannelService'
import { FriendService, FriendState } from '../../../social/services/FriendService'
import { AuthState } from '../../services/AuthService'
import MessagesMenu from './MessagesMenu'
import AvatarContextMenu from './RelationMenu'

const TabNames = ['friends', 'find', 'messages', 'blocked'] as const

interface Props {
  defaultSelectedTab?: (typeof TabNames)[number]
}

interface DisplayedUserInterface {
  id: UserID
  relationType?: 'friend' | 'requested' | 'blocking' | 'pending' | 'blocked'
}

const getChannelName = (channel: ChannelType) => {
  return (
    channel.name ||
    channel.channelUsers
      .filter((channelUser) => channelUser.user?.id !== Engine.instance.userID)
      .map((channelUser) => channelUser.user?.name)
      .filter(Boolean)
      .join(', ')
  )
}

/**
 * @todo
 * - rename this messages menu
 *
 * rather than populate this with friends,
 * */
const FriendsMenu = ({ defaultSelectedTab }: Props): JSX.Element => {
  const { t } = useTranslation()
  const selectedTabName = useHookstate(defaultSelectedTab ?? 'friends')

  const channels = useFind(channelPath)

  const friendState = useMutableState(FriendState)
  const selfUser = useMutableState(AuthState).user
  const userId = selfUser.id.value

  const privateChannels = channels.data.filter((channel) => !channel.instanceId)

  const channelState = useMutableState(ChannelState)

  const startMediaCall = (channelID: ChannelID) => {
    const inChannelCall = channelState.targetChannelId.value === channelID
    ChannelService.joinChannelInstance(inChannelCall ? ('' as ChannelID) : channelID)
  }

  useEffect(() => {
    FriendService.getUserRelationship(userId)
  }, [])

  const handleTabChange = (index: number) => {
    selectedTabName.set(TabNames[index])
  }

  const handleProfile = (user: DisplayedUserInterface) => {
    ModalState.openModal(<AvatarContextMenu userId={user.id} />)
  }

  const handleOpenChat = (id: string) => {
    if (selectedTabName.value === 'messages') {
      ModalState.openModal(<MessagesMenu channelID={id as ChannelID} name="" />)
    } else {
      const channelWithFriend = privateChannels.find(
        (channel) =>
          channel.channelUsers.length === 2 && channel.channelUsers.find((channelUser) => channelUser.userId === id)
      )
      if (channelWithFriend) {
        ModalState.openModal(<MessagesMenu channelID={channelWithFriend.id} name="" />)
      } else {
        ChannelService.createChannel([id as UserID]).then((channel) => {
          if (channel) {
            ModalState.openModal(<MessagesMenu channelID={channel.id} name="" />)
          }
        })
      }
    }
  }

  const displayList: Array<DisplayedUserInterface> = []
  const pendingList: Array<DisplayedUserInterface> = friendState.relationships.value
    .filter((item) => item.userRelationshipType === 'pending')
    .map((item) => ({ id: item.relatedUserId, name: item.relatedUser.name, relationType: 'pending' as const }))
  const friendList: Array<DisplayedUserInterface> = friendState.relationships.value
    .filter((item) => item.userRelationshipType === 'friend')
    .map((item) => ({ id: item.relatedUserId, name: item.relatedUser.name, relationType: 'friend' as const }))

  if (selectedTabName.value === 'friends') {
    displayList.push(...pendingList)
    displayList.push(...friendList)
  } else if (selectedTabName.value === 'messages') {
    displayList.push(
      ...privateChannels.map((channel) => ({
        id: channel.id.toString() as UserID,
        name: getChannelName(channel) as UserName,
        relationType: 'friend' as const
      }))
    )
  } else if (selectedTabName.value === 'blocked') {
    const blockingList: Array<DisplayedUserInterface> = friendState.relationships.value
      .filter((item) => item.userRelationshipType === 'blocking')
      .map((item) => ({ id: item.relatedUserId, name: item.relatedUser.name, relationType: 'blocking' as const }))
    displayList.push(...blockingList)
  } else if (selectedTabName.value === 'find') {
    const layerPeers = NetworkState.worldNetwork
      ? Object.values(NetworkState.worldNetwork.peers).filter(
          (peer) =>
            peer.peerID !== NetworkState.worldNetwork.hostPeerID &&
            peer.userId !== userId &&
            !friendState.relationships.value.find(
              (item) => item.relatedUserId === peer.userId && item.userRelationshipType === 'friend'
            ) &&
            !friendState.relationships.value.find(
              (item) => item.relatedUserId === peer.userId && item.userRelationshipType === 'pending'
            ) &&
            !friendState.relationships.value.find(
              (item) => item.relatedUserId === peer.userId && item.userRelationshipType === 'blocked'
            ) &&
            !friendState.relationships.value.find(
              (item) => item.relatedUserId === peer.userId && item.userRelationshipType === 'blocking'
            )
        )
      : []
    displayList.push(
      ...cloneDeep(layerPeers).map((peer) => {
        return { id: peer.userId }
      })
    )

    displayList.forEach((peer) => {
      if (
        friendState.relationships.value.find(
          (item) => item.relatedUserId === peer.id && item.userRelationshipType === 'requested'
        )
      )
        peer.relationType = 'requested'
    })
  }

  const Friend = (props: { user: DisplayedUserInterface }) => {
    const { user } = props
    const userName = useGet(userPath, props.user.id).data?.name ?? 'User'
    const thumbnail = useUserAvatarThumbnail(user.id as UserID)
    return (
      <div key={user.id} className="m-2 flex items-center gap-2 text-text-secondary hover:text-text-primary">
        <AvatarImage src={thumbnail} size="medium" />
        <Text className="w-full">{userName}</Text>

        {user.relationType === 'friend' && (
          <Tooltip content={t('user:friends.accept')}>
            <button onClick={() => handleOpenChat(user.id)}>
              <MessageTextSquare01Lg />
            </button>
          </Tooltip>
        )}

        {user.relationType === 'pending' && (
          <>
            <Text>{t('user:friends.pending')}</Text>
            <Tooltip content={t('user:friends.accept')}>
              <button onClick={() => FriendService.acceptFriend(userId, user.id)}>
                <CheckLg />
              </button>
            </Tooltip>
            <Tooltip content={t('user:friends.decline')}>
              <button onClick={() => FriendService.declineFriend(userId, user.id)}>
                <XCloseLg />
              </button>
            </Tooltip>
          </>
        )}

        {user.relationType === 'requested' && <Text>{t('user:friends.requested')}</Text>}

        {user.relationType === 'blocking' && (
          <Tooltip content={t('user:friends.unblock')}>
            <button onClick={() => FriendService.unblockUser(userId, user.id)}>
              <CheckCircleLg />
            </button>
          </Tooltip>
        )}

        {selectedTabName.value === 'messages' ? (
          <Tooltip content={t('user:friends.call')}>
            <button onClick={() => startMediaCall(user.id.toString() as ChannelID)}>
              <IoIosCall />
            </button>
          </Tooltip>
        ) : (
          <Tooltip content={t('user:friends.profile')}>
            <button onClick={() => handleProfile(user)}>
              <User01Lg />
            </button>
          </Tooltip>
        )}
      </div>
    )
  }

  const DisplayedUsers = () => {
    return (
      <div className="flex flex-col gap-2">
        {displayList.length > 0 && displayList.map((value) => <Friend user={value} />)}
        {displayList.length === 0 && (
          <Text className="text-center text-text-secondary">{t('user:friends.noUsers')}</Text>
        )}
      </div>
    )
  }

  return (
    <div className="absolute z-50 h-fit max-h-[90vh] w-[50vw] min-w-[720px] max-w-2xl overflow-y-auto rounded-2xl bg-surface-1 p-6 mdh:max-h-[60vh] mdh:px-10 mdh:py-6">
      <Tabs
        currentTabIndex={TabNames.indexOf(selectedTabName.value)}
        onTabChange={handleTabChange}
        tabsData={[
          {
            title: t('user:friends.friends'),
            tabLabel: t('user:friends.friends'),
            bottomComponent: <DisplayedUsers />
          },
          {
            title: t('user:friends.find'),
            tabLabel: t('user:friends.find'),
            bottomComponent: <DisplayedUsers />
          },
          {
            title: t('user:friends.messages'),
            tabLabel: t('user:friends.messages'),
            bottomComponent: <DisplayedUsers />
          },
          {
            title: t('user:friends.blocked'),
            tabLabel: t('user:friends.blocked'),
            bottomComponent: <DisplayedUsers />
          }
        ]}
      />
    </div>
  )
}

export default FriendsMenu
