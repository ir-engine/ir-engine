import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector3Input from '../inputs/Vector3Input'
import Vector2Input from '../inputs/Vector2Input'
import { useTranslation } from 'react-i18next'
import ColorInput from '../inputs/ColorInput'
import CloudIcon from '@mui/icons-material/Cloud'
import { EditorComponentType, updateProperty } from './Util'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CloudComponent } from '@xrengine/engine/src/scene/components/CloudComponent'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'

/**
 * Clouds Editor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const CloudsNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const cloudComponent = getComponent(props.node.entity, CloudComponent)
  const hasError = engineState.errorEntities[props.node.entity].get() || hasComponent(props.node.entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.clouds.name')}
      description={t('editor:properties.clouds.description')}
    >
      <InputGroup name="Image" label={t('editor:properties.clouds.lbl-image')}>
        <ImageInput value={cloudComponent.texture} onChange={updateProperty(CloudComponent, 'texture')} />
        {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.clouds.error-url')}</div>}
      </InputGroup>

      <InputGroup name="World Scale" label={t('editor:properties.clouds.lbl-wroldScale')}>
        <Vector3Input
          value={cloudComponent.worldScale}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'worldScale')}
        />
      </InputGroup>

      <InputGroup name="Dimensions" label={t('editor:properties.clouds.lbl-dimensions')}>
        <Vector3Input
          value={cloudComponent.dimensions}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'dimensions')}
        />
      </InputGroup>

      <InputGroup name="Noise Zoom" label={t('editor:properties.clouds.lbl-noiseZoom')}>
        <Vector3Input
          value={cloudComponent.noiseZoom}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'noiseZoom')}
        />
      </InputGroup>

      <InputGroup name="Noise Offset" label={t('editor:properties.clouds.lbl-noiseOffset')}>
        <Vector3Input
          value={cloudComponent.noiseOffset}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(CloudComponent, 'noiseOffset')}
        />
      </InputGroup>

      <InputGroup name="Sprite Scale" label={t('editor:properties.clouds.lbl-spriteScale')}>
        <Vector2Input
          value={cloudComponent.spriteScaleRange}
          onChange={updateProperty(CloudComponent, 'spriteScaleRange')}
        />
      </InputGroup>

      <InputGroup name="Fog Color" label={t('editor:properties.clouds.lbl-fogColor')}>
        <ColorInput value={cloudComponent.fogColor} onChange={updateProperty(CloudComponent, 'fogColor')} />
      </InputGroup>

      <InputGroup name="Fog Range" label={t('editor:properties.clouds.lbl-fogRange')}>
        <Vector2Input value={cloudComponent.fogRange} onChange={updateProperty(CloudComponent, 'fogRange')} />
      </InputGroup>
    </NodeEditor>
  )
}

CloudsNodeEditor.iconComponent = CloudIcon

export default CloudsNodeEditor
