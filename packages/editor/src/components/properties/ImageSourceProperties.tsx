import React from 'react'
import { useTranslation } from 'react-i18next'
import { BackSide, DoubleSide, FrontSide } from 'three'

import { getComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
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
