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

import { useHookstate } from '@hookstate/core'
import React, { MouseEvent, StyleHTMLAttributes, useCallback } from 'react'
import { useDrag } from 'react-dnd'

import { pathResolver } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { MaterialComponentType } from '@etherealengine/engine/src/renderer/materials/components/MaterialComponent'
import { MaterialPrototypeComponentType } from '@etherealengine/engine/src/renderer/materials/components/MaterialPrototypeComponent'
import { MaterialSourceComponentType } from '@etherealengine/engine/src/renderer/materials/components/MaterialSource'
import { LibraryEntryType } from '@etherealengine/engine/src/renderer/materials/constants/LibraryEntry'
import { entryId } from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { getMutableState } from '@etherealengine/hyperflux'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import MaterialComponentIcon from '@mui/icons-material/LocalFloristTwoTone'
import MaterialSourceIcon from '@mui/icons-material/YardTwoTone'
import { Grid } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import { SelectionState } from '../../services/SelectionServices'
import styles from '../hierarchy/styles.module.scss'

export type MaterialLibraryEntryType = {
  uuid: string
  type: LibraryEntryType
  entry: MaterialComponentType | MaterialSourceComponentType | MaterialPrototypeComponentType
  selected?: boolean
  active?: boolean
  isCollapsed?: boolean
}

export type MaterialLibraryEntryData = {
  nodes: MaterialLibraryEntryType[]
  onClick: (e: MouseEvent, node: MaterialLibraryEntryType) => void
  onCollapse: (e: MouseEvent, node: MaterialLibraryEntryType) => void
}

export type MaterialLibraryEntryProps = {
  index: number
  data: MaterialLibraryEntryData
  style: StyleHTMLAttributes<HTMLElement>
}

const getNodeElId = (node: MaterialLibraryEntryType) => {
  return 'material-node-' + entryId(node.entry, node.type)
}

const nodeDisplayName = (node: MaterialLibraryEntryType) => {
  switch (node.type) {
    case LibraryEntryType.MATERIAL:
      return (node.entry as MaterialComponentType).material.name
    case LibraryEntryType.MATERIAL_SOURCE:
      return (
        pathResolver().exec((node.entry as MaterialSourceComponentType).src.path)?.[3] ??
        (node.entry as MaterialSourceComponentType).src.path
      )
    case LibraryEntryType.MATERIAL_PROTOTYPE:
      return (node.entry as MaterialPrototypeComponentType).prototypeId
  }
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const data = props.data
  const node = data.nodes[props.index]
  const material = node.entry

  const selectionState = useHookstate(getMutableState(SelectionState))

  const onClickNode = useCallback((e) => data.onClick(e, node), [node, data.onClick])

  const onCollapseNode = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      data.onCollapse(e, node)
    },
    [node, data.onCollapse]
  )

  const [_dragProps, drag, preview] = useDrag({
    type: ItemTypes.Material,
    item() {
      const selectedEntities = selectionState.selectedEntities.value
      const multiple = selectedEntities.length > 1
      switch (node.type) {
        case LibraryEntryType.MATERIAL:
          return {
            type: ItemTypes.Material,
            multiple,
            value: (material as MaterialComponentType).material.uuid
          }
        default:
          return null
      }
    },
    canDrag() {
      return node.type === LibraryEntryType.MATERIAL
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  return (
    <li
      style={props.style}
      ref={drag}
      id={getNodeElId(node)}
      className={
        styles.treeNodeContainer +
        (node.selected ? ' ' + styles.selected : '') +
        (node.active ? ` ${styles.selected}` : '')
      }
      onClick={onClickNode}
    >
      <div className={styles.nodeContent}>
        <Grid container columns={16} sx={{ flexWrap: 'unset' }}>
          <Grid item xs={1}>
            {node.type === LibraryEntryType.MATERIAL_SOURCE ? (
              node.isCollapsed ? (
                <ArrowRightIcon className={styles.collapseButton} onClick={onCollapseNode} />
              ) : (
                <ArrowDropDownIcon className={styles.collapseButton} onClick={onCollapseNode} />
              )
            ) : (
              <div className={styles.spacer} />
            )}
          </Grid>
          <Grid item xs={1}>
            <div className={styles.nodeIcon}>
              {node.type === LibraryEntryType.MATERIAL && <MaterialComponentIcon className={styles.nodeIcon} />}
              {node.type === LibraryEntryType.MATERIAL_SOURCE && <MaterialSourceIcon className={styles.nodeIcon} />}
            </div>
          </Grid>
          <Grid item xs>
            <div className={styles.nodeContent}>{nodeDisplayName(node)}</div>
          </Grid>
        </Grid>
      </div>
    </li>
  )
}
