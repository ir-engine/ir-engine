/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/
import { useHookstate } from '@hookstate/core'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { getMutableState } from '@ir-engine/hyperflux'
import React from 'react'
import { EditorState } from '../services/EditorServices'

export const isSupportedBrowser = () => {
  const userAgent = window.navigator.userAgent
  const isGoogleChrome = /Chrome/.test(userAgent) && !/Chromium|Edg|OPR|Brave|CriOS/.test(userAgent)
  const isSafari = /^((?!chrome|androidg).)*safari/i.test(userAgent)

  return isGoogleChrome || isSafari
}

export const useBrowserCheck = () => {
  const supportedBrowser = useHookstate(isSupportedBrowser)
  const { acknowledgedUnsupportedBrowser } = useHookstate(getMutableState(EditorState))

  React.useEffect(() => {
    if (!supportedBrowser.value) {
      NotificationService.dispatchNotify(
        'The browser you are on is not supported. For the best experience please use Google Chrome.',
        { variant: 'warning' }
      )
    }
  }, [])

  return {
    supportedBrowser,
    acknowledgedUnsupportedBrowser
  }
}
