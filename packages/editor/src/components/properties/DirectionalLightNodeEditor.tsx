import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'

import BoltIcon from '@mui/icons-material/Bolt'

import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * DirectionalLightNodeEditor is used provides  properties to customize DirectionaLight element.
 *
 *  @type {Component class}
 */
export const DirectionalLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightComponent = useComponent(props.entity, DirectionalLightComponent).value

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.directionalLight.name')}
      description={t('editor:properties.directionalLight.description')}
    >
      <InputGroup name="Color" label={t('editor:properties.directionalLight.lbl-color')}>
        <ColorInput value={lightComponent.color} onChange={updateProperty(DirectionalLightComponent, 'color')} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.directionalLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={updateProperty(DirectionalLightComponent, 'intensity')}
        unit="cd"
      />
      <InputGroup name="Use in CSM" label={t('editor:properties.directionalLight.lbl-useInCSM')}>
        <BooleanInput
          value={lightComponent.useInCSM}
          onChange={updateProperty(DirectionalLightComponent, 'useInCSM')}
        />
      </InputGroup>
      <LightShadowProperties entity={props.entity} comp={DirectionalLightComponent} />
      <NumericInputGroup
        name="CameraFar"
        label={t('editor:properties.directionalLight.lbl-cameraFar')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={lightComponent.cameraFar}
        onChange={updateProperty(DirectionalLightComponent, 'cameraFar')}
      />
    </NodeEditor>
  )
}

DirectionalLightNodeEditor.iconComponent = BoltIcon

export default DirectionalLightNodeEditor
