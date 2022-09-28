import React, { MouseEvent, StyleHTMLAttributes, useCallback } from 'react'
import { useDrag } from 'react-dnd'
import { Material } from 'three'

import { MaterialComponentType } from '@xrengine/engine/src/renderer/materials/components/MaterialComponent'
import {
  MaterialPrototypeComponent,
  MaterialPrototypeComponentType
} from '@xrengine/engine/src/renderer/materials/components/MaterialPrototypeComponent'
import { MaterialSourceComponentType } from '@xrengine/engine/src/renderer/materials/components/MaterialSource'
import { LibraryEntryType } from '@xrengine/engine/src/renderer/materials/constants/LibraryEntry'
import { entryId, hashMaterialSource } from '@xrengine/engine/src/renderer/materials/functions/Utilities'

import MaterialLibraryEntryIcon from '@mui/icons-material/LocalFloristOutlined'
import { Grid } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import { useSelectionState } from '../../services/SelectionServices'
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
}

export type MaterialLibraryEntryProps = {
  index: number
  data: MaterialLibraryEntryData
  style: StyleHTMLAttributes<HTMLElement>
}

const getNodeElId = (node: MaterialLibraryEntryType) => {
  return 'material-node-' + entryId(node.entry, node.type)
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const data = props.data
  const node = data.nodes[props.index]
  const material = node.entry

  const onClickNode = useCallback((e) => data.onClick(e, node), [node, data.onClick])
  const selectionState = useSelectionState()

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
      onClick={onClickNode}
      className={
        styles.treeNodeContainer +
        (node.selected ? ' ' + styles.selected : '') +
        (node.active ? ` ${styles.selected}` : '')
      }
    >
      <div className={styles.nodeContent}>
        <Grid container spacing={1} columns={16}>
          <Grid item xs={1}>
            <div className={styles.nodeIcon}>
              <MaterialLibraryEntryIcon className={styles.nodeIcon} />
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={styles.nodeContent}>{node.type}</div>
          </Grid>
          <Grid item xs={3}>
            <div className={styles.nodeContent}>{node.uuid}</div>
          </Grid>
        </Grid>
      </div>
    </li>
  )
}
