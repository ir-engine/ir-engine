import React, { useEffect } from 'react'

import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

import DirectionsRun from '@mui/icons-material/DirectionsRun'

import { useEditorState } from '../../services/EditorServices'
import SelectInput from '../inputs/SelectInput'
import { InfoTooltip } from '../layout/Tooltip'
import * as styles from '../toolbar/styles.module.scss'
import {
  EditorActiveInstanceService,
  EditorActiveInstanceServiceReceptor,
  useEditorActiveInstanceState
} from './EditorActiveInstanceService'

const TransformSpaceTool = () => {
  const activeInstanceState = useEditorActiveInstanceState()
  const activeInstances = activeInstanceState.activeInstances.value.map((instance) => {
    return {
      label: instance.id,
      value: instance.id
    }
  })

  console.log(activeInstanceState.value)
  console.log(activeInstances)

  const editorState = useEditorState()
  const sceneId = `${editorState.projectName.value}/${editorState.sceneName.value}`

  useEffect(() => {
    EditorActiveInstanceService.getActiveInstances(sceneId)
    addActionReceptor(EditorActiveInstanceServiceReceptor)
    return () => {
      removeActionReceptor(EditorActiveInstanceServiceReceptor)
    }
  }, [])

  const onSelectInstance = () => {}
  const decrementPage = () => {}
  const incrementPage = () => {}

  return (
    <div className={styles.toolbarInputGroup} id="transform-space">
      <InfoTooltip title="Active Instances">
        <DirectionsRun fontSize="small" />
      </InfoTooltip>
      <SelectInput
        className={styles.selectInput}
        onChange={onSelectInstance}
        options={activeInstances}
        value={''}
        creatable={false}
        isSearchable={false}
      />
      {/* <button onClick={decrementPage} className={styles.toolButton} >Previous Page</button>
      <button onClick={incrementPage} className={styles.toolButton} >Next Page</button> */}
    </div>
  )
}

export default TransformSpaceTool
