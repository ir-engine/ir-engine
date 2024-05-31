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
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Component } from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import PlaceHolderIcon from '@mui/icons-material/GroupAddOutlined'

import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { ComponentEditorsState } from '@etherealengine/editor/src/services/ComponentEditors'
import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/services/ComponentShelfCategoriesState'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import StringInput from '../../../input/String'
import { usePopoverContextClose } from '../../../util/PopoverContext'

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: any
  type: typeof ItemTypes.Component
}

const ComponentListItem = ({ item }: { item: Component }) => {
  const { t } = useTranslation()
  useHookstate(getMutableState(ComponentEditorsState).keys).value // ensure reactively updates new components
  const Icon = getState(ComponentEditorsState)[item.name]?.iconComponent ?? PlaceHolderIcon
  const handleClosePopover = usePopoverContextClose()

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
        <h3 className="text-subtitle1 text-center text-white">
          {startCase((item.jsonID || item.name).replace('-', ' ').toLowerCase())}
        </h3>
        <p className="text-caption text-center text-white">
          {t(`editor:layout.assetGrid.component-detail.${item.jsonID}`)}
        </p>
      </div>
    </button>
  )
}

const SceneElementListItem = ({
  categoryTitle,
  categoryItems,
  isCollapsed
}: {
  categoryTitle: string
  categoryItems: Component[]
  isCollapsed: boolean
}) => {
  const open = useHookstate(categoryTitle === 'Misc')
  return (
    <>
      <button
        onClick={() => open.set((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between bg-theme-primary px-4 py-2 text-white"
      >
        <span>{categoryTitle}</span>
        {isCollapsed || open.value ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </button>
      <div className={`${isCollapsed || open.value ? '' : 'hidden'}`}>
        <ul className="w-full bg-theme-primary">
          {categoryItems.map((item) => (
            <ComponentListItem key={item.jsonID || item.name} item={item} />
          ))}
        </ul>
      </div>
    </>
  )
}

const useComponentShelfCategories = (search: string) => {
  useHookstate(getMutableState(ComponentShelfCategoriesState)).value

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

export function ElementList() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const shelves = useComponentShelfCategories(search.query.value)

  const onSearch = (text: string) => {
    search.local.set(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      search.query.set(text)
    }, 50)
  }

  return (
    <>
      <div className="h-auto w-full overflow-x-hidden overflow-y-scroll bg-theme-primary">
        <div className="p-2">
          <h2 className="text-center uppercase text-white">{t('editor:layout.assetGrid.components')}</h2>
          <StringInput
            placeholder={t('editor:layout.assetGrid.components-search')}
            value={search.local.value}
            onChange={(val) => onSearch(val)}
          />
        </div>
      </div>
      {shelves.map(([category, items]) => (
        <SceneElementListItem
          key={category}
          categoryTitle={category}
          categoryItems={items}
          isCollapsed={!!search.query.value}
        />
      ))}
    </>
  )
  {
    /* <List
      sx={{ width: 300, height: 600, bgcolor: 'var(--dockBackground)' }}
      subheader={
        <div style={{ padding: '0.5rem' }}>
          <Typography style={{ color: 'var(--textColor)', textAlign: 'center', textTransform: 'uppercase' }}>
            {t('editor:layout.assetGrid.components')}
          </Typography>
          <InputText
            placeholder={t('editor:layout.assetGrid.components-search')}
            value={search.local.value}
            sx={{ mt: 1 }}
            onChange={(e) => onSearch(e.target.value)}
            inputRef={inputReference}
          />
        </div>
      }
    >
      {shelves.map(([category, items]) => (
       
      ))}
    </List>*/
  }
}

export default ElementList
