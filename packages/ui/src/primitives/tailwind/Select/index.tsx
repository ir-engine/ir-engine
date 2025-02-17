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

import { ChevronDownSm, HelpIconSm, XCloseSm } from '@ir-engine/ui/src/icons'
import Fuse from 'fuse.js'
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import Popup from 'reactjs-popup'
import { PopupActions } from 'reactjs-popup/dist/types'
import { twMerge } from 'tailwind-merge'
import { DropdownItem } from '../Dropdown'
import { InputProps, heights } from '../Input'
import Tooltip from '../Tooltip'

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

export interface SelectProps<T = string | number> {
  options: OptionType[]
  width?: 'sm' | 'md' | 'lg' | 'full'
  inputHeight?: InputProps['height']
  onChange: (value: T) => void
  onOpen?: (isOpen: boolean) => void
  value: T
  labelProps?: InputProps['labelProps']
  state?: InputProps['state']
  helperText?: InputProps['helperText']
  required?: boolean
  disabled?: boolean
  searchMode?: 'prefix' | 'substring' | 'fuzzy'
  positioning?: {
    maxHeight: string
  }
  showClearButton?: boolean
}

const variantToWidth: Record<NonNullable<SelectProps['width']>, string> = {
  sm: '240px',
  md: '320px',
  lg: '520px',
  full: '100%'
}

const Select = ({
  options,
  width = 'md',
  inputHeight = 'l',
  onChange,
  onOpen,
  value,
  labelProps,
  state,
  helperText,
  required,
  disabled,
  searchMode,
  positioning: userPositioning,
  showClearButton = false
}: SelectProps) => {
  const [positioning, setPositioning] = useState({
    maxHeight: '0px',
    ...userPositioning
  })
  const ref = useRef<HTMLDivElement>(null)
  const [displayText, setDisplayText] = useState('')
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const labelRef = useRef<HTMLLabelElement>(null)
  const [helperOffset, setHelperOffset] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [searchString, setSearchString] = useState('')
  const fuseRef = useRef<Fuse<OptionType> | null>(null)
  const [localValue, setLocalValue] = useState(value)
  const id = useId()
  const [triggerWidth, setTriggerWidth] = useState(0)
  const popupRef = useRef<PopupActions>(null)

  useEffect(() => {
    if (searchMode === 'fuzzy' && fuseRef.current !== null) {
      fuseRef.current = new Fuse(options, {
        keys: ['label', 'secondaryText']
      })
    }
  }, [searchMode])

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
          // direction: newDirection,
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

  useLayoutEffect(() => {
    const updateHelperTextPosition = () => {
      if (labelProps?.position === 'left' && labelRef.current) {
        setHelperOffset(`${labelRef.current.offsetWidth + 8}px`)
      } else {
        setHelperOffset('')
      }
    }

    updateHelperTextPosition()

    window.addEventListener('resize', updateHelperTextPosition)
    return () => {
      window.removeEventListener('resize', updateHelperTextPosition)
    }
  }, [labelProps])

  useEffect(() => {
    setSearchString('')
  }, [selectedOptionIndex])

  useEffect(() => {
    if (localValue === '') {
      setDisplayText('')
      return
    }

    if (
      0 <= selectedOptionIndex &&
      selectedOptionIndex < filteredOptions.length &&
      filteredOptions[selectedOptionIndex].value === localValue
    ) {
      setDisplayText(filteredOptions[selectedOptionIndex].label)
      return
    }

    const index = filteredOptions.findIndex((option) => option.value === localValue)

    if (index === -1) {
      if (searchMode === undefined) {
        console.warn('No corresponding option found. Defaulting to null.')
        setDisplayText('')
        return
      }
    } else {
      setDisplayText(filteredOptions[index].label)
    }
  }, [localValue, selectedOptionIndex])

  useEffect(() => {
    if (searchString === '') {
      setFilteredOptions(options)
      return
    }
    const searchStringLowerCase = searchString.toLowerCase()
    if (searchMode === 'prefix') {
      setFilteredOptions(
        options.filter(
          (option) =>
            option.label.toLowerCase().startsWith(searchStringLowerCase) ||
            option.secondaryText?.toLowerCase().startsWith(searchStringLowerCase)
        )
      )
    } else if (searchMode === 'substring') {
      setFilteredOptions(
        options.filter(
          (option) =>
            option.label.toLowerCase().includes(searchStringLowerCase) ||
            option.secondaryText?.toLowerCase().includes(searchStringLowerCase)
        )
      )
    } else if (searchMode === 'fuzzy') {
      if (!fuseRef.current) {
        fuseRef.current = new Fuse(options, {
          keys: ['label', 'secondaryText']
        })
      }
      const searchResult = fuseRef.current.search(searchString)
      setFilteredOptions(searchResult.map(({ item }) => item))
    } else {
      setFilteredOptions(options)
    }
  }, [options, searchString])

  useEffect(() => {
    const element = document.getElementById(id)
    const updateTriggerWidth = () => {
      if (element) {
        setTriggerWidth(element.offsetWidth)
      }
    }

    const resizeObserver = new ResizeObserver(updateTriggerWidth)
    if (element) {
      resizeObserver.observe(element)
    }
    updateTriggerWidth()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const togglePopup = () => {
    if (popupRef.current) {
      popupRef.current.toggle()
    }
  }

  const closePopup = () => {
    if (popupRef.current) {
      popupRef.current.close()
    }
  }

  return (
    <Popup
      trigger={(isOpen) => (
        <div id={id} className={twMerge('flex flex-col gap-y-2', width === 'full' ? 'w-full' : 'w-fit')}>
          <div
            className={twMerge(
              'flex',
              width === 'full' ? 'w-full' : 'w-fit',
              labelProps?.position === 'top' && 'flex-col gap-y-2',
              labelProps?.position === 'left' && 'flex-row items-center gap-x-2'
            )}
          >
            {labelProps?.text && (
              <label className="block text-xs font-medium" ref={labelRef}>
                <div className="flex flex-row items-center gap-x-1.5">
                  <div className="flex flex-row items-center gap-x-0.5">
                    {required && <span className="text-sm text-ui-error">*</span>}
                    <span className="text-xs text-text-secondary">{labelProps.text}</span>
                  </div>

                  {labelProps?.infoText && (
                    <Tooltip content={labelProps.infoText}>
                      <HelpIconSm className="text-text-tertiary" />
                    </Tooltip>
                  )}
                </div>
              </label>
            )}

            <div
              ref={ref}
              className="relative"
              style={{
                width: variantToWidth[width]
              }}
            >
              <div
                tabIndex={0}
                className={twMerge(
                  `relative flex w-full items-center gap-x-2 rounded-md bg-ui-background text-text-tertiary ${heights[inputHeight]} border-[0.5px] border-ui-outline transition-colors duration-300`,
                  disabled
                    ? 'cursor-not-allowed bg-ui-inactive-background text-ui-inactive-outline'
                    : 'hover:text-text-primary',
                  // 'focus:outline-none',
                  state === 'success' ? 'border-ui-success' : '',
                  state === 'error' ? 'border-ui-error' : ''
                )}
              >
                <input
                  onClick={() => {
                    if (!disabled) {
                      togglePopup()
                    }
                  }}
                  type="text"
                  className={twMerge(
                    'w-full bg-inherit focus:outline-none',
                    searchMode === undefined ? 'cursor-pointer' : 'cursor-text',
                    disabled ? 'cursor-not-allowed' : ''
                  )}
                  value={displayText}
                  readOnly={searchMode === undefined}
                  onChange={(e) => {
                    setSearchString(e.target.value)
                    setDisplayText(e.target.value)
                  }}
                />

                {showClearButton && (
                  <XCloseSm
                    onClick={() => {
                      onChange('')
                    }}
                    className="cursor-pointer"
                  />
                )}

                <ChevronDownSm
                  onClick={() => {
                    if (!disabled) {
                      togglePopup()
                    }
                  }}
                  className={`cursor-pointer ${isOpen && 'rotate-180'} duration-300`}
                />
              </div>
            </div>
          </div>

          {helperText && !isOpen && (
            <span
              className={`text-xs ${state === 'success' && 'text-ui-success'} ${state === 'error' && 'text-ui-error'}`}
              style={{
                translate: helperOffset
              }}
            >
              {helperText}
            </span>
          )}
        </div>
      )}
      on="click"
      closeOnDocumentClick
      arrow={false}
      ref={popupRef}
      position={['bottom left', 'top left']}
      repositionOnResize={true}
      contentStyle={{ padding: '0px', border: 'none' }}
    >
      <div
        className={`z-50 flex flex-col overflow-y-auto overflow-x-hidden rounded-lg`}
        style={{
          width: triggerWidth,
          maxHeight: positioning.maxHeight
        }}
        onKeyUp={(e) => {
          if (disabled || !open) return

          let newIndex = activeIndex

          if (activeIndex === -1) {
            if (e.code === 'ArrowUp') {
              newIndex = filteredOptions.length - 1
            } else if (e.code === 'ArrowDown') {
              newIndex = 0
            }
          } else if (e.code === 'ArrowUp') {
            newIndex = (activeIndex - 1 + filteredOptions.length) % filteredOptions.length
          } else if (e.code === 'ArrowDown') {
            newIndex = (activeIndex + 1) % filteredOptions.length
          }

          setActiveIndex(newIndex)

          if (['Enter', ' '].includes(e.code)) {
            closePopup()
            setLocalValue(filteredOptions[newIndex].value)
            setSelectedOptionIndex(newIndex)
            setDisplayText(filteredOptions[newIndex].label)
            onChange(filteredOptions[newIndex].value)
          }
        }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map(({ value: currentValue, ...optionProps }, index) => (
            <DropdownItem
              key={index}
              {...optionProps}
              selected={localValue === currentValue}
              active={index === activeIndex}
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
                closePopup()
                setLocalValue(currentValue)
                setSelectedOptionIndex(index)
                setDisplayText(optionProps.label)
                onChange(currentValue)
              }}
              onMouseEnter={() => {
                setActiveIndex(index)
              }}
              onMouseLeave={() => {
                setActiveIndex(-1)
              }}
              onKeyUp={(e) => {
                if (e.code === 'Enter') {
                  closePopup()
                  setLocalValue(currentValue)
                  setSelectedOptionIndex(index)
                  setDisplayText(optionProps.label)
                  onChange(currentValue)
                }
              }}
            />
          ))
        ) : (
          <div className="flex h-12 items-center justify-center bg-ui-background text-text-secondary">
            No options available
          </div>
        )}
      </div>
    </Popup>
  )
}

export default Select
