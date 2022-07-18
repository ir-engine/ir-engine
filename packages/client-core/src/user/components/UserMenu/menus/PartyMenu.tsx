import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Send } from '@mui/icons-material'
import { InputAdornment, TextField } from '@mui/material'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { emailRegex, InviteService, phoneRegex } from '../../../../social/services/InviteService'
import { PartyService, usePartyState } from '../../../../social/services/PartyService'
import { useAuthState } from '../../../services/AuthService'
import styles from './PartyMenu.module.scss'

export const usePartyMenuHooks = () => {
  const [token, setToken] = React.useState('')
  const [isInviteOpen, setInviteOpen] = React.useState(false)
  const partyState = usePartyState()
  const selfUser = useAuthState().user

  const createParty = () => {
    PartyService.createParty()
  }

  const kickUser = (userId: UserId) => {
    PartyService.removePartyUser(userId)
  }

  const getUsers = () => {
    PartyService.getPartyUsers()
  }

  const handleChangeToken = (e) => {
    setToken(e.target.value)
  }

  const sendInvite = async (): Promise<void> => {
    const isEmail = emailRegex.test(token)
    const isPhone = phoneRegex.test(token)
    const sendData = {
      inviteType: 'party',
      token,
      inviteCode: null,
      identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
      targetObjectId: partyState.party.id.value,
      inviteeId: null,
      deleteOnUse: true,
      spawnType: 'inviteCode',
      spawnDetails: { inviteCode: selfUser.inviteCode.value }
    } as SendInvite

    InviteService.sendInvite(sendData)
    setToken('')
    setInviteOpen(false)
  }

  return {
    createParty,
    kickUser,
    getUsers,
    token,
    handleChangeToken,
    sendInvite,
    isInviteOpen,
    setInviteOpen
  }
}

const SocialMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const partyState = usePartyState()
  const authUser = useAuthState().authUser.value

  const { createParty, kickUser, getUsers, token, handleChangeToken, sendInvite, isInviteOpen, setInviteOpen } =
    usePartyMenuHooks()

  useEffect(() => {
    getUsers()
  }, [])

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
                {user.user.id === authUser.identityProvider.userId ? (
                  <span className={styles.admin}>{t('user:usermenu.party.you')}</span>
                ) : partyState.isOwned.value ? (
                  <Button className={styles.kick} onClick={() => kickUser(user.user.id)}>
                    {t('user:usermenu.party.kick')}
                  </Button>
                ) : user.isOwner ? (
                  <span className={styles.admin}>{t('user:usermenu.party.admin')}</span>
                ) : null}
              </div>
            )
          })}
        </section>
        <section className={styles.actionBlock + ' ' + styles.backDrop}>
          {isInviteOpen ? (
            <TextField
              className={styles.emailField}
              size="small"
              placeholder={t('user:usermenu.share.ph-phoneEmail')}
              variant="outlined"
              value={token}
              onChange={(e) => handleChangeToken(e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" onClick={sendInvite} className={styles.send}>
                    <Send />
                  </InputAdornment>
                )
              }}
            />
          ) : (
            <>
              <Button className={styles.leave} onClick={() => kickUser(authUser.identityProvider.userId)}>
                {t('user:usermenu.party.leave')}
              </Button>
              <Button className={styles.invite} onClick={() => setInviteOpen(true)}>
                {t('user:usermenu.party.invite')}
              </Button>
            </>
          )}
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
