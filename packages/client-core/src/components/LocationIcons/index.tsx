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

import React from 'react'

import { TouchGamepad } from '@etherealengine/client-core/src/common/components/TouchGamepad'
import { UserMenu } from '@etherealengine/client-core/src/user/components/UserMenu'
import { iOS } from '@etherealengine/engine/src/common/functions/isMobile'
import { getCameraMode, XRState } from '@etherealengine/engine/src/xr/XRState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { LoadingSystemState } from '../../systems/state/LoadingState'
import { ARPlacement } from '../ARPlacement'
import { Fullscreen } from '../Fullscreen'
import { InstanceChatWrapper } from '../InstanceChat'
import { MediaIconsBox } from '../MediaIconsBox'
import { Shelves } from '../Shelves'
import { UserMediaWindows } from '../UserMediaWindows'
import { XRLoading } from '../XRLoading'
import styles from './index.module.scss'

export const LocationIcons = () => {
  const loadingScreenOpacity = useHookstate(getMutableState(LoadingSystemState).loadingScreenOpacity)
  useHookstate(getMutableState(XRState))
  const cameraMode = getCameraMode()

  return (
    <>
      <UserMenu />
      {/** Container for fading most stuff in and out depending on if the location is loaded or not  */}
      <div style={{ opacity: 1 - loadingScreenOpacity.value }}>
        <div className={`${styles.rightSidebar}`}>
          <UserMediaWindows />
          <InstanceChatWrapper />
        </div>
        <Shelves />
        <ARPlacement />
        <XRLoading />
        <MediaIconsBox />
        {cameraMode === 'detached' && <TouchGamepad />}
        {!iOS && <Fullscreen />}
      </div>
    </>
  )
}
