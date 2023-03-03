import { range } from 'lodash'
import React from 'react'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Button } from '@etherealengine/editor/src/components/inputs/Button'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import { SceneObjectInput } from '@etherealengine/editor/src/components/inputs/SceneObjectInput'
import PaginatedList from '@etherealengine/editor/src/components/layout/PaginatedList'
import Well from '@etherealengine/editor/src/components/layout/Well'
import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import { EditorComponentType, updateProperty } from '@etherealengine/editor/src/components/properties/Util'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { LoadVolumeComponent, LoadVolumeTarget } from '@etherealengine/engine/src/scene/components/LoadVolumeComponent'

import CloudSyncIcon from '@mui/icons-material/CloudSync'
import { Grid } from '@mui/material'

const LoadVolumeNodeEditor: EditorComponentType = (props) => {
  const loadVolumeComponent = getComponent(props.entity, LoadVolumeComponent)
  const targets = loadVolumeComponent.targets
  /*function onEditTargets(index) {
    return (value) => {
      const nuTargets = [...targets.values()].map(({ uuid, entityJson, loaded }, i) => {
        if (i !== index) return [uuid, { uuid, entityJson, loaded }]
        return [value, { uuid: value }]
      }) as [EntityUUID, LoadVolumeTarget][]
      loadVolumeComponent.targets = new Map(nuTargets)
    }
  }

  function onAddTarget() {
    return () => {
      const nuTargets = [...targets.entries(), ['', {}] as [EntityUUID, LoadVolumeTarget]]
      loadVolumeComponent.targets = new Map(nuTargets)
    }
  }

  function onRemoveTarget(index) {
    return () => {
      const nuTargets = [...targets.entries()].filter((_, i) => i !== index)
      loadVolumeComponent.targets = new Map(nuTargets)
    }
  }*/
  /*
  return (
    <NodeEditor description={'Description'} {...props}>
      <PaginatedList
        list={range(0, targets.size)}
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
  )*/
  return <></>
}

LoadVolumeNodeEditor.iconComponent = CloudSyncIcon

export default LoadVolumeNodeEditor
