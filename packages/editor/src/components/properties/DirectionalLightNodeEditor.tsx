import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import { Bolt } from '@styled-icons/fa-solid/Bolt'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import { CommandManager } from '../../managers/CommandManager'

/**
 * Defining properties for DirectionalLightNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type DirectionalLightNodeEditorProps = {
  node?: object
  t?: Function
}

/**
 * DirectionalLightNodeEditor is used provides  properties to customize DirectionaLight element.
 *
 *  @author Robert Long
 *  @type {Component class}
 */
export class DirectionalLightNodeEditor extends Component<DirectionalLightNodeEditorProps, {}> {
  //defining icon component name
  static iconComponent = Bolt

  //setting description and will appears on the node editor.
  static description = i18n.t('editor:properties.directionalLight.description')

  //function to handle changes in color property
  onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
  }
  //function to handle the changes in intensity property of DirectionalLight
  onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  //function to handle the changes in camera far property of DirectionalLight
  onChangeCameraFar = (cameraFar) => {
    CommandManager.instance.setPropertyOnSelection('cameraFar', cameraFar)
  }

  // function to handle changes in showCameraHelper propery
  onChangeshowCameraHelper = (showCameraHelper) => {
    CommandManager.instance.setPropertyOnSelection('showCameraHelper', showCameraHelper)
  }

  // renders editor view, provides inputs to customize properties of DirectionalLight element.
  render() {
    DirectionalLightNodeEditor.description = this.props.t('editor:properties.directionalLight.description')
    const { node } = this.props as any
    return (
      <NodeEditor {...this.props} description={DirectionalLightNodeEditor.description}>
        <InputGroup name="Color" label={this.props.t('editor:properties.directionalLight.lbl-color')}>
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        <NumericInputGroup
          name="Intensity"
          label={this.props.t('editor:properties.directionalLight.lbl-intensity')}
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={node.intensity}
          onChange={this.onChangeIntensity}
          unit="cd"
        />
        <LightShadowProperties node={node} />
        <InputGroup
          name="Camera Debugger"
          label={this.props.t('editor:properties.directionalLight.lbl-showCameraHelper')}
        >
          <BooleanInput value={(node as any).showCameraHelper} onChange={this.onChangeshowCameraHelper} />
        </InputGroup>
        <NumericInputGroup
          name="CameraFar"
          label={this.props.t('editor:properties.directionalLight.lbl-cameraFar')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={node.cameraFar}
          onChange={this.onChangeCameraFar}
        />
      </NodeEditor>
    )
  }
}

export default withTranslation()(DirectionalLightNodeEditor)
