import React from 'react'
import NodeEditor from '../properties/NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector2Input from '../inputs/Vector2Input'
import { useTranslation } from 'react-i18next'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { CommandManager } from '../../managers/CommandManager'
import LocationCityIcon from '@mui/icons-material/LocationCity'

//declaring properties for InteriorNodeEditor
type InteriorNodeEditorProps = {
  node: any
}

/**
 * InteriorNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const InteriorNodeEditor = (props: InteriorNodeEditorProps) => {
  const { t } = useTranslation()

  const onChangeProperty = (name: string) => {
    return (value) => {
      CommandManager.instance.setPropertyOnSelection(name, value)
    }
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.interior.description')}>
      <InputGroup name="Cube Map" label={t('editor:properties.interior.lbl-cubeMap')}>
        <ImageInput value={props.node.cubeMap} onChange={onChangeProperty('cubeMap')} />
      </InputGroup>
      <InputGroup name="Size" label={t('editor:properties.interior.lbl-size')}>
        <Vector2Input value={props.node.size} onChange={onChangeProperty('size')} />
      </InputGroup>
      <NumericInputGroup
        name="Tiling"
        label={t('editor:properties.interior.lbl-tiling')}
        min={1}
        smallStep={1.0}
        mediumStep={1.0}
        largeStep={2.0}
        value={props.node.tiling}
        onChange={onChangeProperty('tiling')}
      />
    </NodeEditor>
  )
}

InteriorNodeEditor.iconComponent = LocationCityIcon

export default InteriorNodeEditor
