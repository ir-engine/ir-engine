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
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

/** @deprecated */
export function createAdminControlsMenuView() {
  return createXRUI(AdminControlsMenuView, createAdminControlsMenuState())
}

function createAdminControlsMenuState() {
  return createState({})
}
/** @deprecated */
const AdminControlsMenuView = () => {
  const { t } = useTranslation()

  const handleOpenUserListMenuWidget = () => {
    // TODO open User List menu widget here...
  }

  const handleOpenBanListMenuWidget = () => {
    // TODO open Ban List menu widget here...
  }

  const handleOpenHelpMenuWidget = () => {
    // TODO open help menu widget here...
  }

  const handleOpenRequestSystemAdminMenuWidget = () => {
    // TODO open request system admin menu widget here...
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.adminControls.containerHeading')}</h3>
        <XRTextButton onClick={handleOpenUserListMenuWidget}>
          <Icon type="People" />
          {t('user:usermenu.adminControls.btn-userList')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenBanListMenuWidget}>
          <Icon type="Block" />
          {t('user:usermenu.adminControls.btn-banList')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenHelpMenuWidget}>
          <Icon type="Help" />
          {t('user:usermenu.adminControls.btn-help')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenRequestSystemAdminMenuWidget}>
          <Icon type="ContactMail" />
          {t('user:usermenu.adminControls.btn-requestSystemAdmin')}
        </XRTextButton>
      </div>
    </>
  )
}

export default AdminControlsMenuView
