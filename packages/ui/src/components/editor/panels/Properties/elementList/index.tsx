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

import {
  PrefabIcons,
  PrefabShelfItem,
  PrefabShelfState
} from '@etherealengine/editor/src/components/prefabs/PrefabEditors'
import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@etherealengine/editor/src/functions/addMediaNode'
import { ComponentEditorsState } from '@etherealengine/editor/src/services/ComponentEditors'
import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/services/ComponentShelfCategoriesState'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { GrStatusPlaceholder } from 'react-icons/gr'
import { IoMdAddCircle } from 'react-icons/io'
import { twMerge } from 'tailwind-merge'
import Button from '../../../../../primitives/tailwind/Button'
import Text from '../../../../../primitives/tailwind/Text'
import StringInput from '../../../input/String'

type ElementsType = 'components' | 'prefabs'

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: JSX.Element
  type: typeof ItemTypes.Component
}

const ComponentListItem = ({ item }: { item: Component }) => {
  const { t } = useTranslation()
  useMutableState(ComponentEditorsState).keys // ensure reactively updates new components
  const Icon = getState(ComponentEditorsState)[item.name]?.iconComponent ?? GrStatusPlaceholder

  // remove any prefix from the jsonID
  const jsonName = item.jsonID?.split('_').slice(1).join('-') || item.name

  return (
    <Button
      variant="transparent"
      fullWidth
      className="w-full bg-theme-primary p-2 text-[#B2B5BD]"
      onClick={() => {
        const entities = SelectionState.getSelectedEntities()
        EditorControlFunctions.addOrRemoveComponent(entities, item, true)
      }}
      startIcon={<Icon className="h-4 w-4 text-[#B2B5BD]" />}
    >
      <div className="ml-4 w-full">
        <Text className="mb-1 block text-center text-sm text-[#B2B5BD]">
          {startCase(jsonName.replace('-', ' ').toLowerCase())}
        </Text>
        <Text component="p" className="block text-center text-xs text-theme-secondary">
          {t(`editor:layout.assetGrid.component-detail.${jsonName}`, '')}
        </Text>
      </div>
    </Button>
  )
}

const PrefabListItem = ({ item }: { item: PrefabShelfItem }) => {
  return (
    <Button
      variant="transparent"
      fullWidth
      className="w-full bg-theme-primary p-2 text-[#B2B5BD]"
      onClick={() => {
        const url = item.url
        if (!url.length) {
          EditorControlFunctions.createObjectFromSceneElement()
        } else {
          addMediaNode(url)
        }
      }}
      startIcon={<IoMdAddCircle className="h-4 w-4 text-[#B2B5BD]" />}
    >
      <div className="ml-4 w-full">
        <Text className="mb-1 block text-center text-sm text-[#B2B5BD]">{item.name}</Text>
        <Text component="p" className="block text-center text-xs text-theme-secondary">
          {item.detail}
        </Text>
      </div>
    </Button>
  )
}

const SceneElementListItem = ({
  categoryTitle,
  selected,
  onClick
}: {
  onClick: () => void
  categoryTitle: string
  selected?: boolean
}) => {
  const icon = PrefabIcons[categoryTitle] || PrefabIcons.default

  return (
    <button
      className={twMerge(
        'col-span-1 grid place-items-center gap-1 text-ellipsis rounded-xl border-[#42454D] bg-[#191B1F] px-3 py-2.5 text-sm font-medium',
        selected ? 'text-primary' : 'text-[#B2B5BD]'
      )}
      onClick={onClick}
    >
      {icon}
      {categoryTitle}
    </button>
  )
}

const useComponentShelfCategories = (search: string) => {
  useMutableState(ComponentShelfCategoriesState).value

  if (!search) {
    return Object.entries(getState(ComponentShelfCategoriesState))
  }

  const searchString = search.toLowerCase()

  return Object.entries(getState(ComponentShelfCategoriesState))
    .map(([category, items]) => {
      const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchString))
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

  const searchString = search.toLowerCase()

  return Object.entries(prefabShelves)
    .map(([category, items]) => {
      const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchString))
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

  const clickedPrefab = useHookstate(null as number | null)

  return (
    <div className="rounded-xl bg-theme-primary p-4 font-['Figtree']">
      <div className="h-auto w-full overflow-x-hidden overflow-y-scroll  p-2">
        <Text className="mb-1.5 w-full text-center uppercase text-white">{t(`editor:layout.assetGrid.${type}`)}</Text>
        <StringInput
          placeholder={t(`editor:layout.assetGrid.${type}-search`)}
          value={search.local.value}
          onChange={(val) => onSearch(val)}
          inputRef={inputReference}
        />
      </div>

      <div className="grid grid-cols-4 gap-1">
        {shelves.map(([category, items], index) => (
          <SceneElementListItem
            key={category}
            categoryTitle={category}
            onClick={() => clickedPrefab.set(index)}
            selected={clickedPrefab.value === index}
          />
        ))}

        <SceneElementListItem
          categoryTitle="Empty"
          onClick={() => {
            EditorControlFunctions.createObjectFromSceneElement()
          }}
        />
      </div>

      {clickedPrefab.value !== null && (
        <ul className="w-full">
          {shelves[clickedPrefab.value]?.[1].map((item: Component | PrefabShelfItem) =>
            type === 'components' ? (
              <ComponentListItem key={(item as Component).jsonID || item.name} item={item as Component} />
            ) : (
              <PrefabListItem key={(item as PrefabShelfItem).url} item={item as PrefabShelfItem} />
            )
          )}
        </ul>
      )}
    </div>
  )
}

export default ElementList
