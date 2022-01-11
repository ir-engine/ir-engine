import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import { EditorComponentType, updateProperty } from './Util'
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'
import { useTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import ImageSourceProperties from './ImageSourceProperties'

export const ImageNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const imageComponent = getComponent(props.node.entity, ImageComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.image.name')}
      description={t('editor:properties.image.description')}
    >
      <InputGroup name="Image Url" label={t('editor:properties.image.lbl-imgURL')}>
        <ImageInput value={imageComponent.imageSource} onChange={updateProperty(ImageComponent, 'imageSource')} />
      </InputGroup>
      <ImageSourceProperties node={props.node} multiEdit={props.multiEdit} />
    </NodeEditor>
  )
}

ImageNodeEditor.iconComponent = PhotoSizeSelectActualIcon

export default ImageNodeEditor
