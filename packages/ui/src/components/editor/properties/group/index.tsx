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
import { BsArrowDown, BsArrowRight } from 'react-icons/bs'
import { MdClear } from 'react-icons/md'
import { PiCursor } from 'react-icons/pi'

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

  const handleMinimize = (value) => {
    setMinimized(value)
  }

  return (
    <div className="flex w-full flex-col rounded-[5px] border-t border-solid bg-neutral-800 px-2 py-1" {...rest}>
      <div className="left-0 flex h-4 flex-row items-center gap-1 bg-neutral-800 px-2 py-1 font-['Figtree'] text-white">
        {minimized ? (
          <button
            className="ml-0 flex h-4 flex-row border-[none] text-base text-[#444444]"
            onPointerUp={() => handleMinimize(false)}
          >
            <BsArrowRight fontSize="inherit" />
          </button>
        ) : (
          <button
            className="ml-0 flex h-4 flex-row border-[none] text-base text-[#444444]"
            onPointerUp={() => handleMinimize(true)}
          >
            <BsArrowDown fontSize="inherit" />
          </button>
        )}
        {icon}
        <span className="text-left">{name}</span>
        {onClose && (
          <button
            className="m-auto mr-0 flex h-4 flex-row border-[none] text-base text-[#444444]"
            onPointerUp={onClose}
          >
            <MdClear fontSize="inherit" />
          </button>
        )}
      </div>

      {description && (
        <div className="ml-8 py-2 font-['Figtree'] text-[10px] font-normal text-neutral-50">
          {description.split('\\n').map((line, i) => (
            <Fragment key={i}>
              {line}
              <br />
            </Fragment>
          ))}
        </div>
      )}
      {!minimized && <div className="flex flex-col py-2">{children}</div>}
    </div>
  )
}

PropertyGroup.defaultProps = {
  name: 'Component name',
  icon: <PiCursor />
}

export default PropertyGroup
