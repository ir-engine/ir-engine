// your-addon-register-file.js

import { IconButton, Icons } from '@storybook/components'
import { FORCE_RE_RENDER } from '@storybook/core-events'
import { useGlobals } from '@storybook/manager-api'
import { addons } from '@storybook/preview-api'
import React, { useCallback } from 'react'

const SystemStatus = () => {
  const [globals, updateGlobals] = useGlobals()

  const isActive = globals['my-param-key'] || false

  // Function that will update the global value and trigger a UI refresh.
  const refreshAndUpdateGlobal = () => {
    // Updates Storybook global value
    updateGlobals({
      ['my-param-key']: !isActive
    }),
      // Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
      addons.getChannel().emit(FORCE_RE_RENDER)
  }

  const toggleOutline = useCallback(() => refreshAndUpdateGlobal(), [isActive])

  return <div>hello</div>
}

SystemStatus.defaultProps = {}
SystemStatus.displayName = 'SystemStatus'

export default SystemStatus
