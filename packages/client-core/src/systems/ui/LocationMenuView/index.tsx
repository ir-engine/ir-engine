import { createState, useState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { XRAction, XRState } from '@xrengine/engine/src/xr/XRState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@xrengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@xrengine/engine/src/xrui/Widgets'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { AdminPanelSettings, Help, Refresh, Report, ScreenshotMonitor } from '@mui/icons-material'

import { EmoteIcon } from '../../../user/components/UserMenu'
import { useAuthState } from '../../../user/services/AuthService'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createLocationMenuView() {
  return createXRUI(LocationMenuView, createLocationMenuState())
}

function createLocationMenuState() {
  return createState({})
}

const LocationMenuView = () => {
  const { t } = useTranslation()
  const xrState = useState(getState(XRState))

  const isAdmin = useAuthState().user?.scopes?.value?.find((scope) => scope.type === 'admin:admin')

  const handleStartXRSession = () => {
    if (!xrState.sessionActive.value) {
      dispatchAction(XRAction.requestSession({}))
    }
  }

  const handleRespawnAvatar = () => {
    respawnAvatar(Engine.instance.currentWorld.localClientEntity)
  }

  const handleOpenEmoteMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.EMOTE, true)
  }

  const handleOpenHelpMenuWidget = () => {
    // TODO open help menu widget here...
  }

  const handleOpenReportIssueMenuWidget = () => {
    // TODO open report issue menu widget here...
  }

  const handleToggleScreenRecord = () => {
    // TODO toggle screen record here...
  }

  const handleOpenAdminControlsMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.ADMIN_CONTROLS, true)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.location.containerHeading')}</h3>
        {!xrState.sessionActive.value && (
          <XRTextButton onClick={handleStartXRSession}>
            <VrIcon />
            {t('user:usermenu.location.btn-immersive')}
          </XRTextButton>
        )}
        <XRTextButton onClick={handleRespawnAvatar}>
          <Refresh />
          {t('user:usermenu.location.btn-respawn')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenEmoteMenuWidget}>
          <EmoteIcon />
          {t('user:usermenu.location.btn-emote')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenHelpMenuWidget}>
          <Help />
          {t('user:usermenu.location.btn-help')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenReportIssueMenuWidget}>
          <Report />
          {t('user:usermenu.location.btn-reportIssue')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleScreenRecord}>
          <ScreenshotMonitor />
          {t('user:usermenu.location.btn-screenRecord')}
        </XRTextButton>
        {isAdmin && (
          <XRTextButton onClick={handleOpenAdminControlsMenuWidget}>
            <AdminPanelSettings />
            {t('user:usermenu.location.btn-adminControls')}
          </XRTextButton>
        )}
      </div>
    </>
  )
}

export default LocationMenuView
