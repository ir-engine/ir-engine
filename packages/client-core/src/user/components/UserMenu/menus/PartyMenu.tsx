import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { PartyService, usePartyState } from '../../../../social/services/PartyService'
import { useAuthState } from '../../../services/AuthService'
import { Views } from '../util'
import styles from './PartyMenu.module.scss'

export type SocialMenuProps = {
  changeActiveMenu?: (type: string | null) => void
}

export const usePartyMenuHooks = () => {
  const createParty = () => {
    PartyService.createParty()
  }

  const kickUser = (userId: UserId) => {
    PartyService.removePartyUser(userId)
  }

  const getUsers = () => {
    PartyService.getPartyUsers()
  }

  return {
    createParty,
    kickUser,
    getUsers
  }
}

const SocialMenu = (props: SocialMenuProps): JSX.Element => {
  const { t } = useTranslation()
  const partyState = usePartyState()
  const authUser = useAuthState().authUser.value

  const { createParty, kickUser, getUsers } = usePartyMenuHooks()

  const renderCreate = () => {
    return (
      <>
        <section className={styles.midBlock}>
          <div className={styles.noUserBlock + ' ' + styles.backDrop}>{t('user:usermenu.party.createPartyText')}</div>
        </section>
        <section className={styles.actionBlock + ' ' + styles.backDrop}>
          <Button className={styles.create} onClick={createParty}>
            {t('user:usermenu.party.create')}
          </Button>
        </section>
      </>
    )
  }

  const renderUser = () => {
    return (
      <>
        <section className={styles.midBlock}>
          {partyState.party.partyUsers.value.map((user, i) => {
            return (
              <div className={styles.partyUserBlock + ' ' + styles.backDrop} key={i}>
                <div className={styles.userBlock}>
                  <div className={styles.profile}>
                    <img src={user.user.static_resources && user.user.static_resources[0].url} alt="" />
                  </div>
                  <div className={styles.userName}>{user.user.name}</div>
                </div>
                {partyState.isOwned.value && user.user.id !== authUser.identityProvider.userId && (
                  <Button className={styles.kick} onClick={() => kickUser(user.user.id)}>
                    {t('user:usermenu.party.kick')}
                  </Button>
                )}
              </div>
            )
          })}
        </section>
        <section className={styles.actionBlock + ' ' + styles.backDrop}>
          <Button className={styles.leave} onClick={() => kickUser(authUser.identityProvider.userId)}>
            {t('user:usermenu.party.leave')}
          </Button>
          <Button className={styles.invite} onClick={() => props.changeActiveMenu?.(Views.Share)}>
            {t('user:usermenu.party.invite')}
          </Button>
        </section>
      </>
    )
  }

  return (
    <div className={styles.menuPanel}>
      <div className={styles.partyPanel}>
        <Typography variant="h1" className={styles.panelHeader}>
          {t('user:usermenu.party.title')}
        </Typography>
        {partyState.party.value ? renderUser() : renderCreate()}
      </div>
    </div>
  )
}

export default SocialMenu
