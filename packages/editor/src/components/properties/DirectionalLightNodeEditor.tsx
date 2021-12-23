import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import { useTranslation } from 'react-i18next'
import BoltIcon from '@mui/icons-material/Bolt'
import BooleanInput from '../inputs/BooleanInput'
import { CommandManager } from '../../managers/CommandManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { DirectionalLightComponent } from '@xrengine/engine/src/scene/components/DirectionalLightComponent'
import { updateDirectionalLight } from '@xrengine/engine/src/scene/functions/loaders/DirectionalLightFunctions'
import { EditorComponentType } from './Util'

/**
 * DirectionalLightNodeEditor is used provides  properties to customize DirectionaLight element.
 *
 *  @author Robert Long
 *  @type {Component class}
 */
export const DirectionalLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //function to handle changes in color property
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      updateFunction: updateDirectionalLight,
      component: DirectionalLightComponent,
      properties: { color }
    })
  }
  //function to handle the changes in intensity property of DirectionalLight
  const onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      updateFunction: updateDirectionalLight,
      component: DirectionalLightComponent,
      properties: { intensity }
    })
  }

  //function to handle the changes in camera far property of DirectionalLight
  const onChangeCameraFar = (cameraFar) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      updateFunction: updateDirectionalLight,
      component: DirectionalLightComponent,
      properties: { cameraFar }
    })
  }

  // function to handle changes in showCameraHelper propery
  const onChangeshowCameraHelper = (showCameraHelper) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      updateFunction: updateDirectionalLight,
      component: DirectionalLightComponent,
      properties: { showCameraHelper }
    })
  }

  // renders editor view, provides inputs to customize properties of DirectionalLight element.
  const lightComponent = getComponent(props.node.entity, DirectionalLightComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.directionalLight.name')}
      description={t('editor:properties.directionalLight.description')}
    >
      <InputGroup name="Color" label={t('editor:properties.directionalLight.lbl-color')}>
        <ColorInput value={lightComponent.color} onChange={onChangeColor} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.directionalLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={onChangeIntensity}
        unit="cd"
      />
      <LightShadowProperties
        node={props.node}
        comp={DirectionalLightComponent}
        updateFunction={updateDirectionalLight}
      />
      <InputGroup name="Camera Debugger" label={t('editor:properties.directionalLight.lbl-showCameraHelper')}>
        <BooleanInput value={lightComponent.showCameraHelper} onChange={onChangeshowCameraHelper} />
      </InputGroup>
      <NumericInputGroup
        name="CameraFar"
        label={t('editor:properties.directionalLight.lbl-cameraFar')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={lightComponent.cameraFar}
        onChange={onChangeCameraFar}
      />
    </NodeEditor>
  )
}

DirectionalLightNodeEditor.iconComponent = BoltIcon

export default DirectionalLightNodeEditor
