import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { Certificate } from '@styled-icons/fa-solid/Certificate'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
type HemisphereLightNodeEditorProps = {
  node?: any
  t: Function
}

/**
 * HemisphereLightNodeEditor used to provide property customization view for HemisphereLightNode.
 *
 * @author Robert Long
 * @type {class Compoment}
 */
export class HemisphereLightNodeEditor extends Component<HemisphereLightNodeEditorProps, {}> {
  //setting icon component name
  static iconComponent = Certificate

  //setting description for HemisphereLightNode and will appears on property container
  static description = i18n.t('editor:properties.hemisphere.description')

  //function handle change in skyColor property
  onChangeSkyColor = (skyColor) => {
    CommandManager.instance.setPropertyOnSelection('skyColor', skyColor)
  }

  //function to handle changes in ground property
  onChangeGroundColor = (groundColor) => {
    CommandManager.instance.setPropertyOnSelection('groundColor', groundColor)
  }

  //function to handle changes in intensity property
  onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  //renders view to customize HemisphereLightNode
  render() {
    HemisphereLightNodeEditor.description = this.props.t('editor:properties.hemisphere.description')
    const node = this.props.node
    return (
      <NodeEditor {...this.props} description={HemisphereLightNodeEditor.description}>
        <InputGroup name="Sky Color" label={this.props.t('editor:properties.hemisphere.lbl-skyColor')}>
          <ColorInput value={node.skyColor} onChange={this.onChangeSkyColor} />
        </InputGroup>
        <InputGroup name="Ground Color" label={this.props.t('editor:properties.hemisphere.lbl-groundColor')}>
          <ColorInput value={node.groundColor} onChange={this.onChangeGroundColor} />
        </InputGroup>
        <NumericInputGroup
          name="Intensity"
          label={this.props.t('editor:properties.hemisphere.lbl-intensity')}
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={(node as any).intensity}
          onChange={this.onChangeIntensity}
          unit="cd"
        />
      </NodeEditor>
    )
  }
}

export default withTranslation()(HemisphereLightNodeEditor)
