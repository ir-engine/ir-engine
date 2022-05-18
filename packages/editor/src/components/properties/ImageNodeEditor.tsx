import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import { EditorComponentType, updateProperty } from './Util'
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'
import { useTranslation } from 'react-i18next'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import ImageSourceProperties from './ImageSourceProperties'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'

export const ImageNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const engineState = useEngineState()
  const imageComponent = getComponent(entity, ImageComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.image.name')}
      description={t('editor:properties.image.description')}
    >
      {!hasComponent(entity, VideoComponent) && (
        <InputGroup name="Image Url" label={t('editor:properties.image.lbl-imgURL')}>
          <ImageInput value={imageComponent.imageSource} onChange={updateProperty(ImageComponent, 'imageSource')} />
          {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.image.error-url')}</div>}
        </InputGroup>
      )}
      <ImageSourceProperties node={props.node} multiEdit={props.multiEdit} />
    </NodeEditor>
  )
}

ImageNodeEditor.iconComponent = PhotoSizeSelectActualIcon

export default ImageNodeEditor
