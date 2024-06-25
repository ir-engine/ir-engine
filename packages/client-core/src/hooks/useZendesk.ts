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

import config from '@etherealengine/common/src/config'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { AuthState } from '../user/services/AuthService'

declare global {
  interface Window {
    zE: (...args: any) => void
  }
}

export const useZendesk = () => {
  const user = getMutableState(AuthState).user
  const initalized = useHookstate(() => {
    const zendeskScript = document.getElementById(`ze-snippet`) as HTMLScriptElement
    return !!zendeskScript
  })

  const initalize = () => {
    if (initalized.value || !config.client.zendeskKey) return
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.async = true
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.client.zendeskKey}`
    document.body.appendChild(script)
    initalized.set(true)
  }

  useEffect(() => {
    if (config.client.zendeskEnabled !== 'true') return

    if (!user.isGuest.value && !initalized.value) {
      initalize()
    } else if (!user.isGuest.value && initalized.value) {
      showWidget()
    } else if (user.isGuest.value && initalized.value) {
      hideWidget()
    }
  }, [user.value])

  const hideWidget = () => {
    if (initalized.value) return
    window.zE('messenger', 'hide')
  }
  const showWidget = () => {
    if (initalized.value) return
    window.zE('messenger', 'show')
  }
  const openChat = () => {
    if (initalized.value) return
    window.zE('messenger', 'open')
  }

  return {
    initialized: initalized.value,
    hideWidget,
    showWidget,
    openChat
  }
}
