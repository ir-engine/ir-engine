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

import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: IArguments[]
    gtag: (...args: any[]) => void
  }
}

const useGoogleAnalytics = () => {
  const userSetting = useHookstate(getMutableState(AuthState).user.userSetting)
  const gaMeasurementId = userSetting.value.gaMeasurementId

  useEffect(() => {
    // Only run if the user has a GA measurement ID and the gtag function is not already defined
    if (gaMeasurementId && !window.gtag) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        window.gtag = function () {
          window.dataLayer.push(arguments)
        }
        window.gtag('js', new Date())
        window.gtag('config', gaMeasurementId)
      }
    }
    // Cleanup function to remove the script if the component unmounts or GA ID changes
    return () => {
      const script = document.querySelector(
        `script[src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}"]`
      )
      if (script) {
        document.head.removeChild(script)
      }
    }
  })
}

export default useGoogleAnalytics
