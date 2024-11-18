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
import { ChevronDownLg } from '@ir-engine/ui/src/icons'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface CountryDetails {
  flag: string
  name: string
  dialCode: string
  countryCode: string
}

interface PhoneInputProps {
  value: {
    countryIndex: number
    phoneNumber: string
  }
  onChange: ({ countryIndex, phoneNumber }: { countryIndex: number; phoneNumber: string }) => void
  countries: CountryDetails[]
}

const PhoneInput = ({ value, onChange, countries }: PhoneInputProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)

  const [menuDimensions, setMenuDimensions] = useState({
    width: '',
    maxHeight: '',
    direction: 'down'
  } as { width: string; maxHeight: string; direction: 'down' | 'up' })

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { top, bottom } = containerRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight

        const spaceAbove = top
        const spaceBelow = windowHeight - bottom

        const newDirection = spaceBelow >= spaceAbove ? 'down' : 'up'
        const maxHeight = newDirection === 'down' ? 0.8 * spaceBelow : 0.8 * spaceAbove
        setMenuDimensions({
          width: `${containerRef.current.offsetWidth}px`,
          maxHeight: `${maxHeight}px`,
          direction: newDirection
        })
      }
    }

    updateDimensions()

    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  useClickOutside(containerRef, () => {
    setOpen(false)
  })

  const scrollCountryIntoView = (index: number) => {
    if (itemRefs.current && itemRefs.current[index]) {
      itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  return (
    <div ref={containerRef} className="flex w-full flex-col gap-y-2">
      <label className="block text-xs font-medium">
        <div className="flex flex-row items-center gap-x-1.5">
          <div className="flex flex-row items-center gap-x-0.5">
            <span className="text-xs text-[#D3D5D9]">Phone Number</span>
          </div>
        </div>
      </label>

      <div className="relative flex w-full items-center gap-x-2 divide-x divide-[#42454D] rounded-md border border-[#42454D] bg-[#141619] text-[#9CA0AA]">
        <div
          className="flex h-full w-[15%] cursor-pointer items-center rounded-l-md bg-[#141619] px-1 py-2.5 focus:outline-none"
          onClick={() => {
            setOpen((v) => !v)
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange({ ...value, countryIndex: activeIndex })
              setOpen((v) => !v)
            } else if (e.key === 'ArrowUp') {
              let newIndex = -1
              if (activeIndex === -1) {
                newIndex = countries.length - 1
              } else {
                newIndex = (activeIndex - 1 + countries.length) % countries.length
              }
              setActiveIndex(newIndex)
              scrollCountryIntoView(newIndex)
            } else if (e.key === 'ArrowDown') {
              let newIndex = -1
              if (activeIndex === -1) {
                newIndex = 0
              } else {
                newIndex = (activeIndex + 1) % countries.length
              }
              setActiveIndex(newIndex)
              scrollCountryIntoView(newIndex)
            } else if (e.code.startsWith('Key')) {
              const key = e.code.slice(-1)
              const index = countries.findIndex((country) => country.name.toLowerCase().startsWith(key.toLowerCase()))
              if (index !== -1) {
                setActiveIndex(index)
                scrollCountryIntoView(index)
              }
            }
          }}
        >
          <span className="inline-block w-full text-center">{countries[value.countryIndex]?.dialCode}</span>
          <ChevronDownLg className={`h-4 w-4 ${open && 'rotate-180'} duration-300`} />
        </div>

        {open && (
          <div
            className={`absolute flex flex-col overflow-y-auto rounded-lg bg-[#212121] ${
              menuDimensions.direction === 'down' && 'top-[calc(100%+0.5rem)]'
            } ${menuDimensions.direction === 'up' && 'bottom-[calc(100%+0.5rem)]'}`}
            style={{
              width: menuDimensions.width,
              maxHeight: menuDimensions.maxHeight
            }}
          >
            {countries.map((country, index) => (
              <div
                key={country.name}
                ref={(el) => (itemRefs.current[index] = el)}
                className={twMerge(
                  'flex cursor-pointer items-center gap-x-2 px-4 py-2.5',
                  activeIndex === index && 'bg-[#191B1F] text-[#F5F5F5]'
                )}
                onClick={() => {
                  onChange({ ...value, countryIndex: index })
                  setOpen(false)
                }}
                onMouseEnter={() => {
                  setActiveIndex(index)
                }}
                onMouseLeave={() => {
                  setActiveIndex(-1)
                }}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="ml-auto">{country.dialCode}</span>
              </div>
            ))}
          </div>
        )}

        <input
          className="h-10 w-full rounded-r-md bg-[#141619] px-2 py-2.5 focus:outline-none"
          value={value.phoneNumber}
          onChange={(e) => {
            onChange({ ...value, phoneNumber: e.target.value })
          }}
        />
      </div>
    </div>
  )
}

export default PhoneInput
