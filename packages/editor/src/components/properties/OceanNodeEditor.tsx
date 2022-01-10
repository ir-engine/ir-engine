import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector2Input from '../inputs/Vector2Input'
import { useTranslation } from 'react-i18next'
import ColorInput from '../inputs/ColorInput'
import WaterIcon from '@mui/icons-material/Water'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { OceanComponent } from '@xrengine/engine/src/scene/components/OceanComponent'
import { EditorComponentType, updateProperty } from './Util'

/**
 * Ocean Editor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const OceanNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const oceanComponent = getComponent(props.node.entity, OceanComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.ocean.name')}
      description={t('editor:properties.ocean.description')}
    >
      <InputGroup name="Normal Map" label={t('editor:properties.ocean.lbl-normalMap')}>
        <ImageInput value={oceanComponent.normalMap} onChange={updateProperty(OceanComponent, 'normalMap')} />
      </InputGroup>

      <InputGroup name="Distortion Map" label={t('editor:properties.ocean.lbl-distortionMap')}>
        <ImageInput value={oceanComponent.distortionMap} onChange={updateProperty(OceanComponent, 'distortionMap')} />
      </InputGroup>

      <InputGroup name="Environment Map" label={t('editor:properties.ocean.lbl-envMap')}>
        <ImageInput value={oceanComponent.envMap} onChange={updateProperty(OceanComponent, 'envMap')} />
      </InputGroup>

      <InputGroup name="Color" label={t('editor:properties.ocean.lbl-color')}>
        <ColorInput value={oceanComponent.color} onChange={updateProperty(OceanComponent, 'color')} disabled={false} />
      </InputGroup>
      <InputGroup name="Shallow Color" label={t('editor:properties.ocean.lbl-shallowWaterColor')}>
        <ColorInput
          value={oceanComponent.shallowWaterColor}
          onChange={updateProperty(OceanComponent, 'shallowWaterColor')}
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
        value={oceanComponent.shallowToDeepDistance}
        onChange={updateProperty(OceanComponent, 'shallowToDeepDistance')}
      />
      <NumericInputGroup
        name="Opacity Fade Distance"
        label={t('editor:properties.ocean.lbl-opacityFadeDistance')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.opacityFadeDistance}
        onChange={updateProperty(OceanComponent, 'opacityFadeDistance')}
      />
      <InputGroup name="Opacity Range" label={t('editor:properties.ocean.lbl-opacityRange')}>
        <Vector2Input value={oceanComponent.opacityRange} onChange={updateProperty(OceanComponent, 'opacityRange')} />
      </InputGroup>
      <NumericInputGroup
        name="Shininess"
        label={t('editor:properties.ocean.lbl-shininess')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1.0}
        value={oceanComponent.shininess}
        onChange={updateProperty(OceanComponent, 'shininess')}
      />
      <NumericInputGroup
        name="Reflectivity"
        label={t('editor:properties.ocean.lbl-reflectivity')}
        min={0}
        max={1}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.reflectivity}
        onChange={updateProperty(OceanComponent, 'reflectivity')}
      />
      <InputGroup name="Foam Color" label={t('editor:properties.ocean.lbl-foamColor')}>
        <ColorInput
          value={oceanComponent.foamColor}
          onChange={updateProperty(OceanComponent, 'foamColor')}
          disabled={false}
        />
      </InputGroup>
      <InputGroup name="Foam Speed" label={t('editor:properties.ocean.lbl-foamSpeed')}>
        <Vector2Input value={oceanComponent.foamSpeed} onChange={updateProperty(OceanComponent, 'foamSpeed')} />
      </InputGroup>
      <NumericInputGroup
        name="Foam Tiling"
        label={t('editor:properties.ocean.lbl-foamTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.foamTiling}
        onChange={updateProperty(OceanComponent, 'foamTiling')}
      />
      <InputGroup name="Big Wave Tiling" label={t('editor:properties.ocean.lbl-bigWaveTiling')}>
        <Vector2Input value={oceanComponent.bigWaveTiling} onChange={updateProperty(OceanComponent, 'bigWaveTiling')} />
      </InputGroup>
      <InputGroup name="Big Wave Speed" label={t('editor:properties.ocean.lbl-bigWaveSpeed')}>
        <Vector2Input value={oceanComponent.bigWaveSpeed} onChange={updateProperty(OceanComponent, 'bigWaveSpeed')} />
      </InputGroup>
      <NumericInputGroup
        name="Big Wave Height"
        label={t('editor:properties.ocean.lbl-bigWaveHeight')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.bigWaveHeight}
        onChange={updateProperty(OceanComponent, 'bigWaveHeight')}
      />
      <InputGroup name="Wave Speed" label={t('editor:properties.ocean.lbl-waveSpeed')}>
        <Vector2Input value={oceanComponent.waveSpeed} onChange={updateProperty(OceanComponent, 'waveSpeed')} />
      </InputGroup>
      <InputGroup name="Wave Scale" label={t('editor:properties.ocean.lbl-waveScale')}>
        <Vector2Input value={oceanComponent.waveScale} onChange={updateProperty(OceanComponent, 'waveScale')} />
      </InputGroup>
      <NumericInputGroup
        name="Wave Tiling"
        label={t('editor:properties.ocean.lbl-waveTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.waveTiling}
        onChange={updateProperty(OceanComponent, 'waveTiling')}
      />
      <InputGroup name="Wave Distortion Speed" label={t('editor:properties.ocean.lbl-waveDistortionSpeed')}>
        <Vector2Input
          value={oceanComponent.waveDistortionSpeed}
          onChange={updateProperty(OceanComponent, 'waveDistortionSpeed')}
        />
      </InputGroup>
      <NumericInputGroup
        name="Wave Distortion Tiling"
        label={t('editor:properties.ocean.lbl-waveDistortionTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={oceanComponent.waveDistortionTiling}
        onChange={updateProperty(OceanComponent, 'waveDistortionTiling')}
      />
    </NodeEditor>
  )
}

OceanNodeEditor.iconComponent = WaterIcon

export default OceanNodeEditor
