import React, { useRef } from 'react'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Send, FileCopy } from '@material-ui/icons'
import { isShareAvailable } from '../../../../../../engine/src/common/functions/DetectFeatures'
import styles from '../UserMenu.module.scss'
import { sendInvite } from '../../../../social/reducers/invite/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { selectInviteState } from '../../../../social/reducers/invite/selector'

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  sendInvite: bindActionCreators(sendInvite, dispatch)
})

const mapStateToProps = (state: any): any => {
  return {
    inviteState: selectInviteState(state)
  }
}

interface Props {
  sendInvite?: typeof sendInvite
  alertSuccess?: any
  inviteState?: any
}

const ShareMenu = (props: Props): any => {
  const { sendInvite, inviteState } = props
  const { t } = useTranslation()
  const [email, setEmail] = React.useState('')
  const refLink = useRef(null)
  const postTitle = 'AR/VR world'
  const siteTitle = 'XREngine'

  const copyLinkToClipboard = () => {
    refLink.current.select()
    document.execCommand('copy')
    refLink.current.setSelectionRange(0, 0) // deselect
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
      targetObjectId: inviteState.get('targetObjectId'),
      invitee: null
    }
    sendInvite(sendData)
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
        <textarea readOnly className={styles.shareLink} ref={refLink} value={window.location.href} />
        <Button onClick={copyLinkToClipboard} className={styles.copyBtn}>
          {t('user:usermenu.share.lbl-copy')}
          <span className={styles.materialIconBlock}>
            <FileCopy />
          </span>
        </Button>

        <Typography variant="h5">{t('user:usermenu.share.lbl-phoneEmail')}</Typography>
        <TextField
          className={styles.emailField}
          size="small"
          placeholder={t('user:usermenu.share.ph-phoneEmail')}
          variant="outlined"
          value={email}
          onChange={(e) => handleChang(e)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" onClick={() => packageInvite()}>
                <Send />
              </InputAdornment>
            )
          }}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(ShareMenu)
