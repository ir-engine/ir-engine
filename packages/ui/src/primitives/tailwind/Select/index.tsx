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

import { useHookstate } from '@ir-engine/hyperflux'
import { ChevronDownSm, HelpIconSm, XCloseSm } from '@ir-engine/ui/src/icons'
import Fuse from 'fuse.js'
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  /** Callback fired when user is typing text */
  onInputChange?: (value: string) => void
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
  onInputChange,
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
  const [searchString, setSearchString] = useState('')
  const fuseRef = useRef<Fuse<OptionType> | null>(null)
  const [touchMoved, setTouchedMoved] = useState(false)
  const localValue = useHookstate(value)
  const id = useId()
  const [triggerWidth, setTriggerWidth] = useState(0)
  const popupRef = useRef<PopupActions>(null)

  const filteredOptions = useMemo(() => {
    if (searchString === '') {
      return options
    }

    const searchStringLowerCase = searchString.toLowerCase()

    switch (searchMode) {
      case 'prefix':
        return options.filter(
          (option) =>
            option?.label?.toLowerCase().startsWith(searchStringLowerCase) ||
            option?.secondaryText?.toLowerCase().startsWith(searchStringLowerCase)
        )

      case 'substring':
        return options.filter(
          (option) =>
            option?.label?.toLowerCase().includes(searchStringLowerCase) ||
            option?.secondaryText?.toLowerCase().includes(searchStringLowerCase)
        )

      case 'fuzzy': {
        if (!fuseRef.current) {
          fuseRef.current = new Fuse(options, {
            keys: ['label', 'secondaryText']
          })
        }
        const searchResult = fuseRef.current.search(searchString)
        return searchResult.map(({ item }) => item)
      }

      default:
        return options
    }
  }, [options, searchString, searchMode])

  useEffect(() => {
    if (searchMode === 'fuzzy' && fuseRef.current !== null) {
      fuseRef.current = new Fuse(options, {
        keys: ['label', 'secondaryText']
      })
    }
  }, [searchMode])

  useEffect(() => {
    localValue.set(value)
  }, [value])

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
    if (filteredOptions.length > 0) {
      const index = filteredOptions.findIndex((option) => option.value === localValue.value)

      if (index === -1) {
        if (searchMode === undefined) {
          console.warn('No corresponding option found. Defaulting to null.')
          setDisplayText('')
          return
        }
      }
    }
  }, [value, localValue, selectedOptionIndex, filteredOptions])

  useEffect(() => {
    if (filteredOptions.length) {
      const index = filteredOptions.findIndex((option) => option.value === localValue.value)
      if (index !== -1) {
        setDisplayText(filteredOptions[index].label)
      }
    }
  }, [localValue, filteredOptions])

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

  const inputRef = useRef<HTMLInputElement>(null)

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

  const contentRef = useRef<HTMLDivElement>(null)
  const [positionStyle, setPositionStyle] = useState({})

  useEffect(() => {
    if (ref.current && contentRef.current) {
      const refTop = ref.current.getBoundingClientRect().top
      const contentHeight = contentRef.current.getBoundingClientRect().height
      const gap = 10

      setPositionStyle({
        top: `${refTop - contentHeight - gap}px`
      })
    }
  }, [filteredOptions])

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
                  ref={inputRef}
                  onClick={() => {
                    if (!disabled) {
                      togglePopup()
                      setTimeout(() => inputRef.current?.focus(), 0)
                    }
                  }}
                  type="text"
                  className={twMerge(
                    'w-full bg-inherit text-text-secondary focus:border-transparent focus:outline-none focus:ring-0',
                    disabled ? 'cursor-not-allowed' : searchMode === undefined ? 'cursor-pointer' : 'cursor-text'
                  )}
                  data-testid="select-input"
                  value={displayText}
                  readOnly={searchMode === undefined}
                  onChange={(e) => {
                    popupRef.current && popupRef.current.open()
                    setDisplayText(e.target.value)
                    setSearchString(e.target.value)
                    onInputChange && onInputChange(e.target.value)
                  }}
                />

                {showClearButton && !disabled && (
                  <XCloseSm
                    onClick={() => {
                      onChange('')
                    }}
                    className={twMerge(disabled ? 'cursor-not-allowed' : 'cursor-pointer', 'text-text-secondary')}
                  />
                )}

                <ChevronDownSm
                  onClick={() => {
                    if (!disabled) {
                      togglePopup()
                    }
                  }}
                  className={twMerge(
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    `${isOpen && !disabled && 'rotate-180'} text-text-secondary duration-300`
                  )}
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
      position={['bottom center', 'top center']}
      repositionOnResize={true}
      contentStyle={{
        padding: '0px',
        border: 'none',
        ...positionStyle
      }}
      onOpen={() => onOpen?.(true)}
      onClose={() => onOpen?.(false)}
    >
      <div
        ref={contentRef}
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
            localValue.set(filteredOptions[newIndex].value)
            setSelectedOptionIndex(newIndex)
            setDisplayText(filteredOptions[newIndex].label)
            onChange(filteredOptions[newIndex].value)
          }
        }}
      >
        {filteredOptions.length > 0 &&
          !disabled &&
          filteredOptions
            .filter((option) => Boolean(option))
            .map(({ value: currentValue, ...optionProps }, index) => (
              <DropdownItem
                key={index}
                {...optionProps}
                selected={localValue.value === currentValue}
                active={index === activeIndex}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  closePopup()
                  localValue.set(currentValue)
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
                onTouchMove={() => setTouchedMoved(true)}
                onTouchEnd={() => {
                  if (!touchMoved) {
                    closePopup()
                    localValue.set(currentValue)
                    setSelectedOptionIndex(index)
                    setDisplayText(optionProps.label)
                    onChange(currentValue)
                  }
                  setTouchedMoved(false)
                }}
                onPointerUp={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onKeyUp={(e) => {
                  if (e.code === 'Enter') {
                    closePopup()
                    localValue.set(currentValue)
                    setSelectedOptionIndex(index)
                    setDisplayText(optionProps.label)
                    onChange(currentValue)
                  }
                }}
              />
            ))}

        {filteredOptions.length === 0 && !disabled && (
          <div className="flex h-12 items-center justify-center bg-ui-background text-text-secondary">
            No options available
          </div>
        )}
      </div>
    </Popup>
  )
}

export default Select
