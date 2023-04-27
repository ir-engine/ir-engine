import { useHookstate } from '@hookstate/core'
import React from 'react'

import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState } from '@etherealengine/hyperflux'

import LanguageIcon from '@mui/icons-material/Language'

import { setTransformSpace, toggleTransformSpace } from '../../../functions/transformFunctions'
import { EditorHelperState } from '../../../services/EditorHelperState'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const transformSpaceOptions = [
  { label: 'Selection', value: TransformSpace.Local },
  { label: 'World', value: TransformSpace.World }
]

const TransformSpaceTool = () => {
  const transformSpace = useHookstate(getMutableState(EditorHelperState).transformSpace)

  return (
    <div className={styles.toolbarInputGroup} id="transform-space">
      <InfoTooltip title="[Z] Toggle Transform Space">
        <button onClick={toggleTransformSpace} className={styles.toolButton}>
          <LanguageIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        key={transformSpace.value}
        className={styles.selectInput}
        onChange={setTransformSpace}
        options={transformSpaceOptions}
        value={transformSpace.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default TransformSpaceTool
