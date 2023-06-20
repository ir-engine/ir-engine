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

// your-addon-register-file.js

import { IconButton, Icons } from '@storybook/components'
import { FORCE_RE_RENDER } from '@storybook/core-events'
import { useGlobals } from '@storybook/manager-api'
import { addons } from '@storybook/preview-api'
import React, { useCallback } from 'react'

const SystemStatus = () => {
  const [globals, updateGlobals] = useGlobals()

  const isActive = globals['SystemStatus'] || false

  // Function that will update the global value and trigger a UI refresh.
  const refreshAndUpdateGlobal = () => {
    // Updates Storybook global value
    updateGlobals({
      ['SystemStatus']: !isActive
    }),
      // Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
      addons.getChannel().emit(FORCE_RE_RENDER)
  }

  const toggleOutline = useCallback(() => refreshAndUpdateGlobal(), [isActive])

  return <div key="hello">hello</div>
}

SystemStatus.defaultProps = {}
SystemStatus.displayName = 'SystemStatus'

export default SystemStatus
