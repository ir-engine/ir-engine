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
import { SupportedFileTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import React, { useCallback, useState } from 'react'
import { useDrop } from 'react-dnd'
import { HiPlus } from 'react-icons/hi'
import { PiTrashSimple } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'
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

const DiscardableInput = ({
  value,
  index,
  inputLabel,
  onChange,
  onRemove,
  dropTypes
}: {
  value: string
  index: number
  onChange: (val: string, idx: number) => void
  onRemove: (idx: number) => void
} & Pick<ArrayInputProps, 'inputLabel' | 'dropTypes'>) => {
  const [{ isDroppable }, dropRef] = useDrop(() => ({
    accept: dropTypes ?? [...SupportedFileTypes],
    drop: (item: { url: string }) => {
      onChange(item.url, index)
    },
    collect: (monitor) => ({
      isDroppable: monitor.canDrop() && monitor.isOver()
    })
  }))

  return (
    <div className="flex flex-col px-3">
      {inputLabel && <Label className="mb-1 text-[#A0A1A2]">{inputLabel + ' ' + (index + 1)}</Label>}
      <div
        ref={dropRef}
        className={twMerge('mb-2 flex items-center', isDroppable && 'outline outline-2 outline-white')}
      >
        <Input value={value} onChange={(event) => onChange(event.target.value, index)} />
        <PiTrashSimple className="ml-2.5 cursor-pointer text-[#444]" onClick={() => onRemove(index)} />
      </div>
    </div>
  )
}

export default function ArrayInputGroup({
  name,
  label,
  containerClassName,
  values: initialValues,
  onChange,
  inputLabel,
  dropTypes
}: ArrayInputProps) {
  const [values, setValues] = useState(initialValues)

  const handleChange = useCallback(
    (value: string, index: number, addRemove?: 'add' | 'remove') => {
      setValues((prevValues) => {
        let newValues

        if (addRemove === 'add') {
          newValues = [...prevValues, value]
        } else if (addRemove === 'remove') {
          newValues = prevValues.filter((_, idx) => idx !== index)
        } else {
          newValues = prevValues.map((v, idx) => (idx === index ? value : v))
        }

        onChange(newValues)
        return newValues
      })
    },
    [onChange]
  )

  const [{ isGroupDroppable }, groupDropRef] = useDrop(
    () => ({
      accept: dropTypes ?? [...SupportedFileTypes],
      drop: (item: { url: string }, monitor) => {
        if (monitor.didDrop()) {
          return // don't handle the drop if a child component already did
        }
        handleChange(item.url, 0, 'add')
      },
      collect: (monitor) => ({
        isGroupDroppable: monitor.canDrop() && monitor.isOver({ shallow: true })
      })
    }),
    [handleChange]
  )

  return (
    <div ref={groupDropRef} aria-label={name} className={containerClassName}>
      <div
        className={`outline outline-2 transition-colors duration-200 ${
          isGroupDroppable ? 'outline-white' : 'outline-transparent'
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
            <DiscardableInput
              key={value + idx}
              value={value}
              index={idx}
              inputLabel={inputLabel}
              onChange={handleChange}
              onRemove={(index) => handleChange('', index, 'remove')}
              dropTypes={dropTypes}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
