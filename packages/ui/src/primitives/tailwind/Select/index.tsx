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

import { useClickOutside } from '@ir-engine/common/src/utils/useClickOutside'
import { CheckLg, ChevronDownSm } from '@ir-engine/ui/src/icons'
import React, { useEffect, useLayoutEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { InputProps, variantSizes } from '../Input'

export interface MenuItemProps {
  children: React.ReactNode
  value: string | number
  disabled?: boolean
  selected?: boolean
  onClick?: () => void
}

export const MenuItem = ({ children, selected, disabled, onClick }: MenuItemProps) => {
  return (
    <div
      tabIndex={0}
      className={twMerge(
        `flex cursor-pointer items-center gap-x-2 bg-[#141619] px-4 py-2.5 text-xs text-[#9CA0AA] hover:bg-[#191B1F] hover:text-[#F5F5F5] ${
          selected && 'text-[#375DAF]'
        } ${disabled && 'text-[#42454D]'} w-full`
      )}
      onClick={onClick}
    >
      <div className="w-full">{children}</div>

      {selected && <CheckLg color="#375DAF" />}
    </div>
  )
}

export interface SelectProps<T = string | number> {
  children: React.ReactElement<typeof MenuItem> | React.ReactElement<typeof MenuItem>[]
  width?: 'sm' | 'md' | 'lg' | 'full'
  inputSizeVariant?: InputProps['variantSize']
  onChange: (value: T) => void
  value: T
  renderValue?: (value: T) => React.ReactNode
  labelProps?: {
    text: string
    position: 'top' | 'left'
  }
}

const Select = ({
  children,
  width = 'md',
  inputSizeVariant = 'l',
  onChange,
  value,
  renderValue,
  labelProps
}: SelectProps) => {
  const variantToWidth: Record<NonNullable<SelectProps['width']>, string> = {
    sm: '240px',
    md: '320px',
    lg: '520px',
    full: '100%'
  }
  const [open, setOpen] = React.useState(true)
  const [positioning, setPositioning] = React.useState({
    direction: 'down' as 'down' | 'up',
    maxHeight: '0px'
  })
  const ref = React.useRef<HTMLDivElement>(null)
  const [selectedLabelContent, setSelectedLabelContent] = React.useState<React.ReactNode>(null)
  const [selectedMenuIndex, setSelectedMenuIndex] = React.useState(-1)

  useLayoutEffect(() => {
    const updateDirection = () => {
      if (ref.current) {
        const { top, bottom } = ref.current.getBoundingClientRect()
        const windowHeight = window.innerHeight

        const spaceAbove = top
        const spaceBelow = windowHeight - bottom

        const newDirection = spaceBelow >= spaceAbove ? 'down' : 'up'
        const maxHeight = newDirection === 'down' ? 0.8 * spaceBelow : 0.8 * spaceAbove
        setPositioning({
          direction: newDirection,
          maxHeight: `${maxHeight}px`
        })
        console.log({
          spaceAbove,
          spaceBelow,
          windowHeight,
          newDirection,
          maxHeight
        })
      }
    }
    updateDirection()
    window.addEventListener('resize', updateDirection)

    return () => {
      window.removeEventListener('resize', updateDirection)
    }
  }, [])

  useClickOutside(ref, () => {
    setOpen(false)
  })

  useEffect(() => {
    if (value === '') {
      setSelectedLabelContent(null)
      return
    }

    /**
     * If `value` is changed, identify the corresponding label content.
     * Update the selectedOption state accordingly.
     */
    const childrenArray = React.Children.toArray(children) as React.ReactElement<MenuItemProps>[]

    const menuItemIndex = childrenArray.findIndex(
      (child) => React.isValidElement<MenuItemProps>(child) && child.props.value === value
    )

    if (menuItemIndex === -1) {
      console.warn('No corresponding MenuItem found. Defaulting to null.')
      setSelectedLabelContent(null)
    } else {
      let labelContent: React.ReactNode = null
      if (renderValue !== undefined) {
        labelContent = renderValue(value)
      } else {
        labelContent = childrenArray[menuItemIndex].props.children
      }
      setSelectedLabelContent(labelContent)
      setSelectedMenuIndex(menuItemIndex)
    }
  }, [value])

  const _children = Array.isArray(children) ? children : [children]
  const modifiedChildren = React.Children.map(_children, (child, index) => {
    if (React.isValidElement<MenuItemProps>(child) && child.type === MenuItem) {
      return React.cloneElement(child, {
        onClick: () => {
          if (child.props.onClick) {
            child.props.onClick()
          }
          onChange(child.props.value)
          setOpen(false)
        },
        selected: selectedMenuIndex === index
      })
    }
    return child
  })

  return (
    <div
      className={twMerge(
        'flex',
        width === 'full' ? 'w-full' : 'w-fit',
        labelProps?.position === 'top' && 'flex-col gap-y-2',
        labelProps?.position === 'left' && 'flex-row items-center gap-x-2'
      )}
    >
      {labelProps?.text && (
        <label className="block text-xs font-medium">
          <div className="flex flex-row items-center gap-x-1.5">
            <div className="flex flex-row items-center gap-x-0.5">
              <span className="whitespace-nowrap text-xs text-[#D3D5D9]">{labelProps.text}</span>
            </div>
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
          onClick={() => {
            setOpen((v) => !v)
          }}
          className={`relative flex w-full items-center gap-x-2 rounded-md border-[0.5px] border-[#42454D] bg-[#141619] text-[#9CA0AA] ${variantSizes[inputSizeVariant]}`}
        >
          <div className="w-full">{selectedLabelContent || '-'}</div>

          <ChevronDownSm className={`absolute right-1 ${open && 'rotate-180'} duration-300`} />
        </div>

        {open && (
          <div
            className={`absolute flex w-full flex-col overflow-y-auto rounded-lg ${
              positioning.direction === 'down' && 'top-[calc(100%+0.5rem)]'
            } ${positioning.direction === 'up' && 'bottom-[calc(100%+0.5rem)]'}`}
            style={{
              maxHeight: positioning.maxHeight
            }}
          >
            {modifiedChildren}
          </div>
        )}
      </div>
    </div>
  )
}

export default Select
