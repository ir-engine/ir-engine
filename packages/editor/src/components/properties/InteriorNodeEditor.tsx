import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector2Input from '../inputs/Vector2Input'
import { useTranslation } from 'react-i18next'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import { EditorComponentType, updateProperty } from './Util'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { InteriorComponent } from '@xrengine/engine/src/scene/components/InteriorComponent'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'

/**
 * Interior Editor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const InteriorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const entity = props.node.entity
  const interiorComponent = getComponent(entity, InteriorComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.interior.name')}
      description={t('editor:properties.interior.description')}
    >
      <InputGroup name="Cube Map" label={t('editor:properties.interior.lbl-cubeMap')}>
        <ImageInput value={interiorComponent.cubeMap} onChange={updateProperty(InteriorComponent, 'cubeMap')} />
        {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.interior.error-url')}</div>}
      </InputGroup>
      <InputGroup name="Size" label={t('editor:properties.interior.lbl-size')}>
        <Vector2Input value={interiorComponent.size} onChange={updateProperty(InteriorComponent, 'size')} />
      </InputGroup>
      <NumericInputGroup
        name="Tiling"
        label={t('editor:properties.interior.lbl-tiling')}
        min={1}
        smallStep={1.0}
        mediumStep={1.0}
        largeStep={2.0}
        value={interiorComponent.tiling}
        onChange={updateProperty(InteriorComponent, 'tiling')}
      />
    </NodeEditor>
  )
}

InteriorNodeEditor.iconComponent = LocationCityIcon

export default InteriorNodeEditor
