import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { isSupportedBrowser } from '@ir-engine/editor/src/functions/browserCheck'
import { useHookstate } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { UnsupportedBrowser } from '@theinfinitereality/irpro-multitenancy/components/common/modals/UnsupportedBrowser'
import { UnsupportedDevice } from '@theinfinitereality/irpro-multitenancy/components/common/modals/UnsupportedDevice'
import React, { useEffect } from 'react'

type UnsupportedType = {
  supportedDevice
  supportedBrowser
}

type Props = {
  device?: boolean
  browser?: boolean
}
export const useUnsupported = ({ device = false, browser = false }: Props): UnsupportedType => {
  const supportedBrowser = useHookstate(isSupportedBrowser)

  useEffect(() => {
    if (isMobile && device) {
      PopoverState.showPopupover(<UnsupportedDevice />)
      return
    }
    if (supportedBrowser.value && browser) {
      PopoverState.showPopupover(<UnsupportedBrowser />)
      return
    }
  }, [isMobile, device, supportedBrowser.value, browser])

  return {
    supportedDevice: !isMobile,
    supportedBrowser
  }
}
