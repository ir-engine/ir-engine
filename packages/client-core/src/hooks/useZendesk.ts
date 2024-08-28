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

import config from '@ir-engine/common/src/config'
import { zendeskPath } from '@ir-engine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { useMutation } from '@ir-engine/common'
import { useEffect } from 'react'
import { AuthState } from '../user/services/AuthService'

declare global {
  interface Window {
    zE?: (...args: any) => void
  }
}

export const useZendesk = () => {
  const zendeskMutation = useMutation(zendeskPath)
  const user = getMutableState(AuthState).user
  const authenticated = useHookstate(false)
  const initialized = useHookstate(() => {
    const zendeskScript = document.getElementById(`ze-snippet`) as HTMLScriptElement
    return !!zendeskScript
  })
  const isWidgetVisible = useHookstate(false)

  const authenticateUser = () => {
    if (authenticated.value || config.client.zendesk.authenticationEnabled !== 'true') return

    window.zE?.('messenger', 'loginUser', function (callback: any) {
      zendeskMutation.create().then(async (token) => {
        authenticated.set(true)
        await callback(token)
      })
    })
  }

  const initialize = () => {
    if (initialized.value || !config.client.zendesk.key) return
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.async = true
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.client.zendesk.key}`
    document.body.appendChild(script)

    script.addEventListener('load', () => {
      if ('zE' in window) {
        initialized.set(true)
        hideWidget()
        authenticateUser()
      }
      window.zE?.('messenger:on', 'close', () => {
        hideWidget()
      })
      window.zE?.('messenger:on', 'open', function () {
        showWidget()
      })
    })
  }

  useEffect(() => {
    if (config.client.zendesk.enabled !== 'true') return

    if (!user.isGuest.value && !initialized.value) {
      initialize()
    } else if (!user.isGuest.value && initialized.value) {
      authenticateUser()
    } else if (user.isGuest.value && initialized.value) {
      closeChat()
      window.zE?.('messenger', 'logoutUser')
    }
  }, [user.value])

  const hideWidget = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'hide')
    isWidgetVisible.set(false)
  }
  const showWidget = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'show')
    isWidgetVisible.set(true)
  }
  const openChat = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'open')
  }

  const closeChat = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'close')
  }

  return {
    initialized: initialized.value,
    isWidgetVisible: isWidgetVisible.value,
    hideWidget,
    showWidget,
    openChat,
    closeChat
  }
}
