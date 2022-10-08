import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { DirectionalLightComponent } from '@xrengine/engine/src/scene/components/DirectionalLightComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

import BoltIcon from '@mui/icons-material/Bolt'

import { useSelectionState } from '../../services/SelectionServices'
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
  const selectionState = useSelectionState()
  const lightComponent = getComponent(props.node.entity, DirectionalLightComponent)

  useEffect(() => {
    if (selectionState.propertyName.value === 'color') {
      EngineRenderer.instance.csm.updateProperty('color', lightComponent.color)
    }

    if (selectionState.propertyName.value === 'intensity') {
      EngineRenderer.instance.csm.updateProperty('intensity', lightComponent.intensity)
    }

    if (selectionState.propertyName.value === 'shadowBias') {
      EngineRenderer.instance.csm.updateProperty('shadow.bias', lightComponent.shadowBias)
    }

    if (selectionState.propertyName.value === 'shadowRadius') {
      EngineRenderer.instance.csm.updateProperty('shadow.radius', lightComponent.shadowRadius)
    }

    if (selectionState.propertyName.value === 'shadowMapResolution') {
      EngineRenderer.instance.csm.updateProperty('shadow.mapSize', lightComponent.shadowMapResolution)
    }

    if (selectionState.propertyName.value === 'cameraFar') {
      EngineRenderer.instance.csm.updateProperty('shadow.camera.far', lightComponent.cameraFar)
    }
  }, [selectionState.objectChangeCounter])

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
      <LightShadowProperties node={props.node} comp={DirectionalLightComponent} />
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
