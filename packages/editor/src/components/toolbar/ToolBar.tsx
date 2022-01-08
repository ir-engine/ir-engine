import React from 'react'

import MainMenu from '../mainMenu'
import * as styles from './styles.module.scss'
import GridTool from './tools/GridTool'
import PlayModeTool from './tools/PlayModeTool'
import RenderModeTool from './tools/RenderModeTool'
import StatsTool from './tools/StatsTool'
import TransformPivotTool from './tools/TransformPivotTool'
import TransformSnapTool from './tools/TransformSnapTool'
import TransformSpaceTool from './tools/TransformSpaceTool'
import TransformTool from './tools/TransformTool'

type ToolBarProps = {
  menu?: any
  editorReady: boolean
}

export const ToolBar = (props: ToolBarProps) => {
  if (!props.editorReady) {
    return <div className={styles.toolbarContainer} />
  }

  return (
    <div style={{ pointerEvents: 'auto' }} className={styles.toolbarContainer}>
      <MainMenu commands={props.menu} />
      <TransformTool />
      <TransformSpaceTool />
      <TransformPivotTool />
      <TransformSnapTool />
      <GridTool />
      <RenderModeTool />
      <PlayModeTool />
      <StatsTool />
    </div>
  )
}

export default ToolBar
