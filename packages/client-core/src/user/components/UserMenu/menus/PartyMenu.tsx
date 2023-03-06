import React from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import Button from '@etherealengine/client-core/src/common/components/Button'
import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { CrownIcon } from '@etherealengine/client-core/src/common/components/Icons/CrownIcon'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import Box from '@etherealengine/ui/src/Box'
import Icon from '@etherealengine/ui/src/Icon'

import { emailRegex, InviteService, phoneRegex } from '../../../../social/services/InviteService'
import { PartyService, usePartyState } from '../../../../social/services/PartyService'
import { useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { Views } from '../util'

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
      <Text align="center" flex={1} mt={4} variant="body2">
        {t('user:usermenu.party.createPartyText')}
      </Text>
    )
  }

  const renderUser = () => {
    return partyState.party.partyUsers.value?.map((user, i) => {
      return (
        <Box key={i} display="flex" alignItems="center" mb={2} gap={1}>
          <Avatar imageSrc={user.user.static_resources && user.user.static_resources[0].url} size={50} />

          <Text>{user.user.name}</Text>

          <CrownIcon sx={{ height: '22px', width: '22px', mt: -0.5 }} />

          <Box flex={1} />

          {user.user.id === selfUser.id.value ? (
            <Text variant="body2">{t('user:usermenu.party.you')}</Text>
          ) : partyState.isOwned.value ? (
            <Text color="red" variant="body2" onClick={() => kickUser(user.user.id)}>
              {t('user:usermenu.party.kick')}
            </Text>
          ) : null}
        </Box>
      )
    })
  }

  const renderCreateButtons = () => {
    return (
      <Box flex={1}>
        <Button fullWidth type="gradientRounded" onClick={createParty}>
          {t('user:usermenu.party.create')}
        </Button>
      </Box>
    )
  }

  const renderUserButtons = () => {
    return (
      <Box flex={1}>
        {isInviteOpen && (
          <InputText
            endIcon={<Icon type="Send" />}
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            startIcon={<Icon type="Clear" />}
            sx={{ mb: 1, mt: 1 }}
            value={token}
            onChange={(e) => handleChangeToken(e)}
            onEndIconClick={sendInvite}
            onStartIconClick={() => setInviteOpen(false)}
          />
        )}

        <Box display="flex" columnGap={2} alignItems="center">
          <Button fullWidth type="gradientRounded" onClick={() => kickUser(selfUser.id.value)}>
            {t('user:usermenu.party.leave')}
          </Button>
          {isOwned && (
            <Button fullWidth type="gradientRounded" onClick={() => setInviteOpen(!isInviteOpen)}>
              {t('user:usermenu.party.invite')}
            </Button>
          )}
        </Box>

        {isOwned && (
          <Button fullWidth type="gradientRounded" onClick={() => setIsDeleteConfirmOpen(true)}>
            {t('user:common.delete')}
          </Button>
        )}

        {isDeleteConfirmOpen && (
          <ConfirmDialog
            open
            description={t('user:usermenu.party.deleteConfirmation')}
            submitButtonText={t('user:common.delete')}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onSubmit={() => {
              deleteParty(partyState.party.id.value)
              setIsDeleteConfirmOpen(false)
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
      actions={partyState.party.value ? renderUserButtons() : renderCreateButtons()}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent} display="flex" flexDirection="column">
        {partyState.party.value ? renderUser() : renderCreate()}
      </Box>
    </Menu>
  )
}

export default PartyMenu
