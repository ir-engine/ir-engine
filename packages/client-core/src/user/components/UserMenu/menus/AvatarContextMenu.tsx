import { useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@xrengine/hyperflux'

import { Typography } from '@mui/material'
import Button from '@mui/material/Button'

import { FriendService } from '../../../../social/services/FriendService'
import { InviteService } from '../../../../social/services/InviteService'
import { PartyService, usePartyState } from '../../../../social/services/PartyService'
import { useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { getAvatarURLForUser } from '../util'

interface Props {
  changeActiveMenu: Function
  user: UserInterface
}

const AvatarContextMenu = ({ user }: Props): JSX.Element => {
  const { t } = useTranslation()

  const partyState = usePartyState()

  const authState = useAuthState()
  const selfId = authState.user.id?.value ?? ''

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)
  const partyOwner = partyState.party?.partyUsers?.value
    ? partyState.party.partyUsers.value.find((partyUser) => partyUser.isOwner)
    : null

  // TODO: move these to widget register
  PartyService.useAPIListeners()

  const blockUser = () => {
    if (user) {
      const blockUserId = user.id ?? ''
      FriendService.blockUser(selfId, blockUserId)
    }
  }

  const addAsFriend = () => {
    if (user) {
      const friendUserId = user.id ?? ''
      FriendService.requestFriend(selfId, friendUserId)
    }
  }

  const acceptAsFriend = () => {
    if (user) {
      const friendUserId = user.id ?? ''
      FriendService.acceptFriend(selfId, friendUserId)
    }
  }

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
  }

  return (
    <div className={styles.menuPanel}>
      <div className={styles.avatarContextPanel}>
        {user?.id && (
          <>
            <img
              className={styles.ownerImage}
              src={getAvatarURLForUser(userAvatarDetails, user?.id)}
              alt=""
              crossOrigin="anonymous"
            />
            <section className={styles.contentSection}>
              <Typography className={styles.userName} variant="h6">
                {user?.name}
              </Typography>

              {partyState?.party?.id?.value != null &&
                partyOwner?.userId != null &&
                partyOwner.userId === authState.user?.id?.value &&
                user.partyId !== partyState.party?.id?.value && (
                  <Button className={styles.gradientBtn} onClick={inviteToParty}>
                    {t('user:personMenu.inviteToParty')}
                  </Button>
                )}
              <Button className={styles.gradientBtn} onClick={addAsFriend}>
                {t('user:personMenu.addAsFriend')}
              </Button>

              <Button className={styles.gradientBtn} onClick={acceptAsFriend}>
                Confirm
              </Button>
              <Button className={styles.gradientBtn} onClick={handleMute}>
                {t('user:personMenu.mute')}
              </Button>
              <Button className={styles.gradientBtn} onClick={blockUser}>
                {t('user:personMenu.block')}
              </Button>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default AvatarContextMenu
