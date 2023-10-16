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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ComponentType, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  AnimationSystemGroup,
  InputSystemGroup,
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { SystemComponent } from '@etherealengine/engine/src/scene/components/SystemComponent'

import ExtensionIcon from '@mui/icons-material/Extension'

import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { convertSystemComponentJSON } from '@etherealengine/engine/src/scene/components/SystemComponent'
import { getState } from '@etherealengine/hyperflux'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import { SelectInput } from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperties, commitProperty } from './Util'

const systemGroups = [
  {
    label: 'Input',
    value: InputSystemGroup
  },
  {
    label: 'Simulation',
    value: SimulationSystemGroup
  },
  {
    label: 'Animation',
    value: AnimationSystemGroup
  },
  {
    label: 'Presentation',
    value: PresentationSystemGroup
  }
]

const insertTypes = [
  {
    label: 'Before',
    value: 'before'
  },
  {
    label: 'With',
    value: 'with'
  },
  {
    label: 'After',
    value: 'after'
  }
]

export const SystemNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const [systemsState, setSystems] = useState(
    [] as {
      label: string
      data: ComponentType<typeof SystemComponent>
      value: number
    }[]
  )

  const [selected, setSelected] = useState(0)

  const onSystemChange = (systemIndex: number) => {
    setSelected(systemIndex)
    commitProperties(SystemComponent, systemsState[systemIndex].data)
  }

  const systemComponent = useComponent(props.entity, SystemComponent).value

  useEffect(() => {
    const sceneData = getState(SceneState).sceneData!
    const systems = [] as {
      label: string
      data: ComponentType<typeof SystemComponent>
      value: number
    }[]

    for (const entity of Object.values(sceneData.scene.entities)) {
      for (const component of entity.components) {
        if (component.name === 'system') {
          const systemProps = convertSystemComponentJSON(component.props)

          /**
           * Create a shortest unique label for this system
           * filePath is a full path to the system file. We want to create a label that is unique and short
           * We will start with the last part of the path and check if it is unique. If it is not unique, we will
           * prepend the previous part of the path and check again. We will continue this until we have a unique label
           */

          const filePathSplit = systemProps.filePath.split('/')
          let label = filePathSplit.pop() || ''

          // eslint-disable-next-line no-constant-condition
          while (true) {
            let isDuplicateLabel = false
            for (let i = 0; i < systems.length; i++) {
              if (systems.length && systems[i].label === label && systems[i].data.filePath !== systemProps.filePath) {
                isDuplicateLabel = true
                break
              }
            }

            if (isDuplicateLabel) {
              const previous = filePathSplit.pop()
              if (previous) {
                label = previous + '/' + label
              } else {
                // This is already a full path, Cannot extend the label any further
                break
              }
            } else {
              break
            }
          }
          systems.push({
            label: label,
            data: systemProps,
            value: systems.length
          })
        }
      }
    }
    setSystems(systems)
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.systemnode.name')}
      description={t('editor:properties.systemnode.description')}
    >
      <InputGroup name="Systems" label={t('editor:properties.systemnode.lbl-name')}>
        <SelectInput
          key={props.entity}
          options={systemsState}
          onChange={onSystemChange}
          value={systemsState.length ? systemsState[selected].value : ''}
        />
      </InputGroup>
      <InputGroup name="insertUUID" label={t('editor:properties.systemnode.lbl-insertUUID')}>
        <SelectInput
          key={props.entity}
          options={systemGroups}
          onChange={commitProperty(SystemComponent, 'insertUUID')}
          value={systemComponent.insertUUID}
        />
      </InputGroup>
      <InputGroup name="insertOrder" label={t('editor:properties.systemnode.lbl-insertOrder')}>
        <SelectInput
          key={props.entity}
          options={insertTypes}
          onChange={commitProperty(SystemComponent, 'insertOrder')}
          value={systemComponent.insertOrder}
        />
      </InputGroup>
      <InputGroup name="enableClient" label={t('editor:properties.systemnode.lbl-enableClient')}>
        <BooleanInput onChange={commitProperty(SystemComponent, 'enableClient')} value={systemComponent.enableClient} />
      </InputGroup>
      <InputGroup name="enableServer" label={t('editor:properties.systemnode.lbl-enableServer')}>
        <BooleanInput onChange={commitProperty(SystemComponent, 'enableServer')} value={systemComponent.enableServer} />
      </InputGroup>
      {/* <InputGroup name="args" label={t('editor:properties.systemnode.lbl-args')}>
        <StringInput
          value={systemComponent.args as any}
          onRelease={(value) => {
            setComponent(props.entity, SystemComponent, { args: value })
          }}
        />
      </InputGroup> */}
    </NodeEditor>
  )
}

SystemNodeEditor.iconComponent = ExtensionIcon

export default SystemNodeEditor
