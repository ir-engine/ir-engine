import React from 'react'
import { FrontSide, BackSide, DoubleSide } from 'three'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { ImageProjection, ImageAlphaMode } from '@xrengine/engine/src/scene/classes/ImageUtils'
import { EditorComponentType, updateProperty } from './Util'
import { useTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'

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

  const imageComponent = getComponent(props.node.entity, ImageComponent)

  return (
    <>
      <InputGroup
        name="Transparency Mode"
        label={t('editor:properties.image.lbl-transparency')}
        info={t('editor:properties.image.info-transparency')}
      >
        <SelectInput
          options={imageTransparencyOptions}
          value={imageComponent.alphaMode}
          onChange={(v) => updateProperty(ImageComponent, 'alphaMode', v)}
        />
      </InputGroup>
      {imageComponent.alphaMode === ImageAlphaMode.Mask && (
        <NumericInputGroup
          name="Alpha Cutoff"
          label={t('editor:properties.image.lbl-alphaCutoff')}
          info={t('editor:properties.image.info-alphaCutoff')}
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          value={imageComponent.alphaCutoff}
          onChange={(v) => updateProperty(ImageComponent, 'alphaCutoff', v)}
        />
      )}
      <InputGroup name="Projection" label={t('editor:properties.image.lbl-projection')}>
        <SelectInput
          options={imageProjectionOptions}
          value={imageComponent.projection}
          onChange={(v) => updateProperty(ImageComponent, 'projection', v)}
        />
      </InputGroup>
      <InputGroup name="Side" label={t('editor:properties.image.lbl-side')}>
        <SelectInput
          options={ImageProjectionSideOptions}
          value={imageComponent.side}
          onChange={(v) => updateProperty(ImageComponent, 'side', v)}
        />
      </InputGroup>
    </>
  )
}

export default ImageSourceProperties
