import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
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
 *  @author Robert Long
 *  @type {Component class}
 */
export const DirectionalLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const selectionState = useSelectionState()
  const lightComponent = getComponent(props.node.entity, DirectionalLightComponent)

  useEffect(() => {
    if (!Engine.isCSMEnabled || props.node.entity !== Engine.activeCSMLightEntity) return

    if (selectionState.propertyName.value === 'rotation' && Engine.csm) {
      getComponent(props.node.entity, Object3DComponent)?.value.getWorldDirection(Engine.csm.lightDirection)
    }

    if (selectionState.propertyName.value === 'color') {
      Engine.csm.updateProperty('color', lightComponent.color)
    }

    if (selectionState.propertyName.value === 'intensity') {
      Engine.csm.updateProperty('intensity', lightComponent.intensity)
    }

    if (selectionState.propertyName.value === 'shadowBias') {
      Engine.csm.updateProperty('shadow.bias', lightComponent.shadowBias)
    }

    if (selectionState.propertyName.value === 'shadowRadius') {
      Engine.csm.updateProperty('shadow.radius', lightComponent.shadowRadius)
    }

    if (selectionState.propertyName.value === 'shadowMapResolution') {
      Engine.csm.updateProperty('shadow.mapSize', lightComponent.shadowMapResolution)
    }

    if (selectionState.propertyName.value === 'cameraFar') {
      Engine.csm.updateProperty('shadow.camera.far', lightComponent.cameraFar)
    }
  }, [selectionState.objectChangeCounter.value])

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
      {Engine.isCSMEnabled && (
        <InputGroup name="Use in CSM" label={t('editor:properties.directionalLight.lbl-useInCSM')}>
          <BooleanInput
            value={lightComponent.useInCSM}
            onChange={updateProperty(DirectionalLightComponent, 'useInCSM')}
          />
        </InputGroup>
      )}
      <LightShadowProperties node={props.node} comp={DirectionalLightComponent} />
      <InputGroup name="Camera Debugger" label={t('editor:properties.directionalLight.lbl-showCameraHelper')}>
        <BooleanInput
          value={lightComponent.showCameraHelper}
          onChange={updateProperty(DirectionalLightComponent, 'showCameraHelper')}
        />
      </InputGroup>
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
