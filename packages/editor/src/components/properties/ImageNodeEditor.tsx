/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'

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
        <ImageInput value={imageComponent.source.value ?? ''} onChange={updateProperty(ImageComponent, 'source')} />
      </InputGroup>
      {errors ? (
        Object.entries(errors).map(([err, message]) => (
          <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
            {'Error: ' + err + '--' + message}
          </div>
        ))
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
