import React from 'react'

import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'

import LanguageIcon from '@mui/icons-material/Language'

import { setTransformSpace, toggleTransformSpace } from '../../../functions/transformFunctions'
import { useEditorHelperState } from '../../../services/EditorHelperState'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const transformSpaceOptions = [
  { label: 'Selection', value: TransformSpace.LocalSelection },
  { label: 'World', value: TransformSpace.World }
]

const TransformSpaceTool = () => {
  const editorHelperState = useEditorHelperState()

  return (
    <div className={styles.toolbarInputGroup} id="transform-space">
      <InfoTooltip title="[Z] Toggle Transform Space">
        <button onClick={toggleTransformSpace as any} className={styles.toolButton}>
          <LanguageIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        key={editorHelperState.transformSpace.value}
        className={styles.selectInput}
        onChange={setTransformSpace}
        options={transformSpaceOptions}
        value={editorHelperState.transformSpace.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformSpaceTool
