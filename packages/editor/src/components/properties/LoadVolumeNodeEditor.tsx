/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { LoadVolumeComponent } from '@etherealengine/engine/src/scene/components/LoadVolumeComponent'

import CloudSyncIcon from '@mui/icons-material/CloudSync'

const LoadVolumeNodeEditor: EditorComponentType = (props) => {
  const loadVolumeComponent = useComponent(props.entity, LoadVolumeComponent)
  const targets = loadVolumeComponent.targets.value
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
