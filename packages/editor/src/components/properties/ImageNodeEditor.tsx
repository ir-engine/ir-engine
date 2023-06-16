import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { addError, clearErrors } from '@etherealengine/engine/src/scene/functions/ErrorFunctions'

import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'

import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import ImageSourceProperties from './ImageSourceProperties'
import NodeEditor from './NodeEditor'
import ScreenshareTargetNodeEditor from './ScreenshareTargetNodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const ImageNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const imageComponent = useComponent(entity, ImageComponent)
  const errors = getEntityErrors(props.entity, ImageComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.image.name')}
      description={t('editor:properties.image.description')}
    >
      <InputGroup name="Image Url" label={t('editor:properties.image.lbl-imgURL')}>
        <ImageInput
          value={
            imageComponent.resource?.value?.jpegStaticResource?.url ||
            imageComponent.resource?.value?.ktx2StaticResource?.url ||
            imageComponent.resource?.value?.pngStaticResource?.url ||
            imageComponent.resource?.value?.gifStaticResource?.url ||
            imageComponent.source?.value ||
            ''
          }
          onChange={updateProperty(ImageComponent, 'source')}
        />
      </InputGroup>
      {errors ? (
        Object.entries(errors).map(([err, message]) => {
          return <div style={{ marginTop: 2, color: '#FF8C00' }}>{'Error: ' + err + '--' + message}</div>
        })
      ) : (
        <></>
      )}
      <ImageSourceProperties entity={props.entity} multiEdit={props.multiEdit} />
      <ScreenshareTargetNodeEditor entity={props.entity} multiEdit={props.multiEdit} />
    </NodeEditor>
  )
}

ImageNodeEditor.iconComponent = PhotoSizeSelectActualIcon

export default ImageNodeEditor
