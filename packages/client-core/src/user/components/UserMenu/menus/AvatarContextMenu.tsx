import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@xrengine/hyperflux'

import ArrowBack from '@mui/icons-material/ArrowBack'
import { Chip, Typography } from '@mui/material'
import Button from '@mui/material/Button'

import { NotificationService } from '../../../../common/services/NotificationService'
import { FriendService, useFriendState } from '../../../../social/services/FriendService'
import { InviteService } from '../../../../social/services/InviteService'
import { PartyService, usePartyState } from '../../../../social/services/PartyService'
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

  // TODO: move these to widget register
  PartyService.useAPIListeners()

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
    <div className={styles.menuPanel}>
      <div className={styles.avatarContextPanel}>
        {user && user.id && (
          <>
            {onBack && (
              <div className={styles.headerBlock}>
                <button type="button" className={styles.iconBlock} onClick={onBack}>
                  <ArrowBack />
                </button>
              </div>
            )}

            <img
              className={styles.ownerImage}
              src={getAvatarURLForUser(userAvatarDetails, user.id)}
              alt=""
              crossOrigin="anonymous"
            />
            <section className={styles.contentSection}>
              <Typography className={styles.userName} variant="h6">
                {user.name}
              </Typography>

              {partyState?.party?.id?.value != null &&
                partyOwner?.userId != null &&
                partyOwner.userId === authState.user.id?.value &&
                user.partyId !== partyState.party?.id?.value && (
                  <Button className={styles.gradientBtn} onClick={inviteToParty}>
                    {t('user:personMenu.inviteToParty')}
                  </Button>
                )}

              {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
                <Button
                  className={styles.gradientBtn}
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
                  className={styles.gradientBtn}
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
                    className={styles.chip}
                    sx={{ margin: '10px 0 !important' }}
                    label={t('user:friends.pending')}
                    size="small"
                    variant="outlined"
                  />

                  <Button
                    className={styles.gradientBtn}
                    onClick={() => {
                      FriendService.acceptFriend(selfId, user.id)
                      changeActiveMenu(Views.Friends)
                    }}
                  >
                    {t('user:personMenu.acceptRequest')}
                  </Button>

                  <Button
                    className={styles.gradientBtn}
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
                    className={styles.chip}
                    sx={{ margin: '10px 0 !important' }}
                    label={t('user:friends.requested')}
                    size="small"
                    variant="outlined"
                  />

                  <Button
                    className={styles.gradientBtn}
                    onClick={() => {
                      FriendService.unfriend(selfId, user.id)
                      changeActiveMenu(Views.Friends, { defaultSelectedTab: 'find' })
                    }}
                  >
                    {t('user:personMenu.cancelRequest')}
                  </Button>
                </>
              )}

              <Button className={styles.gradientBtn} onClick={handleMute}>
                {t('user:personMenu.mute')}
              </Button>

              {!isBlocked && !isBlocking && (
                <Button
                  className={styles.gradientBtn}
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
                  className={styles.gradientBtn}
                  onClick={() => {
                    FriendService.unblockUser(selfId, user.id)
                    changeActiveMenu(Views.Friends)
                  }}
                >
                  {t('user:personMenu.unblock')}
                </Button>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default AvatarContextMenu
