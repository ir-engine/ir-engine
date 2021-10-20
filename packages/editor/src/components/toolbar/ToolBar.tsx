import React, { Component } from 'react'
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
export class ToolBar extends Component<ToolBarProps, ToolBarState> {
  constructor(props) {
    super(props)

    this.state = {
      editorInitialized: false
    }
  }

  componentDidMount() {
    CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), this.onRendererInitialized)
    CommandManager.instance.addListener(EditorEvents.SETTINGS_CHANGED.toString(), this.onForceUpdate)
  }

  componentWillUnmount() {
    CommandManager.instance.removeListener(EditorEvents.SETTINGS_CHANGED.toString(), this.onForceUpdate)
  }

  onRendererInitialized = () => {
    this.setState({ editorInitialized: true })
    CommandManager.instance.removeListener(EditorEvents.RENDERER_INITIALIZED.toString(), this.onRendererInitialized)
  }

  onForceUpdate = () => {
    this.forceUpdate()
  }

  render() {
    const { editorInitialized } = this.state as any

    if (!editorInitialized) {
      return <div className={styles.toolbarContainer} />
    }

    return (
      <div className={styles.toolbarContainer}>
        <MainMenu commands={this.props.menu} />
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
}

export default ToolBar
