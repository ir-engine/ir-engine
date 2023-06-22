/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { createState, useHookstate, useState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { VrIcon } from '@etherealengine/client-core/src/common/components/Icons/VrIcon'
import { respawnAvatar } from '@etherealengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { requestXRSession } from '@etherealengine/engine/src/xr/XRSessionFunctions'
import { XRAction, XRState } from '@etherealengine/engine/src/xr/XRState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AuthState } from '../../../user/services/AuthService'
import { EmoteIcon } from '../../../user/UserUISystem'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

export function createLocationMenuView() {
  return createXRUI(LocationMenuView, createLocationMenuState())
}

function createLocationMenuState() {
  return createState({})
}

const LocationMenuView = () => {
  const { t } = useTranslation()
  const xrState = useState(getMutableState(XRState))

  const isAdmin = useHookstate(getMutableState(AuthState)).user?.scopes?.value?.find(
    (scope) => scope.type === 'admin:admin'
  )

  const handleStartXRSession = () => {
    if (!xrState.sessionActive.value) {
      requestXRSession()
    }
  }

  const handleRespawnAvatar = () => {
    respawnAvatar(Engine.instance.localClientEntity)
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
          <Icon type="Refresh" />
          {t('user:usermenu.location.btn-respawn')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenEmoteMenuWidget}>
          <EmoteIcon />
          {t('user:usermenu.location.btn-emote')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenHelpMenuWidget}>
          <Icon type="Help" />
          {t('user:usermenu.location.btn-help')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenReportIssueMenuWidget}>
          <Icon type="Report" />
          {t('user:usermenu.location.btn-reportIssue')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleScreenRecord}>
          <Icon type="ScreenshotMonitor" />
          {t('user:usermenu.location.btn-screenRecord')}
        </XRTextButton>
        {isAdmin && (
          <XRTextButton onClick={handleOpenAdminControlsMenuWidget}>
            <Icon type="AdminPanelSettings" />
            {t('user:usermenu.location.btn-adminControls')}
          </XRTextButton>
        )}
      </div>
    </>
  )
}

export default LocationMenuView
