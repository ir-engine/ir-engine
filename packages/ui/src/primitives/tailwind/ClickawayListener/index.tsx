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

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import React from 'react'

// todo move this to core engine
const ClickawayListener = (props: { children: JSX.Element }) => {
  const childOver = useHookstate(false)
  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50"
      onClick={() => {
        if (childOver.value) return
        getMutableState(PopoverState).element.set(null)
      }}
    >
      <div
        className="z-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        onMouseEnter={() => childOver.set(true)}
        onMouseLeave={() => childOver.set(false)}
      >
        {props.children}
      </div>
    </div>
  )
}

ClickawayListener.displayName = 'ClickawayListener'

ClickawayListener.defaultProps = {
  children: null
}

export default ClickawayListener
