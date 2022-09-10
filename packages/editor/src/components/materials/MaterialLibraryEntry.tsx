import React, { StyleHTMLAttributes } from 'react'

import MaterialLibraryEntryIcon from '@mui/icons-material/LocalFloristOutlined'
import { Grid } from '@mui/material'

import styles from '../hierarchy/styles.module.scss'

export type MaterialLibraryEntryType = {
  type: string
  prototype: string
}

export type MaterialLibraryEntryData = {
  nodes: MaterialLibraryEntryType[]
}

export type MaterialLibraryEntryProps = {
  index: number
  data: MaterialLibraryEntryData
  style: StyleHTMLAttributes<HTMLElement>
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const node = props.data.nodes[props.index]
  return (
    <li style={props.style}>
      <Grid container spacing={1}>
        <Grid item xs={1}>
          <div className={styles.nodeIcon}>
            <MaterialLibraryEntryIcon className={styles.nodeIcon} />
          </div>
        </Grid>
        <Grid item xs={4}>
          <div className={styles.nodeContent}>{node.type}</div>
        </Grid>
        <Grid item xs={4}>
          <div className={styles.nodeContent}>{node.prototype}</div>
        </Grid>
      </Grid>
    </li>
  )
}
