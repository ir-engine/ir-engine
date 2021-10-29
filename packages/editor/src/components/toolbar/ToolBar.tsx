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

/**
 *
 * @author Robert Long
 */
type ToolBarState = {
  editorInitialized: boolean
}

/**
 *
 * @author Robert Long
 */
const ToolBar = (props: ToolBarProps) => {
  let [editorInitialized, setEditInitialized] = useState(false)
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onRendererInitialized = () => {
    setEditInitialized(true)
    CommandManager.instance.removeListener(EditorEvents.RENDERER_INITIALIZED.toString(), onRendererInitialized)
  }

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), onRendererInitialized)
    CommandManager.instance.addListener(EditorEvents.SETTINGS_CHANGED.toString(), forceUpdate)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.SETTINGS_CHANGED.toString(), forceUpdate)
    }
  }, [])

  useEffect(() => {}, null)

  if (!editorInitialized) {
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
