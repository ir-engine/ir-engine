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
import { ComponentJson, EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getCallback } from '@etherealengine/engine/src/scene/components/CallbackComponent'
import CloudSyncIcon from '@mui/icons-material/CloudSync'
import { Button, Grid } from '@mui/material'
import InputGroup from '../inputs/InputGroup'
import { SceneObjectInput } from '../inputs/SceneObjectInput'
import Well from '../layout/Well'
import NodeEditor from './NodeEditor'

const LoadVolumeNodeEditor: EditorComponentType = (props) => {
  const loadVolumeComponent = useComponent(props.entity, LoadVolumeComponent)
  function onEditTargets(index) {
    return (value: EntityUUID) => {
      const nuTargets = loadVolumeComponent.targets.value.map(({ uuid, entities, loaded }, i) => {
        if (i !== index) return { uuid, entities, loaded }
        return {
          uuid: value,
          loaded: true,
          entities: [
            {
              name: value,
              components: [] as ComponentJson[]
            } as EntityJson
          ]
        }
      })
      commitProperties(LoadVolumeComponent, { targets: JSON.parse(JSON.stringify(nuTargets)) }, [props.entity])
    }
  }

  function onAddTarget() {
    return () => {
      const targets: LoadVolumeTarget[] = [
        ...JSON.parse(JSON.stringify(loadVolumeComponent.targets.value)),
        {
          uuid: '' as EntityUUID,
          loaded: true,
          entities: []
        } as LoadVolumeTarget
      ]
      commitProperties(LoadVolumeComponent, { targets }, [props.entity])
    }
  }

  function onRemoveTarget(index) {
    return () => {
      const targets = [...JSON.parse(JSON.stringify(loadVolumeComponent.targets.value))]
      targets.splice(index, 1)
      commitProperties(LoadVolumeComponent, { targets }, [props.entity])
    }
  }

  return (
    <NodeEditor description={'Description'} {...props}>
      <Button
        onClick={() => {
          getCallback(props.entity, 'doLoad')!()
        }}
      >
        Load All
      </Button>
      <Button
        onClick={() => {
          getCallback(props.entity, 'doUnload')!()
        }}
      >
        Unload All
      </Button>
      <div key={`load-volume-component-${props.entity}-targets`}>
        {loadVolumeComponent.targets.map((target, i) => {
          const { uuid } = loadVolumeComponent.targets[i].value
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
        })}
      </div>
      <Button onClick={onAddTarget()}>Add Target</Button>
    </NodeEditor>
  )
}

LoadVolumeNodeEditor.iconComponent = CloudSyncIcon

export default LoadVolumeNodeEditor
