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

import PlaceHolderIcon from '@mui/icons-material/GroupAddOutlined'
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { startCase } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { Component } from '@etherealengine/ecs/src/ComponentFunctions'
import { ComponentShelfCategoriesState } from '@etherealengine/editor/src/services/ComponentShelfCategoriesState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'
import { ItemTypes } from '../../constants/AssetTypes'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { ComponentEditorsState } from '../../services/ComponentEditors'
import { SelectionState } from '../../services/SelectionServices'
import { usePopoverContextClose } from './PopoverContext'

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
    <ListItemButton
      sx={{ pl: 4, bgcolor: 'var(--dockBackground)' }}
      onClick={() => {
        const entities = SelectionState.getSelectedEntities()
        EditorControlFunctions.addOrRemoveComponent(entities, item, true)
        handleClosePopover()
      }}
    >
      <ListItemIcon style={{ color: 'var(--textColor)' }}>
        <Icon />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="subtitle1" color={'var(--textColor)'}>
            {startCase((item.jsonID || item.name).replace('-', ' ').toLowerCase())}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color={'var(--textColor)'}>
            {t(`editor:layout.assetGrid.component-detail.${item.jsonID}`)}
          </Typography>
        }
      />
    </ListItemButton>
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
            <ComponentListItem key={item.jsonID || item.name} item={item} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

const useComponentShelfCategories = (search: string) => {
  useHookstate(getMutableState(ComponentShelfCategoriesState)).value

  if (!search) {
    return Object.entries(getState(ComponentShelfCategoriesState))
  }

  return Object.entries(getState(ComponentShelfCategoriesState))
    .map(([category, items]) => {
      const filteredItems = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      return [category, filteredItems] as [string, Component[]]
    })
    .filter(([_, items]) => !!items.length)
}

export function ElementList() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const shelves = useComponentShelfCategories(search.query.value)
  const inputReference = useRef<HTMLInputElement>(null)

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
        <SceneElementListItem
          key={category}
          categoryTitle={category}
          categoryItems={items}
          isCollapsed={!!search.query.value}
        />
      ))}
    </List>
  )
}

export default ElementList
