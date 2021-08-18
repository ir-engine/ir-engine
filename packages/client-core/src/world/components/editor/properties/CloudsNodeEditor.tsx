import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NodeEditor from '@xrengine/client-core/src/world/components/editor/properties/NodeEditor'
import InputGroup from '@xrengine/client-core/src/world/components/editor/inputs/InputGroup'
import ImageInput from '@xrengine/client-core/src/world/components/editor/inputs/ImageInput'
import Vector3Input from '@xrengine/client-core/src/world/components/editor/inputs/Vector3Input'
import Vector2Input from '@xrengine/client-core/src/world/components/editor/inputs/Vector2Input'
import { Cloud } from '@styled-icons/fa-solid/Cloud'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import ColorInput from '@xrengine/client-core/src/world/components/editor/inputs/ColorInput'

//declaring properties for CloudsNodeEditor
type CloudsNodeEditorProps = {
  editor: any
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
  // declairing propTypes for CloudsNodeEditor
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  }

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
      this.props.editor.setPropertySelected(name, value)
    }
  }

  //rendering view
  render() {
    CloudsNodeEditor.description = this.props.t('editor:properties.clouds.description')
    return (
      <NodeEditor {...this.props} description={CloudsNodeEditor.description}>
        {/* @ts-ignore */}
        <InputGroup name="Image" label={this.props.t('editor:properties.clouds.lbl-image')}>
          <ImageInput value={this.props.node.texture} onChange={this.onChangeProperty('texture')} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="World Scale" label={this.props.t('editor:properties.clouds.lbl-wroldScale')}>
          <Vector3Input
            value={this.props.node.worldScale}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeProperty('worldScale')}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Dimensions" label={this.props.t('editor:properties.clouds.lbl-dimensions')}>
          <Vector3Input
            value={this.props.node.dimensions}
            smallStep={1}
            mediumStep={1}
            largeStep={1}
            onChange={this.onChangeProperty('dimensions')}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Noise Zoom" label={this.props.t('editor:properties.clouds.lbl-noiseZoom')}>
          <Vector3Input
            value={this.props.node.noiseZoom}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeProperty('noiseZoom')}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Noise Offset" label={this.props.t('editor:properties.clouds.lbl-noiseOffset')}>
          <Vector3Input
            value={this.props.node.noiseOffset}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeProperty('noiseOffset')}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Sprite Scale" label={this.props.t('editor:properties.clouds.lbl-spriteScale')}>
          <Vector2Input value={this.props.node.spriteScaleRange} onChange={this.onChangeProperty('spriteScaleRange')} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Fog Color" label={this.props.t('editor:properties.clouds.lbl-fogColor')}>
          <ColorInput value={this.props.node.fogColor} onChange={this.onChangeProperty('fogColor')} disabled={false} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Fog Range" label={this.props.t('editor:properties.clouds.lbl-fogRange')}>
          <Vector2Input value={this.props.node.fogRange} onChange={this.onChangeProperty('fogRange')} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(CloudsNodeEditor)
