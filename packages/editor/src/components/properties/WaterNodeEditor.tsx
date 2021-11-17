import { Water } from '@styled-icons/fa-solid/Water'
import NodeEditor from './NodeEditor'
import React, { Component } from 'react'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//declaring properties for WaterNodeEditor
type WaterNodeEditorProps = {
  node: any
}

/**
 * WaterNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const WaterNodeEditor = (props: WaterNodeEditorProps) => {
  const { t } = useTranslation()

  const onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  return <NodeEditor {...props} description={t('editor:properties.water.description')}></NodeEditor>
}

WaterNodeEditor.iconComponent = Water

export default WaterNodeEditor
