import { createState } from '@speigg/hookstate'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { InviteService, useInviteState } from '@xrengine/client-core/src/social/services/InviteService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

const styles = {
  container: {
    width: '500px',
    minHeight: '208px',
    bottom: '75px',
    padding: '0 30px',
    borderRadius: '20px',
    backgroundColor: '#3c3c6f',
    color: '#000',
    maxHeight: 'calc(100vh - 100px)',
    overflow: 'auto',
    touchAction: 'auto'
  },
  header: { margin: '30px 0' },
  headerTitle: {
    fontSize: '18px',
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    lineHeight: '1.167',
    letterSpacing: '-0.01562em'
  },
  inviteBox: {
    marginTop: '10px',
    width: '100%',
    color: '#ffffff',
    display: 'inline-flex',
    flexDirection: 'column',
    position: 'relative',
    minWidth: '0px',
    padding: '0px',
    border: '0px',
    verticalAlign: 'top'
  },
  inviteContainer: {
    borderRadius: '4px',
    paddingRight: '14px',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '400',
    fontSize: '1rem',
    lineHeight: '1.4375em',
    letterSpacing: '0.00938em',
    color: '#ffffff',
    boxSizing: 'border-box',
    position: 'relative',
    cursor: 'text',
    display: 'inline-flex',
    alignItems: 'center'
  },
  inviteLinkInput: {
    color: '#ffffff',
    borderColor: '#ffffff',
    padding: '5px 0px 10px 14px',
    font: 'inherit',
    letterSpacing: 'inherit',
    border: '0px',
    boxSizing: 'content-box',
    background: 'none',
    height: '1.4375em',
    margin: '0px',
    display: 'block',
    minWidth: '0px',
    width: '100%'
  },
  copyInviteContainer: {
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    height: '0.01em',
    maxHeight: '2em',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    marginLeft: '8px',
    marginBottom: '5px',
    zIndex: '20'
  },
  copyIcon: {
    width: '1em',
    height: '1em',
    display: 'inline-block',
    flexShrink: '0',
    fontSize: '1.5rem',
    color: '#ffffff'
  },
  linkFieldset: {
    borderColor: '#ffffff',
    textAlign: 'left',
    position: 'absolute',
    inset: '-5px 0px 0px',
    margin: '0px',
    padding: '0px 8px',
    pointerEvents: 'none',
    borderRadius: 'inherit',
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    minWidth: '0%'
  },
  linkLegend: { margin: '0px', padding: '0px' },
  phoneEmailBox: {
    width: '100%',
    marginTop: '30px',
    touchAction: 'auto',
    position: 'relative',
    borderRadius: '4px',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '400',
    fontSize: '1rem',
    lineHeight: '1.4375em',
    letterSpacing: '0.00938em',
    boxSizing: 'border-box',
    cursor: 'text',
    display: 'inline-flex',
    alignItems: 'center'
  },
  phoneEmailFieldset: {
    borderColor: '#ffffff',
    touchAction: 'auto',
    textAlign: 'left',
    position: 'absolute',
    inset: '-5px 0px 0px',
    margin: '0px',
    padding: '0px 8px',
    pointerEvents: 'none',
    borderRadius: 'inherit',
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    minWidth: '0%'
  },
  phoneEmailLegend: {
    touchAction: 'auto',
    float: 'unset',
    overflow: 'hidden',
    padding: '0px',
    lineHeight: '11px'
  },
  phoneEmailInput: {
    color: '#ffffff',
    borderColor: '#ffffff',
    padding: '8.5px 14px',
    font: 'inherit',
    letterSpacing: 'inherit',
    border: '0px',
    boxSizing: 'content-box',
    background: 'none',
    height: '1.4375em',
    margin: '0px',
    display: 'block',
    minWidth: '0px',
    width: '100%',
    outline: '0px',
    borderStyle: 'solid',
    borderWidth: '1px'
  },
  sendInvitationContainer: {
    textAlign: 'center',
    margin: '20px auto 10px'
  },
  sendInvitationButton: {
    width: '125px',
    height: '35px',
    background: 'linear-gradient(92.22deg, #5236ff, #c20560)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    outline: '0px',
    border: '0px',
    margin: '0px',
    borderRadius: '4px',
    padding: '0px',
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
    appearance: 'none',
    textDecoration: 'none',
    color: '#ffffff',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    lineHeight: '1.75',
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    minWidth: '64px',
    fontSize: '16px'
  },
  shareAppContainer: {
    marginTop: '15px',
    textAlign: 'center'
  },
  shareAppButton: {
    width: '125px',
    height: '35px',
    background: '#5f5ff1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    outline: '0px',
    border: '0px',
    margin: '0px',
    borderRadius: '4px',
    padding: '0px',
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
    appearance: 'none',
    textDecoration: 'none',
    color: '#ffffff',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    lineHeight: '1.75',
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    minWidth: '64px',
    fontSize: '16px'
  }
}

export function createShareLocationDetailView() {
  return createXRUI(ShareLocationDetailView, createShareLocationDetailState())
}

function createShareLocationDetailState() {
  return createState({
    shareLocationWindowOpen: false
  })
}

type ShareLocationDetailState = ReturnType<typeof createShareLocationDetailState>

const ShareLocationDetailView = () => {
  const detailState = useXRUIState() as ShareLocationDetailState
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>
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
      return location.toString()
    } else {
      return location.toString()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>{t('user:usermenu.share.title')}</h1>
        <div style={styles.inviteBox as {}}>
          <div style={styles.inviteContainer as {}}>
            <input
              ref={refLink}
              aria-invalid="false"
              disabled={true}
              type="text"
              style={styles.inviteLinkInput as {}}
              value={getInviteLink()}
            />

            <div style={styles.copyInviteContainer as {}} onClick={() => copyLinkToClipboard()}>
              <svg style={styles.copyIcon} aria-hidden="true" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4 6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z"
                ></path>
              </svg>
            </div>

            <fieldset aria-hidden="true" style={styles.linkFieldset as {}}>
              <legend style={styles.linkLegend} />
            </fieldset>
          </div>
        </div>

        <div style={styles.phoneEmailBox as {}}>
          <fieldset aria-hidden="true" style={styles.phoneEmailFieldset as {}}>
            <legend style={styles.phoneEmailLegend as {}}>
              <span style={{ touchAction: 'auto' }}>​​</span>
            </legend>
          </fieldset>
          <input
            xr-layer=""
            aria-invalid="false"
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            type="text"
            style={styles.phoneEmailInput as {}}
            value={email}
            onChange={(e) => handleChang(e)}
          />
        </div>

        <div style={styles.sendInvitationContainer as {}}>
          <button xr-layer="" onClick={packageInvite} style={styles.sendInvitationButton as {}} type="button">
            {t('user:usermenu.share.lbl-send-invite')}
          </button>
        </div>

        {isShareAvailable ? (
          <div style={styles.shareAppContainer as {}}>
            <button xr-layer="" onClick={shareOnApps} style={styles.shareAppButton as {}} type="button">
              {t('user:usermenu.share.lbl-share')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
