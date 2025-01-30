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

import React, { useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { InputProps } from '../Input'

export interface OptionType {
  value: string | number
  label: string
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**text shown on the right end */
  secondaryText?: string
  disabled?: boolean
  selected?: boolean
  className?: string
}

export interface SegmentedControlProps<T = string | number> {
  options: OptionType[]
  onChange: (value: T) => void
  value: T
  state?: InputProps['state']
  helperText?: InputProps['helperText']
  required?: boolean
  disabled?: boolean
  positioning?: {
    direction: 'down' | 'up'
    maxHeight: string
  }
  showClearButton?: boolean
}

const SegmentedControl = ({
  options,
  onChange,
  value,
  required,
  disabled,
  positioning: userPositioning
}: SegmentedControlProps) => {
  const [positioning, setPositioning] = useState({
    direction: 'down' as 'down' | 'up',
    maxHeight: '0px',
    ...userPositioning,
    userSet: false
  })
  const ref = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLLabelElement>(null)
  const [localValue, setLocalValue] = useState(value)

  useLayoutEffect(() => {
    const updateDirection = () => {
      if (ref.current && userPositioning === undefined) {
        const { top, bottom } = ref.current.getBoundingClientRect()
        const windowHeight = window.innerHeight

        const spaceAbove = top
        const spaceBelow = windowHeight - bottom

        const newDirection = spaceBelow >= spaceAbove ? 'down' : 'up'
        const _maxHeight = newDirection === 'down' ? 0.8 * spaceBelow : 0.8 * spaceAbove
        setPositioning({
          ...positioning,
          direction: newDirection,
          maxHeight: `${_maxHeight}px`
        })
      }
    }
    updateDirection()
    window.addEventListener('resize', updateDirection)

    return () => {
      window.removeEventListener('resize', updateDirection)
    }
  }, [])

  return (
    <div className={'flex w-full flex-col gap-y-2'}>
      <div className={'flex w-full'}>
        <div ref={ref} className="relative w-full">
          <div
            tabIndex={0}
            className={twMerge(
              ` relative my-[0px] flex w-full items-center rounded-md bg-[#141619] !px-[2px] !py-[4px] 
              ${disabled && 'cursor-not-allowed bg-[#191B1F] text-[#6B6F78]'} transition-colors duration-300`,
              'focus:outline-none'
            )}
          >
            {options.length > 0 ? (
              options.map(({ value: currentValue, ...optionProps }) => (
                <button
                  className={`!mx-[2px] !my-0 h-full flex-auto rounded-md text-[14px] ${
                    currentValue === localValue && 'bg-[#212226] text-[#F5F5F5]'
                  } ${currentValue !== localValue && 'bg-[#191B1F] text-[#6B6F78]'}`}
                  onClick={() => {
                    setLocalValue(currentValue)
                    onChange(currentValue)
                  }}
                >
                  {optionProps.label}
                </button>
              ))
            ) : (
              <div className="flex h-12 items-center justify-center bg-[#141619] text-[#9CA0AA]">
                No options available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SegmentedControl
