import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent, useOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { CloudComponent } from '@etherealengine/engine/src/scene/components/CloudComponent'
import { ErrorComponent } from '@etherealengine/engine/src/scene/components/ErrorComponent'

import CloudIcon from '@mui/icons-material/Cloud'

import ColorInput from '../inputs/ColorInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import Vector2Input from '../inputs/Vector2Input'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * Clouds Editor provides the editor to customize properties.
 *
 * @type {class component}
 */
export const CloudsNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const cloudComponent = useComponent(props.entity, CloudComponent)
  const hasError = !!useOptionalComponent(props.entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.clouds.name')}
      description={t('editor:properties.clouds.description')}
    >
      <InputGroup name="Image" label={t('editor:properties.clouds.lbl-image')}>
        <ImageInput value={cloudComponent.texture.value} onChange={updateProperty(CloudComponent, 'texture')} />
        {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.clouds.error-url')}</div>}
      </InputGroup>

      <InputGroup name="World Scale" label={t('editor:properties.clouds.lbl-wroldScale')}>
        <Vector3Input
          value={cloudComponent.worldScale.value}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'worldScale')}
        />
      </InputGroup>

      <InputGroup name="Dimensions" label={t('editor:properties.clouds.lbl-dimensions')}>
        <Vector3Input
          value={cloudComponent.dimensions.value}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'dimensions')}
        />
      </InputGroup>

      <InputGroup name="Noise Zoom" label={t('editor:properties.clouds.lbl-noiseZoom')}>
        <Vector3Input
          value={cloudComponent.noiseZoom.value}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'noiseZoom')}
        />
      </InputGroup>

      <InputGroup name="Noise Offset" label={t('editor:properties.clouds.lbl-noiseOffset')}>
        <Vector3Input
          value={cloudComponent.noiseOffset.value}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'noiseOffset')}
        />
      </InputGroup>

      <InputGroup name="Sprite Scale" label={t('editor:properties.clouds.lbl-spriteScale')}>
        <Vector2Input
          value={cloudComponent.spriteScaleRange.value}
          onChange={updateProperty(CloudComponent, 'spriteScaleRange')}
        />
      </InputGroup>

      <InputGroup name="Fog Color" label={t('editor:properties.clouds.lbl-fogColor')}>
        <ColorInput value={cloudComponent?.fogColor.value} onChange={updateProperty(CloudComponent, 'fogColor')} />
      </InputGroup>

      <InputGroup name="Fog Range" label={t('editor:properties.clouds.lbl-fogRange')}>
        <Vector2Input
          value={cloudComponent.fogRange.value}
          onChange={updateProperty(CloudComponent, 'fogRange')}
          hideLabels
        />
      </InputGroup>
    </NodeEditor>
  )
}

CloudsNodeEditor.iconComponent = CloudIcon

export default CloudsNodeEditor
