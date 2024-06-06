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

import { PrefabShelfItem, PrefabShelfState } from '@etherealengine/editor/src/components/prefabs/PrefabEditors'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@etherealengine/editor/src/functions/addMediaNode'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { startCase } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IoIosArrowDown, IoIosArrowUp, IoMdAddCircle } from 'react-icons/io'
import StringInput from '../../../input/String'
import { usePopoverContextClose } from '../../../util/PopoverContext'

const PrefabListItem = ({ item }: { item: PrefabShelfItem }) => {
  const { t } = useTranslation()
  const handleClosePopover = usePopoverContextClose()

  return (
    <button
      className="flex w-full items-center bg-theme-primary p-4 text-white"
      onClick={() => {
        const url = item.url
        //add prefab gltfs in the scene via add media node
        if (url === 'empty') {
          EditorControlFunctions.createObjectFromSceneElement()
        } else {
          //inside add media use dereference for model component
          addMediaNode(url)
        }

        handleClosePopover()
      }}
    >
      <IoMdAddCircle className="h-6 w-6 text-white" />

      <div className="ml-4 w-full">
        <h3 className="text-subtitle1 text-center text-white">
          {startCase(item.name.replace('-', ' ').toLowerCase())}
        </h3>

        <p className="text-caption text-center text-white">
          {t(`editor:layout.assetGrid.component-detail.${item.name}`)}
        </p>
      </div>
    </button>
  )
}
const ScenePrefabListItem = ({
  categoryTitle,
  categoryItems,
  isCollapsed
}: {
  categoryTitle: string
  categoryItems: PrefabShelfItem[]
  isCollapsed: boolean
}) => {
  const open = useHookstate(categoryTitle === 'Empty')
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
            <PrefabListItem item={item} />
          ))}
        </ul>
      </div>
    </>
  )
}

const usePrefabShelfCategories = (search: string) => {
  useHookstate(getMutableState(PrefabShelfState)).value

  if (!search) {
    return getState(PrefabShelfState)
  }

  const searchRegExp = new RegExp(search, 'gi')

  return getState(PrefabShelfState).filter(({ name }) => !!name.match(searchRegExp)?.length)
}

export function PrefabList() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const validItems = usePrefabShelfCategories(search.query.value)
  const inputReference = useRef<HTMLInputElement>(null)

  const shelves: Record<string, PrefabShelfItem[]> = {}
  for (const item of validItems) {
    shelves[item.category] ??= []
    shelves[item.category].push(item)
  }
  const shelveslist: string[] = []
  Object.entries(shelves).map(([category, items]) => {
    shelveslist.push(category)
  })

  const onSearch = (text: string) => {
    search.local.set(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      search.query.set(text)
    }, 50)
  }

  useEffect(() => {
    inputReference.current?.focus()
  }, [])

  return (
    <>
      <div className="h-auto w-full overflow-x-hidden overflow-y-scroll bg-theme-primary">
        <div className="p-2">
          <h2 className="text-center uppercase text-white">{t('editor:layout.assetGrid.prefab')}</h2>
          <StringInput
            placeholder={t('editor:layout.assetGrid.prefab-search')}
            value={search.local.value}
            onChange={(val) => onSearch(val)}
            inputRef={inputReference}
          />
        </div>
      </div>
      <PrefabListItem item={{ name: 'Empty', url: 'empty', category: '', detail: 'Basic scene entity' }} />
      {Object.entries(shelves).map(([category, items]) => (
        <ScenePrefabListItem categoryTitle={category} categoryItems={items} isCollapsed={!!search.query.value} />
      ))}
    </>
  )
}

export default PrefabList
