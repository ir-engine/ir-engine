import { createState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createMediaSessionMenuView() {
  return createXRUI(MediaSessionMenuView, createMediaSessionMenuState())
}

function createMediaSessionMenuState() {
  return createState({})
}

const MediaSessionMenuView = () => {
  const { t } = useTranslation()

  const handleToggleAudio = () => {
    // TODO toggle audio here...
  }

  const handleToggleVideo = () => {
    // TODO toggle video here...
  }

  const handleToggleFaceTracking = () => {
    // TODO toggle face tracking here...
  }

  const handleToggleScreenShare = () => {
    // TODO toggle screen share here...
  }

  const handleOpenChatMenuWidget = () => {
    // TODO open admin controls menu here...
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.mediaSession.containerHeading')}</h3>
        <XRTextButton content={t('user:usermenu.mediaSession.btn-audio')} onClick={handleToggleAudio} />
        <XRTextButton content={t('user:usermenu.mediaSession.btn-video')} onClick={handleToggleVideo} />
        <XRTextButton content={t('user:usermenu.mediaSession.btn-faceTracking')} onClick={handleToggleFaceTracking} />
        <XRTextButton content={t('user:usermenu.mediaSession.btn-screenShare')} onClick={handleToggleScreenShare} />
        <XRTextButton content={t('user:usermenu.mediaSession.btn-chat')} onClick={handleOpenChatMenuWidget} />
      </div>
    </>
  )
}

export default MediaSessionMenuView
