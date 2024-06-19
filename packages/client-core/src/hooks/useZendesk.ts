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
