import React from 'react'

import MenuIcon from '@mui/icons-material/Menu'

import DropDownMenu from '../dropDownMenu'
import { EditorNavbarProfile } from '../projects/EditorNavbarProfile'
import { WorldInstanceConnection } from '../realtime/WorldInstanceConnection'
import * as styles from './styles.module.scss'
import AdvancedModeTool from './tools/AdvancedModeTool'
import GridTool from './tools/GridTool'
import HelperToggleTool from './tools/HelperToggleTool'
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
      <DropDownMenu icon={MenuIcon} commands={props.menu} />
      <AdvancedModeTool />
      <WorldInstanceConnection />
      <TransformTool />
      <TransformSpaceTool />
      <TransformPivotTool />
      <TransformSnapTool />
      <GridTool />
      <RenderModeTool />
      <PlayModeTool />
      <StatsTool />
      <HelperToggleTool />
      <EditorNavbarProfile />
    </div>
  )
}

export default ToolBar
