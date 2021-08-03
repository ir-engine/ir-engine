import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector3Input from '../inputs/Vector3Input'
import Vector2Input from '../inputs/Vector2Input'
import * as EasingFunctions from '@xrengine/engine/src/common/functions/EasingFunctions'
import { Cloud } from '@styled-icons/fa-solid/Cloud'
import { camelPad } from '@xrengine/engine/src/editor/functions/utils'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import ColorInput from '../inputs/ColorInput'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

//declaring properties for ParticleEmitterNodeEditor
type CloudNodeEditorProps = {
  editor: any
  node: any
  t: Function
}

/**
 * ParticleEmitterNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class CloudNodeEditor extends Component<CloudNodeEditorProps> {
  // declairing propTypes for ParticleEmitterNodeEditor
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  }

  constructor(props: CloudNodeEditorProps) {
    super(props)
    this.props = props
  }

  //setting iconComponent name
  static iconComponent = Cloud

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.clouds.description')

  declare props: CloudNodeEditorProps

  //function used to reflect the change in any property of ParticleEmitterNodeEditor
  updateParticles() {
    for (const node of this.props.editor.selected) {
      node.updateParticles()
    }
  }

  onChangeSrc = (src) => {
    this.props.editor.setPropertySelected('src', src)
  }

  onChangeWorldScale = (worldScale) => {
    this.props.editor.setPropertySelected('worldScale', worldScale)
    this.updateParticles()
  }

  onChangeDimensions = (dimensions) => {
    this.props.editor.setPropertySelected('dimensions', dimensions)
    this.updateParticles()
  }

  onChangeNoiseZoom = (noiseZoom) => {
    this.props.editor.setPropertySelected('noiseZoom', noiseZoom)
    this.updateParticles()
  }

  onChangeNoiseOffset = (noiseOffset) => {
    this.props.editor.setPropertySelected('noiseOffset', noiseOffset)
    this.updateParticles()
  }

  onChangeSpriteScaleRange = (spriteScaleRange) => {
    this.props.editor.setPropertySelected('spriteScaleRange', spriteScaleRange)
    this.updateParticles()
  }

  onChangeFogColor = (fogColor) => {
    this.props.editor.setPropertySelected('fogColor', fogColor)
    this.updateParticles()
  }

  onChangeFogRange = (fogRange) => {
    this.props.editor.setPropertySelected('fogRange', fogRange)
    this.updateParticles()
  }

  //rendering view for ParticleEmitterNodeEditor
  render() {
    CloudNodeEditor.description = this.props.t('editor:properties.clouds.description')
    return (
      <NodeEditor {...this.props} description={CloudNodeEditor.description}>
        {/* @ts-ignore */}
        <InputGroup name="Image" label={this.props.t('editor:properties.clouds.lbl-image')}>
          <ImageInput value={this.props.node.src} onChange={this.onChangeSrc} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="World Scale" label={this.props.t('editor:properties.clouds.lbl-wroldScale')}>
          <Vector3Input
            value={this.props.node.worldScale}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeWorldScale}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Dimensions" label={this.props.t('editor:properties.clouds.lbl-dimensions')}>
          <Vector3Input
            value={this.props.node.dimensions}
            smallStep={1}
            mediumStep={1}
            largeStep={1}
            onChange={this.onChangeDimensions}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Noise Zoom" label={this.props.t('editor:properties.clouds.lbl-noiseZoom')}>
          <Vector3Input
            value={this.props.node.noiseZoom}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeNoiseZoom}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Noise Offset" label={this.props.t('editor:properties.clouds.lbl-noiseOffset')}>
          <Vector3Input
            value={this.props.node.noiseOffset}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeNoiseOffset}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Sprite Scale" label={this.props.t('editor:properties.clouds.lbl-spriteScale')}>
          <Vector2Input value={this.props.node.spriteScaleRange} onChange={this.onChangeSpriteScaleRange} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Fog Color" label={this.props.t('editor:properties.clouds.lbl-fogColor')}>
          <ColorInput value={this.props.node.fogColor} onChange={this.onChangeFogColor} disabled={false} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Fog Range" label={this.props.t('editor:properties.clouds.lbl-fogRange')}>
          <Vector2Input value={this.props.node.fogRange} onChange={this.onChangeFogRange} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(CloudNodeEditor)
