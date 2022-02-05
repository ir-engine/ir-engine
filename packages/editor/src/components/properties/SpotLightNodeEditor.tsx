import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RadianNumericInputGroup from '../inputs/RadianNumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import { useTranslation } from 'react-i18next'
import AdjustIcon from '@mui/icons-material/Adjust'
import { EditorComponentType, updateProperty } from './Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SpotLightComponent } from '@xrengine/engine/src/scene/components/SpotLightComponent'

/**
 * SpotLightNodeEditor component class used to provide editor view for property customization.
 *
 *  @author Robert Long
 *  @type {class component}
 */
export const SpotLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lightComponent = getComponent(props.node.entity, SpotLightComponent)

  return (
    <NodeEditor {...props} description={t('editor:properties.spotLight.description')}>
      <InputGroup name="Color" label={t('editor:properties.spotLight.lbl-color')}>
        <ColorInput value={lightComponent.color} onChange={updateProperty(SpotLightComponent, 'color')} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.spotLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={updateProperty(SpotLightComponent, 'intensity')}
      />
      <NumericInputGroup
        name="Penumbra"
        label={t('editor:properties.spotLight.lbl-penumbra')}
        min={0}
        max={1}
        smallStep={0.01}
        mediumStep={0.1}
        value={lightComponent.penumbra}
        onChange={updateProperty(SpotLightComponent, 'penumbra')}
      />
      <RadianNumericInputGroup
        name="Outer Cone Angle"
        label={t('editor:properties.spotLight.lbl-angle')}
        min={0}
        max={90}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={lightComponent.angle}
        onChange={updateProperty(SpotLightComponent, 'angle')}
        unit="°"
      />
      <NumericInputGroup
        name="Range"
        label={t('editor:properties.spotLight.lbl-range')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={lightComponent.range}
        onChange={updateProperty(SpotLightComponent, 'range')}
        unit="m"
      />
      <NumericInputGroup
        name="Decay"
        label={t('editor:properties.spotLight.lbl-decay')}
        min={0}
        max={1}
        smallStep={0.1}
        mediumStep={1}
        value={lightComponent.decay}
        onChange={updateProperty(SpotLightComponent, 'decay')}
      />
      <LightShadowProperties node={props.node} comp={SpotLightComponent} />
    </NodeEditor>
  )
}

SpotLightNodeEditor.iconComponent = AdjustIcon

export default SpotLightNodeEditor
