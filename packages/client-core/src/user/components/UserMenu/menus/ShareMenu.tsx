import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@etherealengine/client-core/src/common/components/Button'
import { OculusIcon } from '@etherealengine/client-core/src/common/components/Icons/OculusIcon'
import InputCheck from '@etherealengine/client-core/src/common/components/InputCheck'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import multiLogger from '@etherealengine/common/src/logger'
import { isShareAvailable } from '@etherealengine/engine/src/common/functions/DetectFeatures'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { emailRegex, InviteService, phoneRegex } from '../../../../social/services/InviteService'
import { useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { Views } from '../util'

const logger = multiLogger.child({ component: 'client-core:ShareMenu' })

export const useShareMenuHooks = ({ refLink }) => {
  const { t } = useTranslation()
  const [token, setToken] = React.useState('')
  const [isSpectatorMode, setSpectatorMode] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState('')
  const engineState = useEngineState()
  const selfUser = useAuthState().user

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(refLink.current.value)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }

  const shareOnApps = () => {
    navigator
      .share({
        title: t('user:usermenu.share.shareTitle'),
        text: t('user:usermenu.share.shareDescription'),
        url: document.location.href
      })
      .then(() => {
        logger.info('Successfully shared')
      })
      .catch((error) => {
        logger.error(error, 'Error during sharing')
        NotificationService.dispatchNotify(t('user:usermenu.share.shareFailed'), { variant: 'error' })
      })
  }

  const packageInvite = async (): Promise<void> => {
    const isEmail = emailRegex.test(token)
    const isPhone = phoneRegex.test(token)
    const location = new URL(window.location as any)
    let params = new URLSearchParams(location.search)
    const sendData = {
      inviteType: 'instance',
      token: token.length === 8 ? null : token,
      inviteCode: token.length === 8 ? token : null,
      identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
      targetObjectId: params.get('instanceId'),
      inviteeId: null,
      deleteOnUse: true
    } as SendInvite

    if (isSpectatorMode) {
      sendData.spawnType = 'spectate'
      sendData.spawnDetails = { spectate: selfUser.id.value }
    } else if (selfUser?.inviteCode.value) {
      sendData.spawnType = 'inviteCode'
      sendData.spawnDetails = { inviteCode: selfUser.inviteCode.value }
    }

    InviteService.sendInvite(sendData)
    setToken('')
  }

  const handleChangeToken = (e) => {
    setToken(e.target.value)
  }

  const getInviteLink = () => {
    const location = new URL(window.location as any)
    let params = new URLSearchParams(location.search)
    if (selfUser?.inviteCode.value != null) {
      params.set('inviteCode', selfUser.inviteCode.value)
      location.search = params.toString()
      return location.toString()
    } else {
      return location.toString()
    }
  }

  const getSpectateModeUrl = () => {
    const location = new URL(window.location as any)
    let params = new URLSearchParams(location.search)
    params.set('spectate', selfUser.id.value)
    params.delete('inviteCode')
    location.search = params.toString()
    return location.toString()
  }

  const toggleSpectatorMode = () => {
    setSpectatorMode(!isSpectatorMode)
  }

  useEffect(() => {
    if (engineState.shareLink.value !== '') setShareLink(engineState.shareLink.value)
    else setShareLink(isSpectatorMode ? getSpectateModeUrl() : getInviteLink())
  }, [engineState.shareLink.value, isSpectatorMode])

  return {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode
  }
}

interface Props {
  changeActiveMenu: (str: string) => void
}

const ShareMenu = ({ changeActiveMenu }: Props): JSX.Element => {
  const { t } = useTranslation()
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>
  const engineState = useEngineState()
  const {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode
  } = useShareMenuHooks({
    refLink
  })

  // Ref: https://developer.oculus.com/documentation/web/web-launch
  let questShareLink = new URL('https://oculus.com/open_url/')
  questShareLink.searchParams.set('url', shareLink)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }

  return (
    <Menu
      open
      title={engineState.shareTitle.value ? engineState.shareTitle.value : t('user:usermenu.share.title')}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent}>
        <Box className={styles.shareQuest}>
          <Button
            className={styles.shareQuestButton}
            endIcon={<OculusIcon sx={{ width: '36px', height: '36px', margin: '-7px 0 -5px -7px' }} />}
            type="gradientRounded"
            onClick={() => window.open(questShareLink, '_blank')}
          >
            {t('user:usermenu.share.shareQuest')}
          </Button>
          <IconButton
            icon={<Icon type="FileCopy" sx={{ width: '18px' }} />}
            sizePx={35}
            onClick={() => copyToClipboard(questShareLink.toString())}
          />
        </Box>

        <div className={styles.QRContainer}>
          <QRCodeSVG height={176} width={200} value={shareLink} />
        </div>

        {!engineState.shareTitle.value && (
          <InputCheck
            label={t('user:usermenu.share.lbl-spectator-mode')}
            checked={isSpectatorMode}
            onChange={toggleSpectatorMode}
          />
        )}

        <InputText
          endIcon={<Icon type="ContentCopy" />}
          inputRef={refLink}
          label={t('user:usermenu.share.shareDirect')}
          sx={{ mt: 2, mb: 3 }}
          value={shareLink}
          onEndIconClick={copyLinkToClipboard}
        />

        <InputText
          endIcon={<Icon type="Send" />}
          label={t('user:usermenu.share.shareInvite')}
          placeholder={t('user:usermenu.share.ph-phoneEmail')}
          value={token}
          onChange={(e) => handleChangeToken(e)}
          onEndIconClick={packageInvite}
        />

        {isShareAvailable && (
          <Button fullWidth type="solidRounded" endIcon={<Icon type="IosShare" />} onClick={shareOnApps}>
            {t('user:usermenu.share.lbl-share')}
          </Button>
        )}

        <Box display="flex" columnGap={2} alignItems="center">
          <Button fullWidth type="gradientRounded" onClick={() => changeActiveMenu(Views.Party)}>
            {t('user:usermenu.share.party')}
          </Button>
          <Button fullWidth type="gradientRounded" onClick={() => changeActiveMenu(Views.Friends)}>
            {t('user:usermenu.share.friends')}
          </Button>
        </Box>
      </Box>
    </Menu>
  )
}

export default ShareMenu
