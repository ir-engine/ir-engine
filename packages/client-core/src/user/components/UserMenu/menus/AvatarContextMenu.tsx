import { useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@xrengine/hyperflux'

import { Typography } from '@mui/material'
import Button from '@mui/material/Button'

import { FriendService } from '../../../../social/services/FriendService'
import { InviteService } from '../../../../social/services/InviteService'
import { PartyService, usePartyState } from '../../../../social/services/PartyService'
import { useAuthState } from '../../../services/AuthService'
import { useUserState } from '../../../services/UserService'
import styles from '../index.module.scss'
import { getAvatarURLForUser } from '../util'

const AvatarContextMenu = (): JSX.Element => {
  const { t } = useTranslation()

  const engineState = useEngineState()
  const userState = useUserState()
  const partyState = usePartyState()

  const authState = useAuthState()
  const user = userState.layerUsers.find((user) => user.id.value === engineState.avatarTappedId.value)

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)
  const partyOwner = partyState.party?.partyUsers?.value
    ? partyState.party.partyUsers.value.find((partyUser) => partyUser.isOwner)
    : null

  // TODO: move these to widget register
  PartyService.useAPIListeners()

  const blockUser = () => {
    if (user) {
      const blockUserId = user.id?.value ?? ''
      FriendService.blockUser(blockUserId)
    }
  }

  const addAsFriend = () => {
    if (user) {
      const friendUserId = user.id?.value ?? ''
      FriendService.requestFriend(friendUserId)
    }
  }

  const acceptAsFriend = () => {
    if (user) {
      const friendUserId = user.id?.value ?? ''
      FriendService.acceptFriend(friendUserId)
    }
  }

  const inviteToParty = () => {
    if (authState.user?.partyId?.value && user?.id?.value) {
      const partyId = authState.user?.partyId?.value ?? ''
      const userId = user.id?.value
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
        {user?.id.value && (
          <>
            <img
              className={styles.ownerImage}
              src={getAvatarURLForUser(userAvatarDetails, user?.id?.value)}
              alt=""
              crossOrigin="anonymous"
            />
            <section className={styles.contentSection}>
              <Typography className={styles.userName} variant="h6">
                {user?.name?.value}
              </Typography>

              {partyState?.party?.id?.value != null &&
                partyOwner?.userId != null &&
                partyOwner.userId === authState.user?.id?.value &&
                user.partyId.value !== partyState.party?.id?.value && (
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
