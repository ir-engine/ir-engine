import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { InteriorComponent } from '@etherealengine/engine/src/scene/components/InteriorComponent'

import LocationCityIcon from '@mui/icons-material/LocationCity'

import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import Vector2Input from '../inputs/Vector2Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * Interior Editor provides the editor to customize properties.
 *
 * @type {class component}
 */
export const InteriorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const interiorComponent = getComponent(entity, InteriorComponent)
  const errors = getEntityErrors(props.entity, InteriorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.interior.name')}
      description={t('editor:properties.interior.description')}
    >
      <InputGroup name="Cube Map" label={t('editor:properties.interior.lbl-cubeMap')}>
        <ImageInput value={interiorComponent.cubeMap} onChange={updateProperty(InteriorComponent, 'cubeMap')} />
        {errors && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.interior.error-url')}</div>}
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
