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

import { Entity, UUIDComponent, getComponent } from '@ir-engine/ecs'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { InfoCircleSm } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { HiCube, HiMiniXMark, HiOutlineChevronRight } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'
import { Tooltip } from '../../..'
import { ComponentDropdownState } from './ComponentDropdownState'

export interface ComponentDropdownProps {
  name?: string
  slug?: string
  description?: string
  /**icon for this component (by default: a cube icon will be shown) */
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**action when the component is removed */
  onClose?: () => void
  children?: React.ReactNode
  minimizedDefault?: boolean
  entity: Entity
}

export default function ComponentDropdown({
  minimizedDefault,
  Icon = HiCube,
  name,
  slug,
  description,
  children,
  onClose,
  entity
}: ComponentDropdownProps) {
  const entityUUID = getComponent(entity, UUIDComponent)
  const dropdownStateRecord = useMutableState(ComponentDropdownState).componentStates

  // State to track if minimized
  const isMinimized = useHookstate(() => {
    const mindefault = minimizedDefault ?? false
    return name ? dropdownStateRecord[entityUUID][name]?.value ?? minimizedDefault ?? mindefault : mindefault
  })

  // Update isMinimized whenever dependencies change
  useEffect(() => {
    const mindefault = minimizedDefault ?? false
    const currentMinimized = name
      ? dropdownStateRecord[entityUUID][name]?.value ?? minimizedDefault ?? mindefault
      : mindefault
    isMinimized.set(currentMinimized)
  }, [dropdownStateRecord, entityUUID, name, minimizedDefault])

  const toggleMinimized = () => {
    if (name) {
      const newMinimized = !isMinimized.value
      ComponentDropdownState.addOrUpdateUUID(entityUUID, name, newMinimized)
      isMinimized.set(newMinimized)
    }
  }

  return (
    <div className={twMerge('group/component-dropdown w-full bg-surface-3 ', isMinimized.value && 'h-10')} tabIndex={0}>
      <div className="grid w-full cursor-pointer grid-cols-1 items-center p-2" onClick={toggleMinimized}>
        <div className="col-span-1 flex w-full items-center">
          <Tooltip content={isMinimized.value ? 'maximize' : 'minimize'}>
            <button
              className="my-1 text-text-secondary"
              //title={isMinimized.value ? 'maximize' : 'minimize'}
              onClick={toggleMinimized}
            >
              <HiOutlineChevronRight
                className={twMerge('h-4 w-4 transition-transform duration-300', !isMinimized.value ? 'rotate-90' : '')}
                onClick={toggleMinimized}
              />
            </button>
          </Tooltip>

          <div className="flex items-center gap-x-2">
            <button className="ml-2 text-text-secondary group-hover/component-dropdown:text-text-primary group-focus/component-dropdown:text-text-primary">
              <Icon className="h-5 w-5" />
            </button>
            <span className="text-sm leading-6 text-text-secondary group-hover/component-dropdown:text-text-primary group-focus/component-dropdown:text-text-primary">
              {name}
            </span>
            {slug && (
              <a
                className="text-text-secondary hover:text-text-primary"
                target="_blank"
                href={`https://docs.ir.world/${slug}`}
                onClick={(ev) => ev.stopPropagation()}
              >
                <InfoCircleSm />
              </a>
            )}
          </div>
          {onClose && (
            <button className="ml-auto text-text-inactive" onClick={onClose}>
              <HiMiniXMark className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isMinimized.value && (
          <div className="col-span-1 w-full pl-6 pt-2 text-start text-xs text-text-secondary">{description}</div>
        )}
      </div>

      <div className={isMinimized.value ? 'hidden' : ''}>{children}</div>
    </div>
  )
}
