import { QRCodeSVG } from 'qrcode.react'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'

import { CheckBox, CheckBoxOutlineBlank, FileCopy, IosShare, Send } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { NotificationService } from '../../../../common/services/NotificationService'
import { InviteService } from '../../../../social/services/InviteService'
import { useInviteState } from '../../../../social/services/InviteService'
import { useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'

export const useShareMenuHooks = ({ refLink }) => {
  const { t } = useTranslation()
  const [email, setEmail] = React.useState('')
  const postTitle = 'AR/VR world'
  const siteTitle = 'XREngine'
  const inviteState = useInviteState()

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
        console.log('Successfully shared')
      })
      .catch((error) => {
        console.error('Something went wrong sharing the world', error)
      })
  }

  const packageInvite = async (): Promise<void> => {
    const sendData = {
      type: 'friend',
      token: email,
      inviteCode: null,
      identityProviderType: 'email',
      targetObjectId: inviteState.targetObjectId.value,
      invitee: null
    }
    InviteService.sendInvite(sendData)
    setEmail('')
  }

  const handleChang = (e) => {
    setEmail(e.target.value)
  }

  const getInviteLink = () => {
    const location = new URL(window.location as any)
    let params = new URLSearchParams(location.search)
    if (selfUser?.inviteCode.value != null) {
      params.append('inviteCode', selfUser.inviteCode.value)
      location.search = params.toString()
      return location
    } else {
      return location
    }
  }
  const getSpectateModeUrl = () => {
    const location = new URL(window.location as any)
    let params = new URLSearchParams(location.search)
    params.append('spectate', selfUser.id.value)
    location.search = params.toString()
    return location
  }
  return {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChang,
    getInviteLink,
    getSpectateModeUrl,
    email
  }
}
interface Props {
  isMobileView?: boolean
}
const ShareMenu = (props: Props): JSX.Element => {
  const { t } = useTranslation()
  const [isSpectatorMode, setSpectatorMode] = useState<boolean>(false)
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>
  const { copyLinkToClipboard, shareOnApps, packageInvite, handleChang, getInviteLink, getSpectateModeUrl, email } =
    useShareMenuHooks({
      refLink
    })

  return (
    <div className={styles.menuPanel}>
      <div className={styles.sharePanel}>
        {!props.isMobileView ? (
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
                  onChange={() => setSpectatorMode(!isSpectatorMode)}
                />
              }
              label={t('user:usermenu.share.lbl-spectator-mode')}
            />
          </>
        ) : (
          <Typography variant="h2" className={styles.title}>
            {t('user:usermenu.share.mobileTitle')}
          </Typography>
        )}
        <div className={styles.QRContainer}>
          <QRCodeSVG
            height={176}
            width={200}
            value={isSpectatorMode ? getSpectateModeUrl().toString() : getInviteLink().toString()}
          />
        </div>
        <TextField
          className={styles.copyField}
          size="small"
          variant="outlined"
          value={isSpectatorMode ? getSpectateModeUrl().toString() : getInviteLink().toString()}
          disabled={true}
          inputRef={refLink}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" onClick={copyLinkToClipboard}>
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
          value={email}
          onChange={(e) => handleChang(e)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" onClick={packageInvite}>
                <Send />
              </InputAdornment>
            )
          }}
        />
        {isShareAvailable && (
          <div className={styles.shareBtnContainer}>
            <Button className={styles.shareBtn} onClick={shareOnApps} endIcon={<IosShare />}>
              {t('user:usermenu.share.lbl-share')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShareMenu
