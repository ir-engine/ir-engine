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

import Select, { SelectProps } from '@ir-engine/ui/src/primitives/tailwind/Select'
import Tooltip, { TooltipProps, TooltipRef } from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React, { ReactNode, useEffect, useRef, useState } from 'react'

interface TransformSpaceToolProps extends SelectProps {
  tooltipTitle?: string
  tooltipContent: ReactNode
  tooltipPosition?: TooltipProps['position']
  dropdownParentClassName?: string
}

function ToolbarDropdown({
  tooltipTitle,
  tooltipContent,
  tooltipPosition = 'bottom',
  dropdownParentClassName,
  ...props
}: TransformSpaceToolProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef<TooltipRef>(null)

  useEffect(() => {
    if (dropdownOpen) {
      ref.current?.hideTooltip()
    }
  }, [dropdownOpen])

  const onMouseEnter = () => {
    if (dropdownOpen) {
      return false
    }
    return true
  }

  const onMouseLeave = () => {
    return false
  }

  return (
    <Tooltip
      title={tooltipTitle}
      content={tooltipContent}
      isControlled={true}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      position={tooltipPosition}
      ref={ref}
    >
      <div className={dropdownParentClassName}>
        <Select {...props} onOpen={(isOpen) => setDropdownOpen(isOpen)} />
      </div>
    </Tooltip>
  )
}

export default ToolbarDropdown
