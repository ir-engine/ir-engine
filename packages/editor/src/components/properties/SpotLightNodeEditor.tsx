import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RadianNumericInputGroup from '../inputs/RadianNumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import AdjustIcon from '@mui/icons-material/Adjust'
import { EditorComponentType } from './Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SpotLightComponent } from '@xrengine/engine/src/scene/components/SpotLightComponent'
import { updateSpotLight } from '@xrengine/engine/src/scene/functions/loaders/StopLightFunctions'

/**
 * SpotLightNodeEditor component class used to provide editor view for property customization.
 *
 *  @author Robert Long
 *  @type {class component}
 */
export const SpotLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //function to handle the changes in color property
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: SpotLightComponent,
      properties: { color }
    })
  }

  //function to handle the changes in intensity property
  const onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: SpotLightComponent,
      properties: { intensity }
    })
  }

  //function to handle the changes innerConeAngle property
  const onChangePenumbra = (penumbra) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: SpotLightComponent,
      properties: { penumbra }
    })
  }

  //function to handle the changes in outerConeAngle property
  const onChangeAngle = (angle) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: SpotLightComponent,
      properties: { angle }
    })
  }

  //function to handle the changes in ranges property
  const onChangeRange = (range) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: SpotLightComponent,
      properties: { range }
    })
  }

  const onChangeDecay = (decay) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: SpotLightComponent,
      properties: { decay }
    })
  }

  const lightComponent = getComponent(props.node.entity, SpotLightComponent)

  return (
    <NodeEditor {...props} description={t('editor:properties.spotLight.description')}>
      <InputGroup name="Color" label={t('editor:properties.spotLight.lbl-color')}>
        <ColorInput value={lightComponent.color} onChange={onChangeColor} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.spotLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={onChangeIntensity}
      />
      <NumericInputGroup
        name="Penumbra"
        label={t('editor:properties.spotLight.lbl-penumbra')}
        min={0}
        max={1}
        smallStep={0.01}
        mediumStep={0.1}
        value={lightComponent.penumbra}
        onChange={onChangePenumbra}
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
        onChange={onChangeAngle}
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
        onChange={onChangeRange}
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
        onChange={onChangeDecay}
      />
      <LightShadowProperties node={props.node} comp={SpotLightComponent} updateFunction={updateSpotLight} />
    </NodeEditor>
  )
}

SpotLightNodeEditor.iconComponent = AdjustIcon

export default SpotLightNodeEditor
