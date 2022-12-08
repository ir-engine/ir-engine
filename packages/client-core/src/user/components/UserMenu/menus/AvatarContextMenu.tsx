import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import Button from '@xrengine/client-core/src/common/components/Button'
import commonStyles from '@xrengine/client-core/src/common/components/common.module.scss'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Text from '@xrengine/client-core/src/common/components/Text'
import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@xrengine/hyperflux'

import { Box, Chip } from '@mui/material'

import { NotificationService } from '../../../../common/services/NotificationService'
import { FriendService, useFriendState } from '../../../../social/services/FriendService'
import { InviteService } from '../../../../social/services/InviteService'
import { usePartyState } from '../../../../social/services/PartyService'
import { useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { getAvatarURLForUser, Views } from '../util'

interface Props {
  changeActiveMenu: Function
  user: UserInterface
  onBack?: () => void
}

const AvatarContextMenu = ({ changeActiveMenu, user, onBack }: Props): JSX.Element => {
  const { t } = useTranslation()

  const partyState = usePartyState()
  const friendState = useFriendState()

  const authState = useAuthState()
  const selfId = authState.user.id?.value ?? ''

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)
  const partyOwner = partyState.party?.partyUsers?.value
    ? partyState.party.partyUsers.value.find((partyUser) => partyUser.isOwner)
    : null

  const isFriend = friendState.relationships.friend.value.find((item) => item.id === user?.id)
  const isRequested = friendState.relationships.requested.value.find((item) => item.id === user?.id)
  const isPending = friendState.relationships.pending.value.find((item) => item.id === user?.id)
  const isBlocked = friendState.relationships.blocked.value.find((item) => item.id === user?.id)
  const isBlocking = friendState.relationships.blocking.value.find((item) => item.id === user?.id)

  useEffect(() => {
    if (friendState.updateNeeded.value === true) {
      FriendService.getUserRelationship(selfId)
    }
  }, [friendState.updateNeeded.value])

  const inviteToParty = () => {
    if (authState.user?.partyId?.value && user?.id) {
      const partyId = authState.user?.partyId?.value ?? ''
      const userId = user.id
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
      showBackButton={onBack ? true : false}
      onBack={onBack}
      onClose={() => changeActiveMenu && changeActiveMenu(Views.Closed)}
    >
      {user && user.id && (
        <Box className={styles.menuContent} display={'flex'} flexDirection={'column'}>
          <Avatar imageSrc={getAvatarURLForUser(userAvatarDetails, user.id)} size={150} />

          <Text variant="h6" align="center" mt={2} mb={1}>
            {user.name}
          </Text>

          {partyState?.party?.id?.value != null &&
            partyOwner?.userId != null &&
            partyOwner.userId === authState.user.id?.value &&
            user.partyId !== partyState.party?.id?.value && (
              <Button type="gradientRounded" onClick={inviteToParty}>
                {t('user:personMenu.inviteToParty')}
              </Button>
            )}

          {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              onClick={() => {
                FriendService.requestFriend(selfId, user.id)
                changeActiveMenu(Views.Friends, { defaultSelectedTab: 'find' })
              }}
            >
              {t('user:personMenu.addAsFriend')}
            </Button>
          )}

          {isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              onClick={() => {
                FriendService.unfriend(selfId, user.id)
                changeActiveMenu(Views.Friends, { defaultSelectedTab: 'find' })
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
                onClick={() => {
                  FriendService.acceptFriend(selfId, user.id)
                  changeActiveMenu(Views.Friends)
                }}
              >
                {t('user:personMenu.acceptRequest')}
              </Button>

              <Button
                type="gradientRounded"
                onClick={() => {
                  FriendService.declineFriend(selfId, user.id)
                  changeActiveMenu(Views.Friends, { defaultSelectedTab: 'find' })
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
                onClick={() => {
                  FriendService.unfriend(selfId, user.id)
                  changeActiveMenu(Views.Friends, { defaultSelectedTab: 'find' })
                }}
              >
                {t('user:personMenu.cancelRequest')}
              </Button>
            </>
          )}

          <Button type="gradientRounded" onClick={handleMute}>
            {t('user:personMenu.mute')}
          </Button>

          {!isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              onClick={() => {
                FriendService.blockUser(selfId, user.id)
                changeActiveMenu(Views.Friends, { defaultSelectedTab: 'blocked' })
              }}
            >
              {t('user:personMenu.block')}
            </Button>
          )}

          {isBlocking && (
            <Button
              type="gradientRounded"
              onClick={() => {
                FriendService.unblockUser(selfId, user.id)
                changeActiveMenu(Views.Friends)
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
