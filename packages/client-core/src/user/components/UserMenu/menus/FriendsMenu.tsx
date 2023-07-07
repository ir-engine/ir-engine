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

import { useHookstate } from '@hookstate/core'
import { cloneDeep } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Tabs from '@etherealengine/client-core/src/common/components/Tabs'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { getMutableState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Chip from '@etherealengine/ui/src/primitives/mui/Chip'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import Button from '../../../../common/components/Button'
import { NotificationService } from '../../../../common/services/NotificationService'
import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { FriendService, FriendState } from '../../../../social/services/FriendService'
import { AvatarMenus } from '../../../../systems/AvatarUISystem'
import { AvatarUIContextMenuService } from '../../../../systems/ui/UserMenuView'
import { getUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { AuthState } from '../../../services/AuthService'
import { UserMenus } from '../../../UserUISystem'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

interface Props {
  defaultSelectedTab?: string
}

interface DisplayedUserInterface {
  id: string
  name: string
  relationType?: 'friend' | 'requested' | 'blocking' | 'pending' | 'blocked'
}

const FriendsMenu = ({ defaultSelectedTab }: Props): JSX.Element => {
  const { t } = useTranslation()
  const selectedTab = useHookstate(defaultSelectedTab ? defaultSelectedTab : 'friends')

  const worldState = useHookstate(getMutableState(WorldState))
  const friendState = useHookstate(getMutableState(FriendState))
  const selfUser = useHookstate(getMutableState(AuthState).user)
  const userId = selfUser.id.value
  const userAvatarDetails = worldState.userAvatarDetails
  const userNames = worldState.userNames.get({ noproxy: true })

  useEffect(() => {
    FriendService.getUserRelationship(userId)
  }, [])

  const handleTabChange = (newValue: string) => {
    selectedTab.set(newValue)
  }

  const handleProfile = (user: UserInterface | DisplayedUserInterface) => {
    AvatarUIContextMenuService.setId(user.id as UserId)
    PopupMenuServices.showPopupMenu(AvatarMenus.AvatarContext, {
      onBack: () => PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: selectedTab.value })
    })
  }

  const displayList: Array<UserInterface | DisplayedUserInterface> = []

  if (selectedTab.value === 'friends') {
    displayList.push(...friendState.relationships.pending.value)
    displayList.push(...friendState.relationships.friend.value)
  } else if (selectedTab.value === 'blocked') {
    displayList.push(...friendState.relationships.blocking.value)
  } else if (selectedTab.value === 'find') {
    const layerPeers = Engine.instance.worldNetworkState?.peers
      ? Array.from(Engine.instance.worldNetworkState.peers.get({ noproxy: true }).values()).filter(
          (peer) =>
            peer.peerID !== 'server' &&
            peer.userId !== userId &&
            !friendState.relationships.friend.value.find((item) => item.id === peer.userId) &&
            !friendState.relationships.pending.value.find((item) => item.id === peer.userId) &&
            !friendState.relationships.blocked.value.find((item) => item.id === peer.userId) &&
            !friendState.relationships.blocking.value.find((item) => item.id === peer.userId)
        )
      : []
    displayList.push(
      ...cloneDeep(layerPeers).map((peer) => {
        return { id: peer.userId, name: userNames[peer.userId] }
      })
    )

    displayList.forEach((peer) => {
      if (friendState.relationships.requested.value.find((item) => item.id === peer.id)) peer.relationType = 'requested'
    })
  }

  const settingTabs = [
    { value: 'find', label: t('user:friends.find') },
    { value: 'friends', label: t('user:friends.friends') },
    { value: 'blocked', label: t('user:friends.blocked') }
  ]

  return (
    <Menu
      open
      header={<Tabs value={selectedTab.value} items={settingTabs} onChange={handleTabChange} />}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent}>
        {displayList.length > 0 &&
          displayList.map((value) => (
            <Box key={value.id} display="flex" alignItems="center" m={2} gap={1.5}>
              <Avatar alt={value.name} imageSrc={getUserAvatarThumbnail(value.id as UserId)} size={50} />

              <Text flex={1}>{value.name}</Text>

              {value.relationType === 'friend' && (
                <IconButton
                  icon={<Icon type="Message" sx={{ height: 30, width: 30 }} />}
                  title={t('user:friends.message')}
                  onClick={() => NotificationService.dispatchNotify('Chat Pressed', { variant: 'info' })}
                />
              )}

              {value.relationType === 'pending' && (
                <>
                  <Chip
                    className={commonStyles.chip}
                    label={t('user:friends.pending')}
                    size="small"
                    variant="outlined"
                  />

                  <IconButton
                    icon={<Icon type="Check" sx={{ height: 30, width: 30 }} />}
                    title={t('user:friends.accept')}
                    onClick={() => FriendService.acceptFriend(userId, value.id)}
                  />

                  <IconButton
                    icon={<Icon type="Close" sx={{ height: 30, width: 30 }} />}
                    title={t('user:friends.decline')}
                    onClick={() => FriendService.declineFriend(userId, value.id)}
                  />
                </>
              )}

              {value.relationType === 'requested' && (
                <Chip
                  className={commonStyles.chip}
                  label={t('user:friends.requested')}
                  size="small"
                  variant="outlined"
                />
              )}

              {value.relationType === 'blocking' && (
                <IconButton
                  icon={<Icon type="HowToReg" sx={{ height: 30, width: 30 }} />}
                  title={t('user:friends.unblock')}
                  onClick={() => FriendService.unblockUser(userId, value.id)}
                />
              )}

              <IconButton
                icon={<Icon type="AccountCircle" sx={{ height: 30, width: 30 }} />}
                title={t('user:friends.profile')}
                onClick={() => handleProfile(value)}
              />
            </Box>
          ))}
        {displayList.length === 0 && (
          <Text align="center" mt={4} variant="body2">
            {t('user:friends.noUsers')}
          </Text>
        )}
      </Box>
      <Box display="flex" columnGap={2} alignItems="center">
        <Button fullWidth type="gradientRounded" onClick={() => PopupMenuServices.showPopupMenu(SocialMenus.Party)}>
          {t('user:usermenu.share.party')}
        </Button>
      </Box>
    </Menu>
  )
}

export default FriendsMenu
