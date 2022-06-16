import { createState } from '@speigg/hookstate'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { useShareMenuHooks } from '../../user/components/UserMenu/menus/ShareMenu'

const styles = {
  container: {
    width: '500px',
    minHeight: '208px',
    bottom: '75px',
    padding: '0 30px',
    borderRadius: '20px',
    backgroundColor: 'var(--popupBackground)',
    color: 'var(--textColor)',
    maxHeight: 'calc(100vh - 100px)',
    overflow: 'auto',
    touchAction: 'auto'
  },
  header: { margin: '30px 0' },
  headerTitle: {
    fontSize: '18px',
    color: 'var(--textColor)',
    fontWeight: '700',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    lineHeight: '1.167',
    letterSpacing: '-0.01562em'
  },
  inviteBox: {
    marginTop: '10px',
    width: '100%',
    color: 'var(--textColor)',
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
    color: 'var(--textColor)',
    boxSizing: 'border-box',
    position: 'relative',
    cursor: 'text',
    display: 'inline-flex',
    alignItems: 'center'
  },
  inviteLinkInput: {
    color: 'var(--textColor)',
    borderColor: 'var(--inputOutline)',
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
    color: 'var(--textColor)',
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
    borderColor: 'var(--inputOutline)',
    textAlign: 'left',
    position: 'absolute',
    inset: '-5px 0px 0px',
    margin: '0px',
    padding: '0px 8px',
    pointerEvents: 'none',
    borderRadius: '4px',
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
    borderColor: 'var(--inputOutline)',
    textAlign: 'left',
    position: 'absolute',
    inset: '-5px 0px 0px',
    margin: '0px',
    padding: '0px 8px',
    pointerEvents: 'none',
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    minWidth: '0%'
  },
  phoneEmailLegend: {
    touchAction: 'auto',
    float: 'unset',
    overflow: 'hidden',
    margin: '0px',
    padding: '0px',
    lineHeight: '11px'
  },
  phoneEmailInput: {
    color: 'var(--textColor)',
    borderColor: 'var(--inputOutline)',
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
    borderWidth: '1px',
    borderRadius: '4px'
  },
  sendInvitationContainer: {
    textAlign: 'center',
    margin: '20px auto 10px'
  },
  sendInvitationButton: {
    width: '125px',
    height: '35px',
    background: 'linear-gradient(92.22deg, var(--buttonGradientStart), var(--buttonGradientEnd))',
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
    color: 'var(--textColor)',
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
    background: 'buttonFilled',
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
    color: 'var(--textColor)',
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
  return createState({})
}

const ShareLocationDetailView = () => {
  const { t } = useTranslation()
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>

  const { copyLinkToClipboard, shareOnApps, packageInvite, handleChang, getInviteLink, email } = useShareMenuHooks({
    refLink
  })

  return (
    <div style={styles.container} xr-layer="true">
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
              value={getInviteLink() as any}
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
          <input
            aria-invalid="false"
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            type="text"
            style={styles.phoneEmailInput as {}}
            value={email}
            onChange={(e) => handleChang(e)}
          />
        </div>

        <div style={styles.sendInvitationContainer as {}}>
          <button onClick={packageInvite} style={styles.sendInvitationButton as {}} type="button">
            {t('user:usermenu.share.lbl-send-invite')}
          </button>
        </div>

        {isShareAvailable ? (
          <div style={styles.shareAppContainer as {}}>
            <button onClick={shareOnApps} style={styles.shareAppButton as {}} type="button">
              {t('user:usermenu.share.lbl-share')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
