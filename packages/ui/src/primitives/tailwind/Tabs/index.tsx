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

import React, { ReactNode, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

import { State, useHookstate } from '@ir-engine/hyperflux'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import Input from '../../tailwind/Input'

import Text from '../Text'

export interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  tabsData: {
    id?: string
    tabLabel: string | ReactNode
    title?: string
    bottomComponent?: ReactNode
    rightComponent?: ReactNode
    ref?: React.RefObject<HTMLDivElement>
    disabled?: boolean
    search?: State<{
      local: string
      query: string
    }>
  }[]
  backgroundTheme?: string
  tabcontainerClassName?: string
  tabClassName?: string
  scrollable?: boolean
  currentTabIndex?: number
  onTabChange?: (index: number) => void
}

const Tabs = ({
  tabsData,
  tabcontainerClassName,
  tabClassName,
  scrollable,
  currentTabIndex,
  onTabChange,
  ...props
}: TabProps): JSX.Element => {
  const { t } = useTranslation()

  const twTabcontainerClassName = twMerge('flex gap-4', tabcontainerClassName)
  const twTabClassName = twMerge(
    'p-3 text-sm text-theme-secondary disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-b dark:hover:border-b-blue-400',
    tabClassName
  )
  const currentTab = useHookstate(0)
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  useEffect(() => {
    if (currentTabIndex) {
      currentTab.set(currentTabIndex)
    }
  }, [currentTabIndex])

  useEffect(() => {
    if (
      scrollable &&
      tabsData.length &&
      tabsData[currentTab.value] &&
      tabsData[currentTab.value].ref &&
      tabsData[currentTab.value].ref?.current
    ) {
      tabsData[currentTab.value].ref?.current?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'smooth'
      })
    }
    if (onTabChange) {
      onTabChange(currentTab.value)
    }
  }, [currentTab])

  const currentTabData = tabsData[currentTab.value]

  return (
    <div className="relative overflow-y-auto">
      {tabsData[currentTab.value]?.title && (
        <Text component="h2" fontSize="xl" className="mb-6">
          {tabsData[currentTab.value]?.title}
        </Text>
      )}
      <div className="mb-4 flex justify-between">
        <Input
          disabled={!currentTabData.search?.value}
          placeholder={t('common:components.search')}
          value={currentTabData.search?.value.local ?? ''}
          onChange={(event) => {
            currentTabData.search!.local.set(event.target.value)

            if (debouncedSearchQueryRef) {
              clearTimeout(debouncedSearchQueryRef.current)
            }

            debouncedSearchQueryRef.current = setTimeout(() => {
              currentTabData.search!.query.set(event.target.value)
            }, 100)
          }}
          className="bg-theme-surface-main"
          containerClassName="w-1/5 block"
          startComponent={<HiMagnifyingGlass />}
        />
      </div>
      <div className={'sticky top-0 flex justify-between'}>
        <div className={twMerge(twTabcontainerClassName, tabcontainerClassName)} {...props}>
          {tabsData.map((tab, index) => (
            <button
              key={index}
              className={twMerge(
                twTabClassName,
                currentTab.value === index ? 'border-b border-b-blue-primary font-semibold text-theme-primary' : '',
                tab.disabled ? 'border-none' : ''
              )}
              disabled={tab.disabled}
              onClick={() => {
                currentTab.set(index)
              }}
            >
              {tab.tabLabel}
            </button>
          ))}
        </div>
        {tabsData[currentTab.value]?.rightComponent}
      </div>
      {scrollable ? (
        tabsData.map((tab, index) => (
          <div className="mt-4" key={index}>
            {tab.bottomComponent}
          </div>
        ))
      ) : (
        <div className="mt-4">{tabsData[currentTab.value]?.bottomComponent}</div>
      )}
    </div>
  )
}

export default Tabs
