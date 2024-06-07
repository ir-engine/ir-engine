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

import { startCase } from 'lodash'
import React, { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Component } from '@etherealengine/ecs/src/ComponentFunctions'
import { getState, useHookstate, useMutableState } from '@etherealengine/hyperflux'

import { PrefabShelfItem, PrefabShelfState } from '@etherealengine/editor/src/components/prefabs/PrefabEditors'
import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@etherealengine/editor/src/functions/addMediaNode'
import { ComponentEditorsState } from '@etherealengine/editor/src/services/ComponentEditors'
import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/services/ComponentShelfCategoriesState'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { GrStatusPlaceholder } from 'react-icons/gr'
import { IoIosArrowDown, IoIosArrowUp, IoMdAddCircle } from 'react-icons/io'
import Text from '../../../../../primitives/tailwind/Text'
import StringInput from '../../../input/String'
import { usePopoverContextClose } from '../../../util/PopoverContext'

type ElementsType = 'components' | 'prefabs'

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: any
  type: typeof ItemTypes.Component
}

const ComponentListItem = ({ item }: { item: Component }) => {
  const { t } = useTranslation()
  useMutableState(ComponentEditorsState).keys // ensure reactively updates new components
  const Icon = getState(ComponentEditorsState)[item.name]?.iconComponent ?? GrStatusPlaceholder
  const handleClosePopover = usePopoverContextClose()

  const jsonName = item.jsonID?.slice(3).replace('_', '-') || item.name

  return (
    <button
      className="flex w-full items-center bg-theme-primary p-4 text-white"
      onClick={() => {
        const entities = SelectionState.getSelectedEntities()
        EditorControlFunctions.addOrRemoveComponent(entities, item, true)
        handleClosePopover()
      }}
    >
      <Icon className="h-6 w-6 text-white" />
      <div className="ml-4 w-full">
        <Text className="text-subtitle1 block text-center text-theme-primary">
          {startCase(jsonName.replace('-', ' ').toLowerCase())}
        </Text>
        <Text component="p" className="text-caption block text-center text-theme-secondary">
          {t(`editor:layout.assetGrid.component-detail.${jsonName}`, '')}
        </Text>
      </div>
    </button>
  )
}

const PrefabListItem = ({ item }: { item: PrefabShelfItem }) => {
  const handleClosePopover = usePopoverContextClose()

  return (
    <button
      className="flex w-full items-center bg-theme-primary p-4 text-white"
      onClick={() => {
        const url = item.url
        if (!url.length) {
          EditorControlFunctions.createObjectFromSceneElement()
        } else {
          addMediaNode(url)
        }
        handleClosePopover()
      }}
    >
      <IoMdAddCircle className="h-6 w-6 text-white" />
      <div className="ml-4 w-full">
        <Text className="text-subtitle1 block text-center text-theme-primary">{item.name}</Text>
        <Text component="p" className="text-caption block text-center text-theme-secondary">
          {item.detail}
        </Text>
      </div>
    </button>
  )
}

const SceneElementListItem = ({
  categoryTitle,
  categoryItems,
  isCollapsed,
  type
}: {
  categoryTitle: string
  categoryItems: Component[] | PrefabShelfItem[]
  isCollapsed: boolean
  type: ElementsType
}) => {
  const open = useHookstate(false)
  return (
    <>
      <button
        onClick={() => open.set((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between bg-theme-primary px-4 py-2 text-white"
      >
        <span>{categoryTitle}</span>
        {isCollapsed || open.value ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </button>
      <div className={isCollapsed || open.value ? '' : 'hidden'}>
        <ul className="w-full bg-theme-primary">
          {categoryItems.map((item) =>
            type === 'components' ? (
              <ComponentListItem key={item.jsonID || item.name} item={item} />
            ) : (
              <PrefabListItem key={item.url} item={item} />
            )
          )}
        </ul>
      </div>
    </>
  )
}

const useComponentShelfCategories = (search: string) => {
  useMutableState(ComponentShelfCategoriesState).value

  if (!search) {
    return Object.entries(getState(ComponentShelfCategoriesState))
  }

  const searchRegExp = new RegExp(search, 'gi')

  return Object.entries(getState(ComponentShelfCategoriesState))
    .map(([category, items]) => {
      const filteredItems = items.filter((item) => item.name.match(searchRegExp)?.length)
      return [category, filteredItems] as [string, Component[]]
    })
    .filter(([_, items]) => !!items.length)
}

const usePrefabShelfCategories = (search: string): [string, PrefabShelfItem[]][] => {
  const prefabState = useMutableState(PrefabShelfState).value
  const prefabShelves = useMemo(() => {
    const shelves: Record<string, PrefabShelfItem[]> = {}
    for (const prefab of prefabState) {
      shelves[prefab.category] ??= []
      shelves[prefab.category].push(prefab)
    }
    return shelves
  }, [prefabState])

  if (!search) {
    return Object.entries(prefabShelves)
  }

  const searchRegExp = new RegExp(search, 'gi')

  return Object.entries(prefabShelves)
    .map(([category, items]) => {
      const filteredItems = items.filter((item) => item.name.match(searchRegExp)?.length)
      return [category, filteredItems] as [string, PrefabShelfItem[]]
    })
    .filter(([_, items]) => !!items.length)
}

export function ElementList({ type }: { type: ElementsType }) {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const shelves =
    type === 'components'
      ? useComponentShelfCategories(search.query.value)
      : usePrefabShelfCategories(search.query.value)
  const inputReference = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputReference.current?.focus()
  }, [])

  const onSearch = (text: string) => {
    search.local.set(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      search.query.set(text)
    }, 50)
  }

  return (
    <>
      <div className="h-auto w-full overflow-x-hidden overflow-y-scroll bg-theme-primary p-2">
        <Text className="mb-1.5 w-full text-center uppercase text-white">{t(`editor:layout.assetGrid.${type}`)}</Text>
        <StringInput
          placeholder={t(`editor:layout.assetGrid.${type}-search`)}
          value={search.local.value}
          onChange={(val) => onSearch(val)}
          inputRef={inputReference}
        />
      </div>
      {type === 'prefabs' && (
        <PrefabListItem item={{ name: 'Empty', url: '', category: '', detail: 'Basic scene entity' }} />
      )}
      {shelves.map(([category, items]) => (
        <SceneElementListItem
          key={category}
          categoryTitle={category}
          categoryItems={items}
          isCollapsed={!!search.query.value}
          type={type}
        />
      ))}
    </>
  )
}

export default ElementList
