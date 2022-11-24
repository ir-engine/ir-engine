import { NodeSpecJSON } from 'behave-graph'
import { PropsWithChildren } from 'react'
import React from 'react'

import styles from '../styles.module.scss'
import { categoryColorMap, colors } from '../util/colors'

type NodeProps = {
  title: string
  category?: NodeSpecJSON['category']
  selected: boolean
}

export default function NodeContainer({ title, category = 'None', selected, children }: PropsWithChildren<NodeProps>) {
  let colorName = categoryColorMap[category]
  if (colorName === undefined) {
    colorName = 'red'
  }
  let [backgroundColor, borderColor, textColor] = colors[colorName]
  if (selected) {
    borderColor = ''
  }
  return (
    <div className={styles.nodeContainer}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
