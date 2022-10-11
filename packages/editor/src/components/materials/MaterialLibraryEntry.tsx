import React, { MouseEvent, StyleHTMLAttributes, useCallback } from 'react'
import { useDrag } from 'react-dnd'
import { Material } from 'three'

import { pathResolver } from '@xrengine/engine/src/assets/functions/pathResolver'
import { MaterialComponentType } from '@xrengine/engine/src/renderer/materials/components/MaterialComponent'
import {
  MaterialPrototypeComponent,
  MaterialPrototypeComponentType
} from '@xrengine/engine/src/renderer/materials/components/MaterialPrototypeComponent'
import { MaterialSourceComponentType } from '@xrengine/engine/src/renderer/materials/components/MaterialSource'
import { LibraryEntryType } from '@xrengine/engine/src/renderer/materials/constants/LibraryEntry'
import { entryId, hashMaterialSource } from '@xrengine/engine/src/renderer/materials/functions/Utilities'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import MaterialComponentIcon from '@mui/icons-material/LocalFloristTwoTone'
import MaterialSourceIcon from '@mui/icons-material/YardTwoTone'
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
      const materialEntry = node.entry as MaterialComponentType
      return materialEntry.material.name
    case LibraryEntryType.MATERIAL_SOURCE:
      const srcEntry = node.entry as MaterialSourceComponentType
      return pathResolver().exec(srcEntry.src.path)?.[3] ?? srcEntry.src.path
    case LibraryEntryType.MATERIAL_PROTOTYPE:
      const prototypeEntry = node.entry as MaterialPrototypeComponentType
      return prototypeEntry.prototypeId
  }
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const data = props.data
  const node = data.nodes[props.index]
  const material = node.entry

  const selectionState = useSelectionState()

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
