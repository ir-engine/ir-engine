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

import Box from '@mui/material/Box'
import React from 'react'

import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
import RoomMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/RoomMenu'
import { clientSettingPath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'

export const RoomPage = () => {
  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]

  return (
    <div className="lander">
      <style>
        {`
            [class*=lander] {
                pointer-events: auto;
            }
          `}
      </style>
      <MetaTags>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap"
          rel="stylesheet"
        />
      </MetaTags>
      <div className="main-background">
        <div className="img-container">
          {clientSetting?.appBackground && <img src={clientSetting?.appBackground} alt="" crossOrigin="anonymous" />}
        </div>
      </div>
      <nav className="navbar">
        <div className="logo-section">
          {clientSetting?.appTitle && <object className="lander-logo" data={clientSetting?.appTitle} />}
          <div className="logo-bottom">
            {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting?.appSubtitle}</span>}
          </div>
        </div>
      </nav>
      <div className="main-section">
        <Box sx={{ flex: 1 }}>
          <style>
            {`
                [class*=menu] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    transform: none;
                    pointer-events: auto;
                }
              `}
          </style>
          <RoomMenu />
        </Box>
      </div>
    </div>
  )
}

export default RoomPage
