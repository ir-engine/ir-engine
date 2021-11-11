import React, { useCallback, useEffect, useState } from 'react'
import EditorEvents from '../../constants/EditorEvents'
import MainMenu from '../mainMenu'
import GridTool from './tools/GridTool'
import { CommandManager } from '../../managers/CommandManager'
import * as styles from './styles.module.scss'
import TransformTool from './tools/TransformTool'
import TransformPivotTool from './tools/TransformPivotTool'
import TransformSpaceTool from './tools/TransformSpaceTool'
import TransformSnapTool from './tools/TransformSnapTool'
import PlayModeTool from './tools/PlayModeTool'
import StatsTool from './tools/StatsTool'
import RenderModeTool from './tools/RenderModeTool'

type ToolBarProps = {
  menu?: any
  editorReady: boolean
}

const ToolBar = (props: ToolBarProps) => {
  if (!props.editorReady) {
    return <div className={styles.toolbarContainer} />
  }

  return (
    <div className={styles.toolbarContainer}>
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
