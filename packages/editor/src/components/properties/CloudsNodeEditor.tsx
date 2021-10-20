import React, { Component } from 'react'
import NodeEditor from '../properties/NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector3Input from '../inputs/Vector3Input'
import Vector2Input from '../inputs/Vector2Input'
import { Cloud } from '@styled-icons/fa-solid/Cloud'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import ColorInput from '../inputs/ColorInput'
import { CommandManager } from '../../managers/CommandManager'

//declaring properties for CloudsNodeEditor
type CloudsNodeEditorProps = {
  node: any
  t: Function
}

/**
 * CloudsNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class CloudsNodeEditor extends Component<CloudsNodeEditorProps> {
  constructor(props: CloudsNodeEditorProps) {
    super(props)
    this.props = props
  }

  //setting iconComponent name
  static iconComponent = Cloud

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.clouds.description')

  declare props: CloudsNodeEditorProps

  onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  //rendering view
  render() {
    CloudsNodeEditor.description = this.props.t('editor:properties.clouds.description')
    return (
      <NodeEditor {...this.props} description={CloudsNodeEditor.description}>
        <InputGroup name="Image" label={this.props.t('editor:properties.clouds.lbl-image')}>
          <ImageInput value={this.props.node.texture} onChange={this.onChangeProperty('texture')} />
        </InputGroup>

        <InputGroup name="World Scale" label={this.props.t('editor:properties.clouds.lbl-wroldScale')}>
          <Vector3Input
            value={this.props.node.worldScale}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeProperty('worldScale')}
          />
        </InputGroup>

        <InputGroup name="Dimensions" label={this.props.t('editor:properties.clouds.lbl-dimensions')}>
          <Vector3Input
            value={this.props.node.dimensions}
            smallStep={1}
            mediumStep={1}
            largeStep={1}
            onChange={this.onChangeProperty('dimensions')}
          />
        </InputGroup>

        <InputGroup name="Noise Zoom" label={this.props.t('editor:properties.clouds.lbl-noiseZoom')}>
          <Vector3Input
            value={this.props.node.noiseZoom}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeProperty('noiseZoom')}
          />
        </InputGroup>

        <InputGroup name="Noise Offset" label={this.props.t('editor:properties.clouds.lbl-noiseOffset')}>
          <Vector3Input
            value={this.props.node.noiseOffset}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeProperty('noiseOffset')}
          />
        </InputGroup>

        <InputGroup name="Sprite Scale" label={this.props.t('editor:properties.clouds.lbl-spriteScale')}>
          <Vector2Input value={this.props.node.spriteScaleRange} onChange={this.onChangeProperty('spriteScaleRange')} />
        </InputGroup>

        <InputGroup name="Fog Color" label={this.props.t('editor:properties.clouds.lbl-fogColor')}>
          <ColorInput value={this.props.node.fogColor} onChange={this.onChangeProperty('fogColor')} disabled={false} />
        </InputGroup>

        <InputGroup name="Fog Range" label={this.props.t('editor:properties.clouds.lbl-fogRange')}>
          <Vector2Input value={this.props.node.fogRange} onChange={this.onChangeProperty('fogRange')} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(CloudsNodeEditor)
