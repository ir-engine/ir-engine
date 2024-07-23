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
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import React from 'react'
import { useDrop } from 'react-dnd'
import { HiPlus } from 'react-icons/hi'
import { PiTrashSimple } from 'react-icons/pi'
import Input from '../../../../primitives/tailwind/Input'
import Label from '../../../../primitives/tailwind/Label'
import Text from '../../../../primitives/tailwind/Text'

export interface ArrayInputProps {
  name?: string
  label: string
  containerClassName?: string
  values: string[]
  onChange: (values: string[]) => void
  inputLabel?: string
  dropTypes?: string[]
}

export default function ArrayInputGroup({
  name,
  label,
  containerClassName,
  values,
  onChange,
  inputLabel,
  dropTypes
}: ArrayInputProps) {
  const handleChange = (value: string, index: number, addRemove?: 'add' | 'remove') => {
    if (addRemove === 'add') {
      onChange([...values, value])
    } else if (addRemove === 'remove') {
      onChange(values.filter((_, idx) => idx !== index))
    } else {
      onChange(values.map((v, idx) => (idx === index ? value : v)))
    }
  }

  const [{ isDroppable }, dropRef] = useDrop(
    () => ({
      accept: dropTypes ?? [...SupportedFileTypes],
      drop: (item: { url: string }) => {
        const newResources = [...values, item.url]
        onChange(newResources)
      },
      collect: (monitor) => ({
        isDroppable: monitor.canDrop() && monitor.isOver()
      })
    }),
    [values, onChange]
  )

  return (
    <div ref={dropRef} aria-label={name} className={containerClassName}>
      <div
        className={`outline outline-2 transition-colors duration-200 ${
          isDroppable ? 'outline-white' : 'outline-transparent'
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <Text className="ml-5">{label}</Text>
          <HiPlus
            className="mr-5 cursor-pointer rounded-md bg-[#1A1A1A] text-white"
            size="20px"
            onClick={() => handleChange('', 0, 'add')}
          />
        </div>
        <div className="flex flex-col space-y-1 rounded-md bg-[#1A1A1A] py-1.5">
          {values.map((value, idx) => (
            <div key={value + idx} className="flex flex-col px-3">
              {inputLabel && <Label className="mb-1 text-[#A0A1A2]">{inputLabel + ' ' + (idx + 1)}</Label>}
              <div className="mb-2 flex items-center">
                <Input
                  containerClassname="flex-grow"
                  className="border-none bg-[#242424] text-[#8B8B8D]"
                  value={value}
                  onChange={(event) => handleChange(event.target.value, idx)}
                />
                <PiTrashSimple
                  className="ml-2.5 cursor-pointer text-[#444]"
                  onClick={() => handleChange('', idx, 'remove')}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
