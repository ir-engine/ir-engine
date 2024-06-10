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

import React, { Fragment, useState } from 'react'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'
import { HiMiniXMark } from 'react-icons/hi2'
import { PiCursor } from 'react-icons/pi'
import Button from '../../../../primitives/tailwind/Button'
import Text from '../../../../primitives/tailwind/Text'

interface Props {
  name?: string
  icon?: any
  description?: string
  onClose?: () => void
  children?: React.ReactNode
  rest?: Record<string, unknown>
}

const PropertyGroup = ({ name, icon, description, children, onClose, ...rest }: Props) => {
  const [minimized, setMinimized] = useState(false)

  return (
    <div className="justify-left flex w-full flex-col items-start rounded border-solid bg-[#242424] px-4 py-1.5">
      <div className="flex items-center gap-2 text-[#FAFAFA]">
        <Button
          onClick={() => setMinimized(!minimized)}
          variant="outline"
          startIcon={minimized ? <HiOutlineChevronRight /> : <HiOutlineChevronDown />}
          className="ml-0 h-4 border-0 p-0 text-[#444444]"
        />
        {icon}
        <Text>{name}</Text>
        <div className="ml-auto mr-0 flex items-center gap-3 text-white">
          {onClose && (
            <button onPointerUp={onClose}>
              <HiMiniXMark />
            </button>
          )}
          {/*<MdDragIndicator className="rotate-90" />*/}
        </div>
      </div>
      {!minimized && description && (
        <Text fontSize="xs" className="ml-8 py-2">
          {description.split('\\n').map((line, idx) => (
            <Fragment key={idx}>
              {line}
              <br />
            </Fragment>
          ))}
        </Text>
      )}
      {!minimized && <div className="flex w-full flex-col py-2">{children}</div>}
    </div>
  )
}

PropertyGroup.defaultProps = {
  name: 'Component name',
  icon: <PiCursor />
}

export default PropertyGroup
