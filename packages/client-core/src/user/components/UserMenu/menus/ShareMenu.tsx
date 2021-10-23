import React, { useRef } from 'react'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Send, FileCopy } from '@material-ui/icons'
import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import styles from '../UserMenu.module.scss'
import { InviteService } from '../../../../social/state/InviteService'
import { useDispatch } from '../../../../store'
import { useTranslation } from 'react-i18next'
import { useInviteState } from '../../../../social/state/InviteState'

interface Props {
  alertSuccess?: any
}

const ShareMenu = (props: Props): any => {
  const { t } = useTranslation()
  const [email, setEmail] = React.useState('')
  const refLink = useRef(null)
  const postTitle = 'AR/VR world'
  const siteTitle = 'XREngine'
  const dispatch = useDispatch()
  const inviteState = useInviteState()
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(refLink.current.value)
    props.alertSuccess(t('user:usermenu.share.linkCopied'))
  }

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

  return (
    <div className={styles.menuPanel}>
      <div className={styles.sharePanel}>
        <Typography variant="h1" className={styles.panelHeader}>
          {t('user:usermenu.share.title')}
        </Typography>
        <TextField
          className={styles.copyField}
          size="small"
          variant="outlined"
          value={window.location.href}
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
        />
        <div className={styles.sendInviteContainer}>
          <Button className={styles.sendInvite} onClick={packageInvite}>
            {t('user:usermenu.share.lbl-send-invite')}
          </Button>
        </div>
        {isShareAvailable ? (
          <div className={styles.shareBtnContainer}>
            <Button className={styles.shareBtn} onClick={shareOnApps}>
              {t('user:usermenu.share.lbl-share')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ShareMenu
