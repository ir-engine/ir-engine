// import { addons } from '@storybook/preview-api';
// import { FORCE_RE_RENDER } from '@storybook/core-events';
// import { useGlobals } from '@storybook/manager-api';

import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { RenderOptions } from '@storybook/addons'
import { IconButton as SBIconButton } from '@storybook/components'
import React, { useCallback, useEffect, useState } from 'react'

import { useMediaInstance } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'

const SystemStatus = ({ active, status }) => {
  // const [globals, updateGlobals] = useGlobals()
  // const refreshAndUpdateGlobal = useCallback((key: string, val: any) => {
  //   // Updates Storybook global value
  //   updateGlobals({
  //     [key]: val,
  //   }),
  //     // Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
  //     addons?.getChannel().emit(FORCE_RE_RENDER);
  // }, [updateGlobals, addons])

  // const mediaInstance = useMediaInstance()
  // useEffect(() => {
  //   console.log(mediaInstance?.connected?.value)
  //   // updateGlobals({
  //   //   'EEStatus': {
  //   //     mediaInstance: mediaInstance?.connected?.value
  //   //   }
  //   // })
  //   // addons?.getChannel().emit(FORCE_RE_RENDER);
  // }, [mediaInstance])

  const [open, setOpen] = useState(false)

  return (
    <SBIconButton
      active={active}
      title="EE - Status"
      onClick={() => {
        setOpen(!open)
      }}
      content={undefined}
      autoFocus={undefined}
      rel={undefined}
      rev={undefined}
    >
      <InformationCircleIcon />

      <div className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {Object.keys(status).map((key) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'row' }}>
              {`${key}: ${status[key]}`}
            </div>
          ))}
        </div>
      </div>
    </SBIconButton>
  )
}

SystemStatus.displayName = 'SystemStatus'
SystemStatus.defaultProps = {
  active: false
}

export default SystemStatus
