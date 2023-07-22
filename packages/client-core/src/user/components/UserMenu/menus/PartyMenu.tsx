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

import React from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import Button from '@etherealengine/client-core/src/common/components/Button'
import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { CrownIcon } from '@etherealengine/client-core/src/common/components/Icons/CrownIcon'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { EMAIL_REGEX, PHONE_REGEX } from '@etherealengine/common/src/constants/IdConstants'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { UserRelationship } from '@etherealengine/common/src/interfaces/UserRelationship'
import { useFind, useGet } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import { LoadingCircle } from '../../../../components/LoadingCircle'
import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { ChannelService, ChannelState } from '../../../../social/services/ChannelService'
import { InviteService } from '../../../../social/services/InviteService'
import { getUserAvatarThumbnail, useUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { AuthState } from '../../../services/AuthService'
import { PopupMenuServices } from '../PopupMenuService'
import styles from '../index.module.scss'

export const usePartyMenuHooks = () => {
  const token = useHookstate('')
  const isInviteOpen = useHookstate(false)
  const isDeleteConfirmOpen = useHookstate(false)
  const channelState = useHookstate(getMutableState(ChannelState))
  const selfUser = useHookstate(getMutableState(AuthState).user)

  const createParty = () => {
    ChannelService.createChannel([])
  }

  const kickUser = (userId?: UserId) => {
    if (!userId) return
    ChannelService.removeUserFromChannel(channelState.targetChannelId.value, userId)
  }

  const handleChangeToken = (e) => {
    token.set(e.target.value)
  }

  const deleteParty = (channelID: ChannelID) => {
    ChannelService.removeChannel(channelID)
  }

  const sendInvite = async (): Promise<void> => {
    const isEmail = EMAIL_REGEX.test(token.value)
    const isPhone = PHONE_REGEX.test(token.value)
    const sendData = {
      inviteType: 'channel',
      token: token.value,
      inviteCode: null,
      identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
      targetObjectId: channelState.targetChannelId.value,
      inviteeId: null,
      deleteOnUse: true,
      spawnType: 'inviteCode',
      spawnDetails: { inviteCode: selfUser.inviteCode.value }
    } as SendInvite

    InviteService.sendInvite(sendData)
    token.set('')
    isInviteOpen.set(false)
  }

  return {
    createParty,
    kickUser,
    token: token.value,
    handleChangeToken,
    sendInvite,
    isInviteOpen,
    isDeleteConfirmOpen,
    deleteParty,
    selfUser
  }
}

const PartyMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const channelState = useHookstate(getMutableState(ChannelState))
  const activeChannel = channelState.channels.channels.find(
    (channel) => channel.id.value === channelState.targetChannelId.value
  )
  const inParty = !activeChannel?.ornull.instanceId.value

  const {
    createParty,
    kickUser,
    token,
    handleChangeToken,
    sendInvite,
    isInviteOpen,
    isDeleteConfirmOpen,
    deleteParty,
    selfUser
  } = usePartyMenuHooks()

  const RenderCreate = () => {
    return (
      <Text align="center" flex={1} mt={4} variant="body2">
        {t('user:usermenu.party.createPartyText')}
      </Text>
    )
  }

  const RenderUsers = () => {
    const channelUsers = useFind('channel-user', {
      query: {
        channelId: channelState.targetChannelId.value
      }
    })
    const RenderUser = (props: { channelUser }) => {
      const { channelUser } = props
      const userThumbnail = useUserAvatarThumbnail() //useUserAvatarThumbnail(channelUser.userId) / TODO: throws an error
      const user = useGet('user', channelUser.userId).data
      return (
        <Box display="flex" alignItems="center" mb={2} gap={1}>
          <Avatar imageSrc={userThumbnail} size={50} />

          <Text>{user?.name ?? ''}</Text>

          {channelUser.isOwner ? <CrownIcon sx={{ height: '22px', width: '22px', mt: -0.5 }} /> : null}

          <Box flex={1} />

          {user?.id === selfUser.id.value ? (
            <Text variant="body2">{t('user:usermenu.party.you')}</Text>
          ) : channelUser.isOwner && user ? (
            <Text color="red" variant="body2" onClick={() => kickUser(user?.id)}>
              {t('user:usermenu.party.kick')}
            </Text>
          ) : null}
        </Box>
      )
    }
    return (
      <>
        {channelUsers.data.map((channelUser, i) => (
          <RenderUser key={channelUser.id} channelUser={channelUser} />
        ))}
      </>
    )
  }

  const RenderCreateButtons = () => {
    return (
      <Box flex={1}>
        <Button fullWidth type="gradientRounded" onClick={createParty}>
          {t('user:usermenu.party.create')}
        </Button>
        <Box display="flex" columnGap={1} alignItems="center">
          <Button fullWidth type="gradientRounded" onClick={() => PopupMenuServices.showPopupMenu(SocialMenus.Friends)}>
            {t('user:usermenu.share.friends')}
          </Button>
        </Box>
      </Box>
    )
  }

  const RenderUserButtons = () => {
    const selfChannelUser = useFind('channel-user', {
      query: {
        channelId: channelState.targetChannelId.value,
        userId: selfUser.id.value
      }
    })
    const friends = useFind('user-relationship', {
      query: {
        relationshipType: 'friend'
      }
    })
    const isOwned = selfChannelUser.data.length && selfChannelUser.data[0].isOwner
    const addFriendToChannel = (userId: UserId) => {
      const sendData = {
        inviteType: 'channel',
        inviteeId: userId,
        targetObjectId: channelState.targetChannelId.value,
        token: null
      } as SendInvite
      InviteService.sendInvite(sendData)
    }
    const InviteFriend = (props: { relationship: UserRelationship }) => {
      const friend = useGet('user', props.relationship.userId).data
      if (!friend) return <LoadingCircle />
      return (
        <Box key={friend.id} display="flex" alignItems="center" m={2} gap={1.5}>
          <Avatar alt={friend.name} imageSrc={getUserAvatarThumbnail(friend.id as UserId)} size={50} />

          <Text flex={1}>{friend.name}</Text>

          {props.relationship.userRelationshipType === 'friend' && (
            <IconButton
              icon={<Icon type="PersonAdd" sx={{ height: 30, width: 30 }} />}
              title={t('user:friends.message')}
              onClick={() => addFriendToChannel(props.relationship.userId)}
            />
          )}
        </Box>
      )
    }
    return (
      <Box flex={1}>
        {isInviteOpen.value && (
          <>
            {friends.data.map((relationship: UserRelationship) => (
              <InviteFriend key={relationship.id} relationship={relationship} />
            ))}
            <InputText
              endIcon={<Icon type="Send" />}
              placeholder={t('user:usermenu.share.ph-phoneEmail')}
              startIcon={<Icon type="Clear" />}
              sx={{ mb: 1, mt: 1 }}
              value={token}
              onChange={(e) => handleChangeToken(e)}
              onEndIconClick={sendInvite}
              onStartIconClick={() => isInviteOpen.set(false)}
            />
          </>
        )}

        <Box display="flex" columnGap={2} alignItems="center">
          <Button fullWidth type="gradientRounded" onClick={() => kickUser(selfUser.id.value)}>
            {t('user:usermenu.party.leave')}
          </Button>
          {isOwned && (
            <Button fullWidth type="gradientRounded" onClick={() => isInviteOpen.set(!isInviteOpen.value)}>
              {t('user:usermenu.party.invite')}
            </Button>
          )}
        </Box>

        {isOwned && (
          <Button fullWidth type="gradientRounded" onClick={() => isDeleteConfirmOpen.set(true)}>
            {t('user:common.delete')}
          </Button>
        )}

        {isDeleteConfirmOpen.value && (
          <ConfirmDialog
            open
            description={t('user:usermenu.party.deleteConfirmation')}
            submitButtonText={t('user:common.delete')}
            onClose={() => isDeleteConfirmOpen.set(false)}
            onSubmit={() => {
              deleteParty(channelState.targetChannelId.value)
              isDeleteConfirmOpen.set(false)
            }}
          />
        )}
      </Box>
    )
  }

  return (
    <Menu
      open
      maxWidth="xs"
      title={t('user:usermenu.party.title')}
      actions={inParty ? <RenderUserButtons /> : <RenderCreateButtons />}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent} display="flex" flexDirection="column">
        {inParty ? <RenderUsers /> : <RenderCreate />}
      </Box>
    </Menu>
  )
}

export default PartyMenu
