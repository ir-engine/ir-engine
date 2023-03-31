import React from 'react'
import { useTranslation } from 'react-i18next'

import { StaticResourceService } from '@etherealengine/client-core/src/media/services/StaticResourceService'
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

  const updateResources = async (path: string) => {
    let media
    clearErrors(entity, ImageComponent)
    try {
      media = await StaticResourceService.uploadImage(path)
    } catch (err) {
      console.log('Error getting path', path)
      addError(entity, ImageComponent, 'INVALID_URL', path)
      return {}
    }
    updateProperty(ImageComponent, 'resource')(media)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.image.name')}
      description={t('editor:properties.image.description')}
    >
      <InputGroup name="Image Url" label={t('editor:properties.image.lbl-imgURL')}>
        <ImageInput
          value={
            imageComponent.resource?.value?.jpegStaticResource?.LOD0_url ||
            imageComponent.resource?.value?.ktx2StaticResource?.LOD0_url ||
            imageComponent.resource?.value?.pngStaticResource?.LOD0_url ||
            imageComponent.resource?.value?.gifStaticResource?.LOD0_url ||
            imageComponent.source?.value ||
            ''
          }
          onChange={updateResources}
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
