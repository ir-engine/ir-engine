import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector2Input from '../inputs/Vector2Input'
import { Water } from '@styled-icons/fa-solid/Water'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'

//declaring properties for OceanNodeEditor
type OceanNodeEditorProps = {
  node: any
  t: Function
}

/**
 * OceanNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const OceanNodeEditor = (props: OceanNodeEditorProps) => {
  const onChangeProperty = (name) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  //rendering view for OceanNodeEditor
  return (
    <NodeEditor {...props} description={OceanNodeEditor.description}>
      <InputGroup name="Normal Map" label={props.t('editor:properties.ocean.lbl-normalMap')}>
        <ImageInput value={props.node.normalMap} onChange={onChangeProperty('normalMap')} />
      </InputGroup>

      <InputGroup name="Distortion Map" label={props.t('editor:properties.ocean.lbl-distortionMap')}>
        <ImageInput value={props.node.distortionMap} onChange={onChangeProperty('distortionMap')} />
      </InputGroup>

      <InputGroup name="Environment Map" label={props.t('editor:properties.ocean.lbl-envMap')}>
        <ImageInput value={props.node.envMap} onChange={onChangeProperty('envMap')} />
      </InputGroup>

      <InputGroup name="Color" label={props.t('editor:properties.ocean.lbl-color')}>
        <ColorInput value={props.node.color} onChange={onChangeProperty('color')} disabled={false} />
      </InputGroup>
      <InputGroup name="Shallow Color" label={props.t('editor:properties.ocean.lbl-shallowWaterColor')}>
        <ColorInput
          value={props.node.shallowWaterColor}
          onChange={onChangeProperty('shallowWaterColor')}
          disabled={false}
        />
      </InputGroup>
      <NumericInputGroup
        name="Shallow to Deep Distance"
        label={props.t('editor:properties.ocean.lbl-shallowToDeepDistance')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.node.shallowToDeepDistance}
        onChange={onChangeProperty('shallowToDeepDistance')}
      />
      <NumericInputGroup
        name="Opacity Fade Distance"
        label={props.t('editor:properties.ocean.lbl-opacityFadeDistance')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.node.opacityFadeDistance}
        onChange={onChangeProperty('opacityFadeDistance')}
      />
      <InputGroup name="Opacity Range" label={props.t('editor:properties.ocean.lbl-opacityRange')}>
        <Vector2Input value={props.node.opacityRange} onChange={onChangeProperty('opacityRange')} />
      </InputGroup>
      <NumericInputGroup
        name="Shininess"
        label={props.t('editor:properties.ocean.lbl-shininess')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1.0}
        value={props.node.shininess}
        onChange={onChangeProperty('shininess')}
      />
      <NumericInputGroup
        name="Reflectivity"
        label={props.t('editor:properties.ocean.lbl-reflectivity')}
        min={0}
        max={1}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.node.reflectivity}
        onChange={onChangeProperty('reflectivity')}
      />
      <InputGroup name="Foam Color" label={props.t('editor:properties.ocean.lbl-foamColor')}>
        <ColorInput value={props.node.foamColor} onChange={onChangeProperty('foamColor')} disabled={false} />
      </InputGroup>
      <InputGroup name="Foam Speed" label={props.t('editor:properties.ocean.lbl-foamSpeed')}>
        <Vector2Input value={props.node.foamSpeed} onChange={onChangeProperty('foamSpeed')} />
      </InputGroup>
      <NumericInputGroup
        name="Foam Tiling"
        label={props.t('editor:properties.ocean.lbl-foamTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.node.foamTiling}
        onChange={onChangeProperty('foamTiling')}
      />
      <InputGroup name="Big Wave Tiling" label={props.t('editor:properties.ocean.lbl-bigWaveTiling')}>
        <Vector2Input value={props.node.bigWaveTiling} onChange={onChangeProperty('bigWaveTiling')} />
      </InputGroup>
      <InputGroup name="Big Wave Speed" label={props.t('editor:properties.ocean.lbl-bigWaveSpeed')}>
        <Vector2Input value={props.node.bigWaveSpeed} onChange={onChangeProperty('bigWaveSpeed')} />
      </InputGroup>
      <NumericInputGroup
        name="Big Wave Height"
        label={props.t('editor:properties.ocean.lbl-bigWaveHeight')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.node.bigWaveHeight}
        onChange={onChangeProperty('bigWaveHeight')}
      />
      <InputGroup name="Wave Speed" label={props.t('editor:properties.ocean.lbl-waveSpeed')}>
        <Vector2Input value={props.node.waveSpeed} onChange={onChangeProperty('waveSpeed')} />
      </InputGroup>
      <InputGroup name="Wave Scale" label={props.t('editor:properties.ocean.lbl-waveScale')}>
        <Vector2Input value={props.node.waveScale} onChange={onChangeProperty('waveScale')} />
      </InputGroup>
      <NumericInputGroup
        name="Wave Tiling"
        label={props.t('editor:properties.ocean.lbl-waveTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.node.waveTiling}
        onChange={onChangeProperty('waveTiling')}
      />
      <InputGroup name="Wave Distortion Speed" label={props.t('editor:properties.ocean.lbl-waveDistortionSpeed')}>
        <Vector2Input value={props.node.waveDistortionSpeed} onChange={onChangeProperty('waveDistortionSpeed')} />
      </InputGroup>
      <NumericInputGroup
        name="Wave Distortion Tiling"
        label={props.t('editor:properties.ocean.lbl-waveDistortionTiling')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={props.node.waveDistortionTiling}
        onChange={onChangeProperty('waveDistortionTiling')}
      />
    </NodeEditor>
  )
}

OceanNodeEditor.iconComponent = Water
OceanNodeEditor.description = i18n.t('editor:properties.ocean.description')

export default withTranslation()(OceanNodeEditor)
