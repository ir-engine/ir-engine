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
import { BackSide, DoubleSide, FrontSide } from 'three'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { ImageAlphaMode, ImageProjection } from '@etherealengine/engine/src/scene/classes/ImageUtils'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'

import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import { EditorComponentType, updateProperty } from './Util'

const mapValue = (v) => ({ label: v, value: v })
const imageProjectionOptions = Object.values(ImageProjection).map(mapValue)
const imageTransparencyOptions = Object.values(ImageAlphaMode).map(mapValue)

const ImageProjectionSideOptions = [
  { label: 'Front', value: FrontSide },
  { label: 'Back', value: BackSide },
  { label: 'Both', value: DoubleSide }
]

export const ImageSourceProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const imageComponent = useComponent(props.entity, ImageComponent)

  return (
    <>
      <InputGroup
        name="Transparency Mode"
        label={t('editor:properties.image.lbl-transparency')}
        info={
          <>
            <span>{t('editor:properties.image.info-transparency')}</span>
            <br />
            <span>{t('editor:properties.image.info-opaque')}</span>
            <br />
            <span>{t('editor:properties.image.info-blend')}</span>
            <br />
            <span>{t('editor:properties.image.info-mask')}</span>
            <br />
          </>
        }
      >
        <SelectInput
          key={props.entity}
          options={imageTransparencyOptions}
          value={imageComponent.alphaMode.value}
          onChange={updateProperty(ImageComponent, 'alphaMode')}
        />
      </InputGroup>
      {imageComponent.alphaMode.value === ImageAlphaMode.Mask && (
        <NumericInputGroup
          name="Alpha Cutoff"
          label={t('editor:properties.image.lbl-alphaCutoff')}
          info={t('editor:properties.image.info-alphaCutoff')}
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          value={imageComponent.alphaCutoff.value}
          onChange={updateProperty(ImageComponent, 'alphaCutoff')}
        />
      )}
      <InputGroup name="Projection" label={t('editor:properties.image.lbl-projection')}>
        <SelectInput
          key={props.entity}
          options={imageProjectionOptions}
          value={imageComponent.projection.value}
          onChange={updateProperty(ImageComponent, 'projection')}
        />
      </InputGroup>
      <InputGroup name="Side" label={t('editor:properties.image.lbl-side')}>
        <SelectInput
          key={props.entity}
          options={ImageProjectionSideOptions}
          value={imageComponent.side.value}
          onChange={updateProperty(ImageComponent, 'side')}
        />
      </InputGroup>
    </>
  )
}

export default ImageSourceProperties
