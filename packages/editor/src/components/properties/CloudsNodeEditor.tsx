import React from 'react'
import { useTranslation } from 'react-i18next'

import CloudIcon from '@mui/icons-material/Cloud'

import { CommandManager } from '../../managers/CommandManager'
import ColorInput from '../inputs/ColorInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import Vector2Input from '../inputs/Vector2Input'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from '../properties/NodeEditor'

//declaring properties for CloudsNodeEditor
type CloudsNodeEditorProps = {
  node: any
}

/**
 * CloudsNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const CloudsNodeEditor = (props: CloudsNodeEditorProps) => {
  const { t } = useTranslation()

  const onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.clouds.description')}>
      <InputGroup name="Image" label={t('editor:properties.clouds.lbl-image')}>
        <ImageInput value={props.node.texture} onChange={onChangeProperty('texture')} />
      </InputGroup>

      <InputGroup name="World Scale" label={t('editor:properties.clouds.lbl-wroldScale')}>
        <Vector3Input
          value={props.node.worldScale}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeProperty('worldScale')}
        />
      </InputGroup>

      <InputGroup name="Dimensions" label={t('editor:properties.clouds.lbl-dimensions')}>
        <Vector3Input
          value={props.node.dimensions}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          onChange={onChangeProperty('dimensions')}
        />
      </InputGroup>

      <InputGroup name="Noise Zoom" label={t('editor:properties.clouds.lbl-noiseZoom')}>
        <Vector3Input
          value={props.node.noiseZoom}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeProperty('noiseZoom')}
        />
      </InputGroup>

      <InputGroup name="Noise Offset" label={t('editor:properties.clouds.lbl-noiseOffset')}>
        <Vector3Input
          value={props.node.noiseOffset}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeProperty('noiseOffset')}
        />
      </InputGroup>

      <InputGroup name="Sprite Scale" label={t('editor:properties.clouds.lbl-spriteScale')}>
        <Vector2Input value={props.node.spriteScaleRange} onChange={onChangeProperty('spriteScaleRange')} />
      </InputGroup>

      <InputGroup name="Fog Color" label={t('editor:properties.clouds.lbl-fogColor')}>
        <ColorInput value={props.node.fogColor} onChange={onChangeProperty('fogColor')} disabled={false} />
      </InputGroup>

      <InputGroup name="Fog Range" label={t('editor:properties.clouds.lbl-fogRange')}>
        <Vector2Input value={props.node.fogRange} onChange={onChangeProperty('fogRange')} />
      </InputGroup>
    </NodeEditor>
  )
}

CloudsNodeEditor.iconComponent = CloudIcon

export default CloudsNodeEditor
