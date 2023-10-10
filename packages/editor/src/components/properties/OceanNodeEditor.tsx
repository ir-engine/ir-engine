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

import { getComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { OceanComponent } from '@etherealengine/engine/src/scene/components/OceanComponent'

import WaterIcon from '@mui/icons-material/Water'

import ColorInput from '../inputs/ColorInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import Vector2Input from '../inputs/Vector2Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperty, updateProperty } from './Util'

/**
 * Ocean Editor provides the editor to customize properties.
 *
 * @type {class component}
 */
export const OceanNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const entity = props.entity
  const oceanComponent = useComponent(entity, OceanComponent)
  const errorComponent = getComponent(entity, ErrorComponent)
  const oceanErrors = errorComponent[OceanComponent.name]

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.ocean.name')}
      description={t('editor:properties.ocean.description')}
    >
      <InputGroup name="Normal Map" label={t('editor:properties.ocean.lbl-normalMap')}>
        <ImageInput value={oceanComponent.normalMap.value} onChange={updateProperty(OceanComponent, 'normalMap')} />
        {oceanErrors.normalMapError && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.ocean.error-url')}</div>
        )}
      </InputGroup>

      <InputGroup name="Distortion Map" label={t('editor:properties.ocean.lbl-distortionMap')}>
        <ImageInput
          value={oceanComponent.distortionMap.value}
          onChange={updateProperty(OceanComponent, 'distortionMap')}
        />
        {oceanErrors.distortionMapError && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.ocean.error-url')}</div>
        )}
      </InputGroup>

      <InputGroup name="Environment Map" label={t('editor:properties.ocean.lbl-envMap')}>
        <ImageInput value={oceanComponent.envMap.value} onChange={updateProperty(OceanComponent, 'envMap')} />
        {oceanErrors.envMapError && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.ocean.error-url')}</div>
        )}
      </InputGroup>

      <InputGroup name="Color" label={t('editor:properties.ocean.lbl-color')}>
        <ColorInput
          value={oceanComponent.color.value}
          onChange={updateProperty(OceanComponent, 'color')}
          onRelease={commitProperty(OceanComponent, 'color')}
          disabled={false}
        />
      </InputGroup>
      <InputGroup name="Shallow Color" label={t('editor:properties.ocean.lbl-shallowWaterColor')}>
        <ColorInput
          value={oceanComponent.shallowWaterColor.value}
          onChange={updateProperty(OceanComponent, 'shallowWaterColor')}
          onRelease={commitProperty(OceanComponent, 'shallowWaterColor')}
          disabled={false}
        />
      </InputGroup>
      <NumericInputGroup
        name="Shallow to Deep Distance"
        label={t('editor:properties.ocean.lbl-shallowToDeepDistance')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.shallowToDeepDistance.value}
        onChange={updateProperty(OceanComponent, 'shallowToDeepDistance')}
        onRelease={commitProperty(OceanComponent, 'shallowToDeepDistance')}
      />
      <NumericInputGroup
        name="Opacity Fade Distance"
        label={t('editor:properties.ocean.lbl-opacityFadeDistance')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.opacityFadeDistance.value}
        onChange={updateProperty(OceanComponent, 'opacityFadeDistance')}
        onRelease={commitProperty(OceanComponent, 'opacityFadeDistance')}
      />
      <InputGroup name="Opacity Range" label={t('editor:properties.ocean.lbl-opacityRange')}>
        <Vector2Input
          value={oceanComponent.opacityRange.value}
          onChange={updateProperty(OceanComponent, 'opacityRange')}
          onRelease={commitProperty(OceanComponent, 'opacityRange')}
          hideLabels
        />
      </InputGroup>
      <NumericInputGroup
        name="Shininess"
        label={t('editor:properties.ocean.lbl-shininess')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1.0}
        value={oceanComponent.shininess.value}
        onChange={updateProperty(OceanComponent, 'shininess')}
        onRelease={commitProperty(OceanComponent, 'shininess')}
      />
      <NumericInputGroup
        name="Reflectivity"
        label={t('editor:properties.ocean.lbl-reflectivity')}
        min={0}
        max={1}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.reflectivity.value}
        onChange={updateProperty(OceanComponent, 'reflectivity')}
        onRelease={commitProperty(OceanComponent, 'reflectivity')}
      />
      <InputGroup name="Foam Color" label={t('editor:properties.ocean.lbl-foamColor')}>
        <ColorInput
          value={oceanComponent.foamColor.value}
          onChange={updateProperty(OceanComponent, 'foamColor')}
          onRelease={commitProperty(OceanComponent, 'foamColor')}
          disabled={false}
        />
      </InputGroup>
      <InputGroup name="Foam Speed" label={t('editor:properties.ocean.lbl-foamSpeed')}>
        <Vector2Input
          value={oceanComponent.foamSpeed.value}
          onChange={updateProperty(OceanComponent, 'foamSpeed')}
          onRelease={commitProperty(OceanComponent, 'foamSpeed')}
        />
      </InputGroup>
      <NumericInputGroup
        name="Foam Tiling"
        label={t('editor:properties.ocean.lbl-foamTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.foamTiling.value}
        onChange={updateProperty(OceanComponent, 'foamTiling')}
        onRelease={commitProperty(OceanComponent, 'foamTiling')}
      />
      <InputGroup name="Big Wave Tiling" label={t('editor:properties.ocean.lbl-bigWaveTiling')}>
        <Vector2Input
          value={oceanComponent.bigWaveTiling.value}
          onChange={updateProperty(OceanComponent, 'bigWaveTiling')}
          onRelease={commitProperty(OceanComponent, 'bigWaveTiling')}
        />
      </InputGroup>
      <InputGroup name="Big Wave Speed" label={t('editor:properties.ocean.lbl-bigWaveSpeed')}>
        <Vector2Input
          value={oceanComponent.bigWaveSpeed.value}
          onChange={updateProperty(OceanComponent, 'bigWaveSpeed')}
          onRelease={commitProperty(OceanComponent, 'bigWaveSpeed')}
        />
      </InputGroup>
      <NumericInputGroup
        name="Big Wave Height"
        label={t('editor:properties.ocean.lbl-bigWaveHeight')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.bigWaveHeight.value}
        onChange={updateProperty(OceanComponent, 'bigWaveHeight')}
        onRelease={commitProperty(OceanComponent, 'bigWaveHeight')}
      />
      <InputGroup name="Wave Speed" label={t('editor:properties.ocean.lbl-waveSpeed')}>
        <Vector2Input
          value={oceanComponent.waveSpeed.value}
          onChange={updateProperty(OceanComponent, 'waveSpeed')}
          onRelease={commitProperty(OceanComponent, 'waveSpeed')}
        />
      </InputGroup>
      <InputGroup name="Wave Scale" label={t('editor:properties.ocean.lbl-waveScale')}>
        <Vector2Input
          value={oceanComponent.waveScale.value}
          onChange={updateProperty(OceanComponent, 'waveScale')}
          onRelease={commitProperty(OceanComponent, 'waveScale')}
        />
      </InputGroup>
      <NumericInputGroup
        name="Wave Tiling"
        label={t('editor:properties.ocean.lbl-waveTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.waveTiling.value}
        onChange={updateProperty(OceanComponent, 'waveTiling')}
        onRelease={commitProperty(OceanComponent, 'waveTiling')}
      />
      <InputGroup name="Wave Distortion Speed" label={t('editor:properties.ocean.lbl-waveDistortionSpeed')}>
        <Vector2Input
          value={oceanComponent.waveDistortionSpeed.value}
          onChange={updateProperty(OceanComponent, 'waveDistortionSpeed')}
          onRelease={commitProperty(OceanComponent, 'waveDistortionSpeed')}
        />
      </InputGroup>
      <NumericInputGroup
        name="Wave Distortion Tiling"
        label={t('editor:properties.ocean.lbl-waveDistortionTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.waveDistortionTiling.value}
        onChange={updateProperty(OceanComponent, 'waveDistortionTiling')}
        onRelease={commitProperty(OceanComponent, 'waveDistortionTiling')}
      />
    </NodeEditor>
  )
}

OceanNodeEditor.iconComponent = WaterIcon

export default OceanNodeEditor
