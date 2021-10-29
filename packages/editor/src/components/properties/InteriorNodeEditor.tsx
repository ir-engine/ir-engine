import React, { Component } from 'react'
import NodeEditor from '../properties/NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector2Input from '../inputs/Vector2Input'
import { City } from '@styled-icons/fa-solid/City'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'

//declaring properties for InteriorNodeEditor
type InteriorNodeEditorProps = {
  node: any
  t: Function
}

/**
 * InteriorNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
const InteriorNodeEditor = (props: InteriorNodeEditorProps) => {
  const onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  return (
    <NodeEditor {...props} description={InteriorNodeEditor.description}>
      <InputGroup name="Cube Map" label={props.t('editor:properties.interior.lbl-cubeMap')}>
        <ImageInput value={props.node.cubeMap} onChange={onChangeProperty('cubeMap')} />
      </InputGroup>
      <InputGroup name="Size" label={props.t('editor:properties.interior.lbl-size')}>
        <Vector2Input value={props.node.size} onChange={onChangeProperty('size')} />
      </InputGroup>
      <NumericInputGroup
        name="Tiling"
        label={props.t('editor:properties.interior.lbl-tiling')}
        min={1}
        smallStep={1.0}
        mediumStep={1.0}
        largeStep={2.0}
        value={props.node.tiling}
        onChange={onChangeProperty('tiling')}
      />
    </NodeEditor>
  )
}

InteriorNodeEditor.iconComponent = City
InteriorNodeEditor.description = i18n.t('editor:properties.interior.description')

export default withTranslation()(InteriorNodeEditor)
