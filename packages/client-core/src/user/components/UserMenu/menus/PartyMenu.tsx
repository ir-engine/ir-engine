import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'
import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import { OculusIcon } from '@xrengine/client-core/src/common/components/Icons/OculusIcon'
import InputCheck from '@xrengine/client-core/src/common/components/InputCheck'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Text from '@xrengine/client-core/src/common/components/Text'
import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import ClearIcon from '@mui/icons-material/Clear'
import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'

import { emailRegex, InviteService, phoneRegex } from '../../../../social/services/InviteService'
import { PartyService, usePartyState } from '../../../../social/services/PartyService'
import { useAuthState } from '../../../services/AuthService'
import { Views } from '../util'
import styles from './PartyMenu.module.scss'

export const usePartyMenuHooks = () => {
  const [token, setToken] = React.useState('')
  const [isInviteOpen, setInviteOpen] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const partyState = usePartyState()
  const selfUser = useAuthState().user

  const isOwned = partyState.isOwned?.value

  const createParty = () => {
    PartyService.createParty()
  }

  const kickUser = (userId: UserId) => {
    const partyUser = partyState.party?.partyUsers?.value
      ? partyState.party.partyUsers.value.find((partyUser) => {
          return partyUser.userId === userId
        })
      : null
    if (partyUser) PartyService.removePartyUser(partyUser.id)
  }

  const handleChangeToken = (e) => {
    setToken(e.target.value)
  }

  const deleteParty = (partyId: string) => {
    PartyService.removeParty(partyId)
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
    token,
    handleChangeToken,
    sendInvite,
    isInviteOpen,
    setInviteOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    deleteParty,
    isOwned,
    selfUser
  }
}

interface Props {
  changeActiveMenu: Function
}

const PartyMenu = ({ changeActiveMenu }: Props): JSX.Element => {
  const { t } = useTranslation()
  const partyState = usePartyState()

  const {
    createParty,
    kickUser,
    token,
    handleChangeToken,
    sendInvite,
    isInviteOpen,
    setInviteOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    deleteParty,
    isOwned,
    selfUser
  } = usePartyMenuHooks()

  const renderCreate = () => {
    return (
      <Box className={styles.menuContent}>
        <Text align="center" mt={4} variant="body2">
          {t('user:usermenu.party.createPartyText')}
        </Text>

        <Button className={styles.create} onClick={createParty}>
          {t('user:usermenu.party.create')}
        </Button>
      </Box>
    )
  }

  const renderUser = () => {
    return (
      <>
        {/* <section className={styles.midBlock}>
          {partyState.party.partyUsers.value?.map((user, i) => {
            return (
              <div className={styles.partyUserBlock + ' ' + styles.backDrop} key={i}>
                <div className={styles.userBlock}>
                  <div className={styles.profile}>
                    <img src={user.user.static_resources && user.user.static_resources[0].url} alt="" />
                  </div>
                  <div className={styles.userName}>{user.user.name}</div>
                  {user.isOwner && <img src="/icons/crown.svg" alt="" />}
                </div>
                {user.user.id === selfUser.id.value ? (
                  <span className={styles.admin}>{t('user:usermenu.party.you')}</span>
                ) : partyState.isOwned.value ? (
                  <Button className={styles.kick} onClick={() => kickUser(user.user.id)}>
                    {t('user:usermenu.party.kick')}
                  </Button>
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
                startAdornment: (
                  <InputAdornment position="start" onClick={() => setInviteOpen(false)} className={styles.cancelInvite}>
                    <ClearIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" onClick={sendInvite} className={styles.send}>
                    <SendIcon />
                  </InputAdornment>
                )
              }}
            />
          ) : (
            <div className={styles.controls}>
              <div className={styles.leaveInviteButtons}>
                <Button className={styles.leave} onClick={() => kickUser(selfUser.id.value)}>
                  {t('user:usermenu.party.leave')}
                </Button>
                {isOwned && (
                  <Button className={styles.invite} onClick={() => setInviteOpen(true)}>
                    {t('user:usermenu.party.invite')}
                  </Button>
                )}
              </div>
              {isOwned && !isDeleteConfirmOpen && (
                <Button className={styles.startDelete} onClick={() => setIsDeleteConfirmOpen(true)}>
                  {t('user:usermenu.party.initDelete')}
                </Button>
              )}
              {isOwned && isDeleteConfirmOpen && (
                <div className={styles.confirmDeleteButtons}>
                  <Button
                    className={styles.confirmDelete}
                    onClick={() => {
                      deleteParty(partyState.party.id.value)
                      setIsDeleteConfirmOpen(false)
                    }}
                  >
                    {t('user:usermenu.party.confirmDelete')}
                  </Button>
                  <Button className={styles.cancelDelete} onClick={() => setIsDeleteConfirmOpen(false)}>
                    {t('user:usermenu.party.cancelDelete')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
        
        



        
      <div className={styles.menuContent}>
        {!partyState.party.value && (
          <Text align="center" mt={4} variant="body2">
            {t('user:usermenu.party.createPartyText')}
          </Text>
        )}

        <Button className={styles.create} onClick={createParty}>
          {t('user:usermenu.party.create')}
        </Button>

        {displayList.map((value) => (
          <Box key={value.id} display="flex" alignItems="center" m={2} gap={1.5}>
            <Avatar alt={value.name} imageSrc={getAvatarURLForUser(userAvatarDetails, value.id)} size={50} />

            <Text flex={1}>{value.name}</Text>

            {value.relationType === 'friend' && (
              <IconButton
                icon={<MessageIcon sx={{ height: 30, width: 30 }} />}
                title={t('user:friends.message')}
                onClick={() => NotificationService.dispatchNotify('Chat Pressed', { variant: 'info' })}
              />
            )}

            {value.relationType === 'pending' && (
              <>
                <Chip className={commonStyles.chip} label={t('user:friends.pending')} size="small" variant="outlined" />

                <IconButton
                  icon={<CheckIcon sx={{ height: 30, width: 30 }} />}
                  title={t('user:friends.accept')}
                  onClick={() => FriendService.acceptFriend(userId, value.id)}
                />

                <IconButton
                  icon={<CloseIcon sx={{ height: 30, width: 30 }} />}
                  title={t('user:friends.decline')}
                  onClick={() => FriendService.declineFriend(userId, value.id)}
                />
              </>
            )}

            {value.relationType === 'requested' && (
              <Chip className={commonStyles.chip} label={t('user:friends.requested')} size="small" variant="outlined" />
            )}

            {value.relationType === 'blocking' && (
              <IconButton
                icon={<HowToRegIcon sx={{ height: 30, width: 30 }} />}
                title={t('user:friends.unblock')}
                onClick={() => FriendService.unblockUser(userId, value.id)}
              />
            )}

            <IconButton
              icon={<AccountCircleIcon sx={{ height: 30, width: 30 }} />}
              title={t('user:friends.profile')}
              onClick={() => handleProfile(value)}
            />
          </Box>
        ))}
      </div>
        
        
        */}
      </>
    )
  }

  return (
    <Menu open title={t('user:usermenu.party.title')} onClose={() => changeActiveMenu(Views.Closed)}>
      {partyState.party.value ? renderUser() : renderCreate()}
    </Menu>
  )
}

export default PartyMenu
