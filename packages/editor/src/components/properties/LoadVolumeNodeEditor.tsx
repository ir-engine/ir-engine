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

import { EditorComponentType, commitProperties } from '@etherealengine/editor/src/components/properties/Util'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { LoadVolumeComponent, LoadVolumeTarget } from '@etherealengine/engine/src/scene/components/LoadVolumeComponent'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import CloudSyncIcon from '@mui/icons-material/CloudSync'
import { Button, Grid } from '@mui/material'
import { range } from 'lodash'
import InputGroup from '../inputs/InputGroup'
import { SceneObjectInput } from '../inputs/SceneObjectInput'
import PaginatedList from '../layout/PaginatedList'
import Well from '../layout/Well'
import NodeEditor from './NodeEditor'

const LoadVolumeNodeEditor: EditorComponentType = (props) => {
  const loadVolumeComponent = useComponent(props.entity, LoadVolumeComponent)
  const targets = loadVolumeComponent.targets.value
  function onEditTargets(index) {
    return (value: EntityUUID) => {
      const nuTargets = [...Object.values(targets)].map(({ uuid, entities, loaded }, i) => {
        if (i !== index) return [uuid, { uuid, entities, loaded }]
        return [
          value,
          {
            uuid: value,
            loaded: true,
            entities: [
              {
                name: value,
                components: [] as ComponentJson[]
              }
            ]
          } as LoadVolumeTarget
        ]
      }) as [EntityUUID, LoadVolumeTarget][]
      commitProperties(LoadVolumeComponent, { targets: Object.fromEntries(nuTargets) }, [props.entity])
    }
  }

  function onAddTarget() {
    return () => {
      const nuTargets = [
        ...Object.entries(targets),
        [
          '',
          {
            uuid: '' as EntityUUID,
            loaded: true,
            entities: [
              {
                name: '' as EntityUUID,
                components: [] as ComponentJson[]
              }
            ]
          }
        ] as [EntityUUID, LoadVolumeTarget]
      ]
      commitProperties(LoadVolumeComponent, { targets: Object.fromEntries(nuTargets) }, [props.entity])
    }
  }

  function onRemoveTarget(index) {
    return () => {
      const nuTargets = [...Object.entries(targets)].filter((_, i) => i !== index)
      commitProperties(LoadVolumeComponent, { targets: Object.fromEntries(nuTargets) }, [props.entity])
    }
  }

  return (
    <NodeEditor description={'Description'} {...props}>
      <PaginatedList
        list={range(0, Object.keys(targets).length)}
        element={(i: number) => {
          const { uuid } = Object.values(loadVolumeComponent.targets.value)[i]
          return (
            <Well key={`${props.entity}-load-volume-targets-${i}`}>
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
