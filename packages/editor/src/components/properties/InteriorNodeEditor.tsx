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
export class InteriorNodeEditor extends Component<InteriorNodeEditorProps> {
  constructor(props: InteriorNodeEditorProps) {
    super(props)
    this.props = props
  }

  //setting iconComponent name
  static iconComponent = City

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.interior.description')

  declare props: InteriorNodeEditorProps

  onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  //rendering view
  render() {
    InteriorNodeEditor.description = this.props.t('editor:properties.interior.description')
    return (
      <NodeEditor {...this.props} description={InteriorNodeEditor.description}>
        <InputGroup name="Cube Map" label={this.props.t('editor:properties.interior.lbl-cubeMap')}>
          <ImageInput value={this.props.node.cubeMap} onChange={this.onChangeProperty('cubeMap')} />
        </InputGroup>
        <InputGroup name="Size" label={this.props.t('editor:properties.interior.lbl-size')}>
          <Vector2Input value={this.props.node.size} onChange={this.onChangeProperty('size')} />
        </InputGroup>
        <NumericInputGroup
          name="Tiling"
          label={this.props.t('editor:properties.interior.lbl-tiling')}
          min={1}
          smallStep={1.0}
          mediumStep={1.0}
          largeStep={2.0}
          value={this.props.node.tiling}
          onChange={this.onChangeProperty('tiling')}
        />
      </NodeEditor>
    )
  }
}

export default withTranslation()(InteriorNodeEditor)
