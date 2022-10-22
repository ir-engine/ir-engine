import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import multiLogger from '@xrengine/common/src/logger'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'

import { CheckBox, CheckBoxOutlineBlank, FileCopy, IosShare, Send } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { NotificationService } from '../../../../common/services/NotificationService'
import { emailRegex, InviteService, phoneRegex } from '../../../../social/services/InviteService'
import { useInviteState } from '../../../../social/services/InviteService'
import { useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { Views } from '../util'

const logger = multiLogger.child({ component: 'client-core:ShareMenu' })

export const useShareMenuHooks = ({ refLink }) => {
  const { t } = useTranslation()
  const [token, setToken] = React.useState('')
  const [isSpectatorMode, setSpectatorMode] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState('')
  const postTitle = 'AR/VR world'
  const siteTitle = 'XREngine'
  const engineState = useEngineState()

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(refLink.current.value)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }
  const selfUser = useAuthState().user

  const shareOnApps = () => {
    navigator
      .share({
        title: `${postTitle} | ${siteTitle}`,
        text: `Check out ${postTitle} on ${siteTitle}`,
        url: document.location.href
      })
      .then(() => {
        logger.info('Successfully shared')
      })
      .catch((error) => {
        logger.error(error, 'Error during sharing')
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
    toggleSpectatorMode
  }
}

interface Props {
  changeActiveMenu: (str: string) => void
}

const ShareMenu = (props: Props): JSX.Element => {
  const { t } = useTranslation()
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>
  const engineState = useEngineState()
  const { copyLinkToClipboard, shareOnApps, packageInvite, handleChangeToken, token, shareLink, toggleSpectatorMode } =
    useShareMenuHooks({
      refLink
    })

  return (
    <div className={styles.menuPanel}>
      <div className={styles.sharePanel}>
        {engineState.shareTitle.value ? (
          <Typography variant="h2" className={styles.title}>
            {engineState.shareTitle.value}
          </Typography>
        ) : (
          <>
            <Typography variant="h1" className={styles.panelHeader}>
              {t('user:usermenu.share.title')}
            </Typography>
            <FormControlLabel
              classes={{
                label: styles.label,
                root: styles.formRoot
              }}
              control={
                <Checkbox
                  className={styles.checkboxMode}
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                  name="checked"
                  color="primary"
                  onChange={toggleSpectatorMode}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                />
              }
              label={t('user:usermenu.share.lbl-spectator-mode')}
            />
          </>
        )}
        <div className={styles.QRContainer}>
          <QRCodeSVG height={176} width={200} value={shareLink} />
        </div>
        <TextField
          className={styles.copyField}
          size="small"
          variant="outlined"
          value={shareLink}
          disabled={true}
          inputRef={refLink}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                onClick={copyLinkToClipboard}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              >
                <FileCopy />
              </InputAdornment>
            )
          }}
        />
        <TextField
          className={styles.emailField}
          size="small"
          placeholder={t('user:usermenu.share.ph-phoneEmail')}
          variant="outlined"
          value={token}
          onChange={(e) => handleChangeToken(e)}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                onClick={packageInvite}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              >
                <Send />
              </InputAdornment>
            )
          }}
        />
        {isShareAvailable && (
          <div className={styles.shareBtnContainer}>
            <Button
              className={styles.shareBtn}
              onClick={shareOnApps}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              endIcon={<IosShare />}
            >
              {t('user:usermenu.share.lbl-share')}
            </Button>
          </div>
        )}
        <div className={styles.shareBtnContainer}>
          <Button
            className={styles.friendsBtn}
            onClick={() => props.changeActiveMenu(Views.Party)}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            {t('user:usermenu.share.party')}
          </Button>
          <Button
            className={styles.friendsBtn}
            onClick={() => props.changeActiveMenu(Views.Friends)}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            {t('user:usermenu.share.friends')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ShareMenu
