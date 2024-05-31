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

import MaterialComponentIcon from '@mui/icons-material/LocalFloristTwoTone'
import { Grid } from '@mui/material'
import React, { MouseEvent, StyleHTMLAttributes, useCallback } from 'react'
import { useDrag } from 'react-dnd'

import { EntityUUID, getOptionalComponent, UUIDComponent } from '@etherealengine/ecs'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { MaterialComponent, MaterialComponents } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'

import { ItemTypes } from '../../constants/AssetTypes'
import { SelectionState } from '../../services/SelectionServices'
import styles from '../hierarchy/styles.module.scss'

export type MaterialLibraryEntryType = {
  uuid: EntityUUID
  path: string
  selected?: boolean
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

const nodeDisplayName = (node: MaterialLibraryEntryType) => {
  return (
    getOptionalComponent(
      UUIDComponent.getEntityByUUID(node.uuid as EntityUUID),
      MaterialComponent[MaterialComponents.State]
    )?.material?.name ?? ''
  )
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const data = props.data
  const node = data.nodes[props.index]

  const selectionState = useMutableState(SelectionState)

  const onClickNode = (e) => {
    data.onClick(e, node)
  }

  const onCollapseNode = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      data.onCollapse(e, node)
    },
    [node, data.onCollapse]
  )

  const [_dragProps, drag] = useDrag({
    type: ItemTypes.Material,
    item() {
      const selectedEntities = selectionState.selectedEntities.value
      const multiple = selectedEntities.length > 1
      return {
        type: ItemTypes.Material,
        multiple,
        value: node.uuid
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })
  const materialSelection = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  return (
    <li
      style={props.style}
      ref={drag}
      id={node.uuid}
      className={styles.treeNodeContainer + (materialSelection.value === node.uuid ? ' ' + styles.selected : '')}
      onClick={onClickNode}
    >
      <div className={styles.nodeContent}>
        <Grid container columns={16} sx={{ flexWrap: 'unset' }}>
          <Grid item xs={1}>
            <div className={styles.nodeIcon}>
              <MaterialComponentIcon className={styles.nodeIcon} />
            </div>
          </Grid>
          <div className={styles.spacer} />
          <Grid item xs>
            <div className={styles.nodeContent}>{nodeDisplayName(node)}</div>
          </Grid>
        </Grid>
      </div>
    </li>
  )
}
