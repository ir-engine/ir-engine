import { Water } from '@styled-icons/fa-solid/Water'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//declaring properties for WaterNodeEditor
type WaterNodeEditorProps = {
  node: any
  t: Function
}

/**
 * WaterNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class WaterNodeEditor extends Component<WaterNodeEditorProps> {
  constructor(props: WaterNodeEditorProps) {
    super(props)
    this.props = props
  }

  //setting iconComponent name
  static iconComponent = Water

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.water.description')

  declare props: WaterNodeEditorProps

  onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  //rendering view
  render() {
    WaterNodeEditor.description = this.props.t('editor:properties.water.description')
    return <NodeEditor {...this.props} description={WaterNodeEditor.description}></NodeEditor>
  }
}

export default withTranslation()(WaterNodeEditor)
