import { createState } from '@speigg/hookstate'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { useShareMenuHooks } from '../../../user/components/UserMenu/menus/ShareMenu'
import XRInput from '../../components/XRInput'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createShareLocationDetailView() {
  return createXRUI(ShareLocationDetailView, createShareLocationDetailState())
}

function createShareLocationDetailState() {
  return createState({})
}

const ShareLocationDetailView = () => {
  const { t } = useTranslation()
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>

  const { copyLinkToClipboard, shareOnApps, packageInvite, handleChange, getInviteLink, email } = useShareMenuHooks({
    refLink
  })

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <div className="header">
          <h1 className="headerTitle">{t('user:usermenu.share.title')}</h1>
          <XRInput
            ref={refLink}
            aria-invalid="false"
            disabled={true}
            type="text"
            value={getInviteLink() as any}
            endIcon={
              <svg className="copyIcon" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4 6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z"
                ></path>
              </svg>
            }
            endIconClick={copyLinkToClipboard}
          />
          <XRInput
            aria-invalid="false"
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            type="text"
            value={email}
            onChange={(e) => handleChange(e)}
          />
          <div className="sendInvitationContainer">
            <XRTextButton
              variant="gradient"
              onClick={packageInvite}
              content={t('user:usermenu.share.lbl-send-invite')}
            />
          </div>
          {isShareAvailable ? (
            <div className="shareAppContainer">
              <XRTextButton variant="filled" onClick={shareOnApps} content={t('user:usermenu.share.lbl-share')} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
