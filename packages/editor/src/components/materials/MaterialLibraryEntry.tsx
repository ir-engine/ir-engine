import React, { MouseEvent, StyleHTMLAttributes, useCallback } from 'react'
import { useDrag } from 'react-dnd'
import { Material } from 'three'

import MaterialLibraryEntryIcon from '@mui/icons-material/LocalFloristOutlined'
import { Grid } from '@mui/material'

import { ItemTypes } from '../../constants/AssetTypes'
import { useSelectionState } from '../../services/SelectionServices'
import styles from '../hierarchy/styles.module.scss'

export type MaterialLibraryEntryType = {
  uuid: string
  material: Material
  prototype: string
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
  return 'material-node-' + node.material.uuid
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const data = props.data
  const node = data.nodes[props.index]
  const material = node.material

  const onClickNode = useCallback((e) => data.onClick(e, node), [node, data.onClick])
  const selectionState = useSelectionState()

  const [_dragProps, drag, preview] = useDrag({
    type: ItemTypes.Material,
    item() {
      const selectedEntities = selectionState.selectedEntities.value
      const multiple = selectedEntities.length > 1
      return {
        type: ItemTypes.Material,
        multiple,
        value: material.uuid
      }
    },
    canDrag() {
      return true
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
        <Grid container spacing={1}>
          <Grid item xs={1}>
            <div className={styles.nodeIcon}>
              <MaterialLibraryEntryIcon className={styles.nodeIcon} />
            </div>
          </Grid>
          <Grid item xs={3}>
            <div>{material.name ? material.name : '[NO NAME]'}</div>
          </Grid>
          <Grid item xs={3}>
            <div>{node.prototype}</div>
          </Grid>
          <Grid item xs={3}>
            <div>{material.uuid}</div>
          </Grid>
        </Grid>
      </div>
    </li>
  )
}
