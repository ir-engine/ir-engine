import { range } from 'lodash'
import React from 'react'

import { Button } from '@xrengine/editor/src/components/inputs/Button'
import InputGroup from '@xrengine/editor/src/components/inputs/InputGroup'
import { SceneObjectInput } from '@xrengine/editor/src/components/inputs/SceneObjectInput'
import PaginatedList from '@xrengine/editor/src/components/layout/PaginatedList'
import Well from '@xrengine/editor/src/components/layout/Well'
import NodeEditor from '@xrengine/editor/src/components/properties/NodeEditor'
import { EditorComponentType, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { LoadVolumeComponent } from '@xrengine/engine/src/scene/components/LoadVolumeComponent'

import CloudSyncIcon from '@mui/icons-material/CloudSync'
import { Grid } from '@mui/material'

const LoadVolumeNodeEditor: EditorComponentType = (props) => {
  const loadVolumeComponent = getComponent(props.node.entity, LoadVolumeComponent)
  const targets = loadVolumeComponent.targets
  const updateTargets = updateProperty(LoadVolumeComponent, 'targets')
  function onEditTargets(index) {
    return (value) => {
      const nuTargets = targets.map(({ uuid, componentJson }, i) => {
        if (i !== index) return { uuid, componentJson }
        return { uuid: value, componentJson: [] }
      })
      updateTargets(nuTargets)
    }
  }

  function onAddTarget() {
    return () => {
      const nuTargets = [...targets]
      nuTargets.push({ uuid: '', componentJson: [] })
      updateTargets(nuTargets)
    }
  }

  function onRemoveTarget(index) {
    return () => {
      const nuTargets = targets.filter(({}, i) => i !== index)
      updateTargets(nuTargets)
    }
  }

  return (
    <NodeEditor description={'Description'} {...props}>
      <PaginatedList
        list={range(0, targets.length)}
        element={(i) => {
          const { uuid } = targets[i]
          return (
            <Well key={`${props.node.uuid}-load-volume-targets-${i}`}>
              <Grid container spacing={0.5}>
                <Grid item xs={1}>
                  <Button onClick={onRemoveTarget(i)} style={{ backgroundColor: '#e33', width: 'auto' }}>
                    x
                  </Button>
                </Grid>
                <Grid item xs display="flex">
                  <InputGroup name="uuid" label="uuid">
                    <SceneObjectInput value={uuid} onChange={onEditTargets(i)} />
                  </InputGroup>
                </Grid>
              </Grid>
            </Well>
          )
        }}
      />
      <Button onClick={onAddTarget()}>Add Target</Button>
    </NodeEditor>
  )
}

LoadVolumeNodeEditor.iconComponent = CloudSyncIcon

export default LoadVolumeNodeEditor
