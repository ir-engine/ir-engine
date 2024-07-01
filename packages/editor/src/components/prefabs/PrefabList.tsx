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

import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { addMediaNode } from '../../functions/addMediaNode'
import { usePopoverContextClose } from '../element/PopoverContext'
import { PrefabShelfItem, PrefabShelfState } from './PrefabEditors'

const PrefabListItem = ({ item }: { item: PrefabShelfItem }) => {
  const { t } = useTranslation()
  const handleClosePopover = usePopoverContextClose()

  return (
    <ListItemButton
      sx={{ pl: 4, bgcolor: 'var(--dockBackground)' }}
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
      <ListItemIcon style={{ color: 'var(--textColor)' }}></ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="subtitle1" color={'var(--textColor)'}>
            {item.name}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color={'var(--textColor)'}>
            {item.detail ??
              t(`editor:layout.assetGrid.component-detail.${item.name.toLowerCase().replaceAll(/\s+/g, '-')}`)}
          </Typography>
        }
      />
    </ListItemButton>
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
      <ListItemButton
        onClick={() => open.set((prev) => !prev)}
        style={{
          backgroundColor: 'var(--dockBackground)',
          cursor: 'pointer',
          color: 'var(--textColor)',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <Typography>{categoryTitle}</Typography>
        <Icon type={isCollapsed || open.value ? 'KeyboardArrowUp' : 'KeyboardArrowDown'} />
      </ListItemButton>
      <Collapse in={isCollapsed || open.value} timeout={'auto'} unmountOnExit>
        <List component={'div'} sx={{ bgcolor: 'var(--dockBackground)', width: '100%' }} disablePadding>
          {categoryItems.map((item) => (
            <PrefabListItem item={item} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

const usePrefabShelfCategories = (search: string) => {
  useHookstate(getMutableState(PrefabShelfState)).value

  if (!search) {
    return getState(PrefabShelfState)
  }

  const searchString = search.toLowerCase()
  return getState(PrefabShelfState).filter(({ name }) => name.toLowerCase().includes(searchString))
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
    <List
      sx={{ width: 300, height: 500, bgcolor: 'var(--dockBackground)' }}
      subheader={
        <div style={{ padding: '0.5rem' }}>
          <Typography style={{ color: 'var(--textColor)', textAlign: 'center', textTransform: 'uppercase' }}>
            {t('editor:layout.assetGrid.prefab')}
          </Typography>
          <InputText
            placeholder={t('editor:layout.assetGrid.prefab-search')}
            value={search.local.value}
            sx={{ mt: 1 }}
            onChange={(e) => onSearch(e.target.value)}
            inputRef={inputReference}
          />
        </div>
      }
    >
      <PrefabListItem item={{ name: 'Empty', url: 'empty', category: '', detail: 'Basic scene entity' }} />
      {Object.entries(shelves).map(([category, items]) => (
        <ScenePrefabListItem categoryTitle={category} categoryItems={items} isCollapsed={!!search.query.value} />
      ))}
    </List>
  )
}

export default PrefabList
