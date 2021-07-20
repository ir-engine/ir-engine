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

/**
 * Defining properties for DirectionalLightNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type DirectionalLightNodeEditorProps = {
  editor?: object
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
    ;(this.props.editor as any).setPropertySelected('color', color)
  }
  //function to handle the changes in intensity property of DirectionalLight
  onChangeIntensity = (intensity) => {
    ;(this.props.editor as any).setPropertySelected('intensity', intensity)
  }

  //function to handle the changes in camera far property of DirectionalLight
  onChangeCameraFar = (cameraFar) => {
    ;(this.props.editor as any).setPropertySelected('cameraFar', cameraFar)
  }

  //function to handle the changes in camera near property of DirectionalLight
  onChangeCameraNear = (cameraNear) => {
    ;(this.props.editor as any).setPropertySelected('cameraNear', cameraNear)
  }

  //function to handle the changes in camera Top property of DirectionalLight
  onChangeCameraTop = (cameraTop) => {
    ;(this.props.editor as any).setPropertySelected('cameraTop', cameraTop)
  }
  //function to handle the changes in camera Bottom property of DirectionalLight
  onChangeCameraBottom = (cameraBottom) => {
    ;(this.props.editor as any).setPropertySelected('cameraBottom', cameraBottom)
  }
  //function to handle the changes in camera Left property of DirectionalLight
  onChangeCameraLeft = (cameraLeft) => {
    ;(this.props.editor as any).setPropertySelected('cameraLeft', cameraLeft)
  }
  //function to handle the changes in camera Right property of DirectionalLight
  onChangeCameraRight = (cameraRight) => {
    ;(this.props.editor as any).setPropertySelected('cameraRight', cameraRight)
  }

  // function to handle changes in showCameraHelper propery
  onChangeshowCameraHelper = (showCameraHelper) => {
    ;(this.props.editor as any).setPropertySelected('showCameraHelper', showCameraHelper)
  }

  // renders editor view, provides inputs to customize properties of DirectionalLight element.
  render() {
    DirectionalLightNodeEditor.description = this.props.t('editor:properties.directionalLight.description')
    const { node, editor } = this.props as any
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={DirectionalLightNodeEditor.description}
      >
        {/* @ts-ignore */}
        <InputGroup name="Color" label={this.props.t('editor:properties.directionalLight.lbl-color')}>
          {/* @ts-ignore */}
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        {/* @ts-ignore */}
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
        <LightShadowProperties node={node} editor={editor} />
        {/* @ts-ignore */}
        <InputGroup
          name="Camera Debugger"
          label={this.props.t('editor:properties.directionalLight.lbl-showCameraHelper')}
        >
          <BooleanInput value={(node as any).showCameraHelper} onChange={this.onChangeshowCameraHelper} />
        </InputGroup>
        {/* @ts-ignore */}
        <NumericInputGroup
          name="CameraNear"
          label={this.props.t('editor:properties.directionalLight.lbl-cameraNear')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={node.cameraNear}
          onChange={this.onChangeCameraNear}
        />
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
        <NumericInputGroup
          name="CameraTop"
          label={this.props.t('editor:properties.directionalLight.lbl-cameraTop')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={node.cameraTop}
          onChange={this.onChangeCameraTop}
        />
        {/* @ts-ignore */}
        <NumericInputGroup
          name="CameraBottom"
          label={this.props.t('editor:properties.directionalLight.lbl-cameraBottom')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={node.cameraBottom}
          onChange={this.onChangeCameraBottom}
        />
        {/* @ts-ignore */}
        <NumericInputGroup
          name="CameraLeft"
          label={this.props.t('editor:properties.directionalLight.lbl-cameraLeft')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={node.cameraLeft}
          onChange={this.onChangeCameraLeft}
        />
        {/* @ts-ignore */}
        <NumericInputGroup
          name="CameraRight"
          label={this.props.t('editor:properties.directionalLight.lbl-cameraRight')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={node.cameraRight}
          onChange={this.onChangeCameraRight}
        />
      </NodeEditor>
    )
  }
}

export default withTranslation()(DirectionalLightNodeEditor)
