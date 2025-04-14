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

import { useQuery } from '@ir-engine/ecs'
import { Component } from '@ir-engine/ecs/src/ComponentFunctions'
import { PrefabIcon, PrefabShelfItem, PrefabShelfState } from '@ir-engine/editor/src/components/prefabs/PrefabEditors'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@ir-engine/editor/src/functions/addMediaNode'
import { ComponentEditorsState } from '@ir-engine/editor/src/services/ComponentEditors'
import { ComponentShelfCategoriesState } from '@ir-engine/editor/src/services/ComponentShelfCategoriesState'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { RenderSettingsComponent } from '@ir-engine/engine/src/scene/components/RenderSettingsComponent'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import StringInput from '@ir-engine/ui/src/components/editor/input/String'
import { PlusCircleSm } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { startCase } from 'lodash'
import React, { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GrStatusPlaceholder } from 'react-icons/gr'
import { twMerge } from 'tailwind-merge'
import { EditorHistoryFunctions } from '../../services/EditorHistoryState'

type ElementsType = 'components' | 'prefabs'

const labelRemapping = {
  EE_media: 'audio'
}

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: JSX.Element
  type: typeof ItemTypes.Component
}

const ComponentListItem = ({ item, onSelect }: { item: Component; onSelect: () => void }) => {
  const { t } = useTranslation()
  useMutableState(ComponentEditorsState).keys // ensure reactively updates new components
  const Icon = getState(ComponentEditorsState)[item.name]?.iconComponent ?? GrStatusPlaceholder

  // remove any prefix from the jsonID
  const jsonName =
    (item.jsonID ? labelRemapping[item.jsonID] : undefined) || item.jsonID?.split('_').slice(1).join('-') || item.name

  return (
    <button
      className="flex w-full items-center justify-center gap-1 rounded-md bg-ui-background p-2 text-text-secondary hover:bg-ui-hover-primary hover:text-text-primary-button"
      onClick={() => {
        const entities = SelectionState.getSelectedEntities()
        EditorHistoryFunctions.setComponent(entities, item)
        onSelect()
      }}
    >
      <Icon className="h-4 w-4" />
      <div className="ml-4 w-full">
        <Text className="mb-1 block text-left text-sm">{startCase(jsonName.replace('-', ' ').toLowerCase())}</Text>
        <Text component="p" className="block text-left text-xs ">
          {t(`editor:layout.assetGrid.component-detail.${jsonName}`, '')}
        </Text>
      </div>
    </button>
  )
}

const PrefabListItem = ({ item, onSelect }: { item: PrefabShelfItem; onSelect: () => void }) => {
  return (
    <button
      className="flex w-full items-center justify-center gap-1 rounded-md bg-ui-background p-2 text-text-secondary hover:bg-ui-hover-primary hover:text-text-primary-button"
      data-testid="prefabs-category-item"
      onClick={() => {
        const url = item.url
        if (!url.length) {
          EditorControlFunctions.createObjectFromSceneElement([
            {
              name: TransformComponent.jsonID
            }
          ])
          EditorHistoryFunctions.snapshot()
        } else {
          addMediaNode(url)
        }
        onSelect()
      }}
    >
      <PlusCircleSm />
      <div className="ml-4 w-full">
        <Text className="mb-1 block text-left text-sm" data-testid="prefabs-category-item-name">
          {item.name}
        </Text>
        <Text component="p" className="block text-left text-xs " data-testid="prefabs-category-item-detail">
          {item.detail}
        </Text>
      </div>
    </button>
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
  return (
    <button
      className={twMerge(
        'flex flex-col items-center justify-center gap-1 rounded-xl border border-ui-outline bg-ui-background px-3 py-2.5 text-sm font-medium',
        selected
          ? 'border-ui-select-outline bg-ui-select-primary text-text-primary-button'
          : 'text-text-secondary hover:bg-ui-hover-background hover:text-text-primary'
      )}
      data-testid="prefabs-category"
      onClick={onClick}
    >
      <PrefabIcon categoryTitle={categoryTitle} isSelected={selected ?? false} />
      <span
        className="max-w-full overflow-hidden truncate whitespace-nowrap text-nowrap"
        data-testid="prefabs-category-title"
      >
        {categoryTitle}
      </span>
    </button>
  )
}

const useComponentShelfCategories = (search: string) => {
  useMutableState(ComponentShelfCategoriesState).value
  const hasRenderSettingsEntites = useQuery([RenderSettingsComponent]).length > 0
  const hasSceneSettingsEntites = useQuery([SceneSettingsComponent]).length > 0
  const hasCameraSettingsEntites = useQuery([CameraSettingsComponent]).length > 0

  const mapSettingsComponents = ([category, components]: [string, Component[]]) => {
    const filteredComponents = components
      .filter((component) => !(component.name === RenderSettingsComponent.name && hasRenderSettingsEntites))
      .filter((component) => !(component.name === SceneSettingsComponent.name && hasSceneSettingsEntites))
      .filter((component) => !(component.name === CameraSettingsComponent.name && hasCameraSettingsEntites))
    return [category, filteredComponents]
  }

  const filteredCategories = useMemo(() => {
    if (!search) {
      return Object.entries(getState(ComponentShelfCategoriesState))
        .map(mapSettingsComponents)
        .filter(([_, items]) => !!items.length)
    }

    return Object.entries(getState(ComponentShelfCategoriesState))
      .map(([category, items]) => {
        const filteredItems = items.filter((item) =>
          ((item.jsonID ? labelRemapping[item.jsonID] : undefined) || item.name)
            .toLowerCase()
            .includes(search.toLowerCase())
        )
        return [category, filteredItems] as [string, Component[]]
      })
      .map(mapSettingsComponents)
      .filter(([_, items]) => !!items.length)
  }, [search])

  return filteredCategories
}

const usePrefabShelfCategories = (search: string): [string, PrefabShelfItem[]][] => {
  const prefabState = useMutableState(PrefabShelfState).value
  const prefabShelves = useMemo(() => {
    const shelves: Record<string, PrefabShelfItem[]> = {}
    for (const prefab of prefabState) {
      shelves[prefab.category] ??= []
      shelves[prefab.category].push(prefab)
    }

    shelves['Empty'] ??= [
      {
        name: 'Create',
        url: '',
        category: 'Empty'
      }
    ]
    return shelves
  }, [prefabState])

  const filteredCategories = useMemo(() => {
    if (!search) {
      return Object.entries(prefabShelves)
    }
    return Object.entries(prefabShelves)
      .map(([category, items]) => {
        const filteredItems = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        return [category, filteredItems] as [string, PrefabShelfItem[]]
      })
      .filter(([_, items]) => !!items.length)
  }, [search])

  return filteredCategories
}

export function ElementList({ type, onSelect }: { type: ElementsType; onSelect: () => void }) {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedCategories = useHookstate([] as number[])
  const prevSearchQuery = useRef('')

  const onClickCategory = (index: number) => {
    const currentIndex = selectedCategories.value.indexOf(index)
    if (currentIndex === -1) {
      selectedCategories.set([index])
    } else {
      const newSelectedCategories = [...selectedCategories.value]
      newSelectedCategories.splice(currentIndex, 1)
      selectedCategories.set(newSelectedCategories)
    }
  }

  const shelves =
    type === 'components'
      ? useComponentShelfCategories(search.query.value)
      : usePrefabShelfCategories(search.query.value)
  const inputReference = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputReference.current?.focus()
  }, [])

  const isInSearchMode = search.query.value.length > 0

  useEffect(() => {
    if (!search.query.value) {
      if (prevSearchQuery.current) {
        selectedCategories.set([])
      }
    } else {
      selectedCategories.set(Array.from({ length: shelves.length }, (_, index) => index))
    }
    prevSearchQuery.current = search.query.value
  }, [search.query, shelves])

  const onSearch = (text: string) => {
    search.local.set(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      search.query.set(text)
    }, 50)
  }

  return (
    <div className="rounded-xl border border-ui-outline bg-surface-1 p-4">
      <div className="h-auto w-full overflow-hidden p-2">
        <Text className="mb-1.5 w-full text-center uppercase text-text-primary">
          {t(`editor:layout.assetGrid.${type}`)}
        </Text>
        <StringInput
          placeholder={t(`editor:layout.assetGrid.${type}-search`)}
          value={search.local.value}
          onChange={(val) => onSearch(val)}
          inputRef={inputReference}
          data-testid="prefabs-search-input"
          fullWidth
        />
      </div>

      {!isInSearchMode && (
        <div className="grid grid-cols-4 gap-1">
          {shelves.map(([category, _items], index) => (
            <SceneElementListItem
              key={category}
              categoryTitle={category}
              onClick={() => onClickCategory(index)}
              selected={selectedCategories.value.includes(index)}
            />
          ))}
        </div>
      )}

      {(isInSearchMode || selectedCategories.value.length > 0) && (
        <ul className="flex w-full flex-col space-y-1 pt-3" data-testid="prefabs-category-item-list">
          {shelves.flatMap(([_, items], index: number) =>
            selectedCategories.value.includes(index)
              ? items.map((item: Component | PrefabShelfItem) =>
                  type === 'components' ? (
                    <ComponentListItem
                      key={(item as Component).jsonID || item.name}
                      item={item as Component}
                      onSelect={onSelect}
                    />
                  ) : (
                    <PrefabListItem
                      key={(item as PrefabShelfItem).url}
                      item={item as PrefabShelfItem}
                      onSelect={onSelect}
                    />
                  )
                )
              : []
          )}
        </ul>
      )}
    </div>
  )
}

export default ElementList
