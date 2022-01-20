import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { useTranslation } from 'react-i18next'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { AmbientLightComponent } from '@xrengine/engine/src/scene/components/AmbientLightComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorComponentType, updateProperty } from './Util'

/**
 *
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 *
 * @author Robert Long
 * @type {[component class]}
 */
export const AmbientLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lightComponent = getComponent(props.node.entity, AmbientLightComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.ambientLight.name')}
      description={t('editor:properties.ambientLight.description')}
    >
      <InputGroup name="Color" label={t('editor:properties.ambientLight.lbl-color')}>
        <ColorInput value={lightComponent.color} onChange={updateProperty(AmbientLightComponent, 'color')} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.ambientLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={updateProperty(AmbientLightComponent, 'intensity')}
        unit="cd"
      />
    </NodeEditor>
  )
}

AmbientLightNodeEditor.iconComponent = Brightness7Icon

export default AmbientLightNodeEditor
