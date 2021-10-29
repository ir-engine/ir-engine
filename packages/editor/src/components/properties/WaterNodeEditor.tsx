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
const WaterNodeEditor = (props: WaterNodeEditorProps) => {
  const onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  return <NodeEditor {...props} description={WaterNodeEditor.description}></NodeEditor>
}

WaterNodeEditor.iconComponent = Water
WaterNodeEditor.description = i18n.t('editor:properties.water.description')

export default withTranslation()(WaterNodeEditor)
