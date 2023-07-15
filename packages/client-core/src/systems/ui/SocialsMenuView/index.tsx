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

import { createState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

/** @deprecated */
export function createSocialsMenuView() {
  return createXRUI(SocialsMenuView, createSocialsMenuState())
}

function createSocialsMenuState() {
  return createState({})
}
/** @deprecated */
const SocialsMenuView = () => {
  const { t } = useTranslation()

  const handleOpenFriendMenuWidget = () => {
    // TODO open friend menu widget here...
  }

  const handleOpenPartyGroupMenuWidget = () => {
    // TODO open party group menu widget here...
  }

  const handleOpenMediaSessionsMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.MEDIA_SESSION, true)
  }

  const handleOpenShareLocationMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.SHARE_LOCATION, true)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.socials.containerHeading')}</h3>
        <XRTextButton onClick={handleOpenFriendMenuWidget}>
          <Icon type="Group" />
          {t('user:usermenu.socials.btn-friend')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenPartyGroupMenuWidget}>
          <Icon type="Groups" />
          {t('user:usermenu.socials.btn-party-group')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenMediaSessionsMenuWidget}>
          <Icon type="Newspaper" />
          {t('user:usermenu.socials.btn-mediaSession')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenShareLocationMenuWidget}>
          <Icon type="QrCode2" />
          {t('user:usermenu.socials.btn-share-invite')}
        </XRTextButton>
      </div>
    </>
  )
}

export default SocialsMenuView
