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

import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { camelCaseToSpacedString } from '@etherealengine/common/src/utils/camelCaseToSpacedString'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  ComponentType,
  defineQuery,
  getComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { CallbackComponent } from '@etherealengine/engine/src/scene/components/CallbackComponent'
import {
  ColliderComponent,
  supportedColliderShapes
} from '@etherealengine/engine/src/scene/components/ColliderComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { useState } from '@etherealengine/hyperflux'

import PanToolIcon from '@mui/icons-material/PanTool'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperties, updateProperty } from './Util'

const bodyTypeOptions = Object.entries(RigidBodyType)
  .filter(([value]) => (value as string).length > 1)
  .map(([label, value]) => {
    return { label: camelCaseToSpacedString(label as string), value: Number(value) }
  })

const shapeTypeOptions = Object.entries(ShapeType)
  .filter(([label, value]) => supportedColliderShapes.includes(value as ShapeType))
  .map(([label, value]) => {
    return { label: camelCaseToSpacedString(label as string), value: Number(value) }
  })

type OptionsType = Array<{
  callbacks: Array<{
    label: string
    value: string
  }>
  label: string
  value: string
}>

const callbackQuery = defineQuery([CallbackComponent])

export const ColliderNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const targets = useState<OptionsType>([{ label: 'Self', value: 'Self', callbacks: [] }])

  const colliderComponent = getComponent(props.entity, ColliderComponent)

  useEffect(() => {
    const options = [] as OptionsType
    options.push({
      label: 'Self',
      value: 'Self',
      callbacks: []
    })
    for (const entity of callbackQuery()) {
      if (entity === props.entity || !hasComponent(entity, EntityTreeComponent)) continue
      const callbacks = getComponent(entity, CallbackComponent)
      options.push({
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent),
        callbacks: Object.keys(callbacks).map((cb) => {
          return { label: cb, value: cb }
        })
      })
    }
    targets.set(options)
  }, [])

  const updateIsTrigger = useCallback(
    (val) => {
      const props = { isTrigger: val } as Partial<ComponentType<typeof ColliderComponent>>
      if (val) {
        props.target = colliderComponent.target ?? 'Self'
        props.onEnter = colliderComponent.onEnter ?? ''
        props.onExit = colliderComponent.onExit ?? ''
      }
      updateProperties(ColliderComponent, props)
    },
    [props.entity]
  )

  const triggerProps = useCallback(() => {
    //function to handle the changes in target
    const onChangeTarget = (target) => {
      updateProperties(ColliderComponent, {
        target: target === 'Self' ? '' : target,
        onEnter: '',
        onExit: ''
      })
    }

    const targetOption = targets.value.find((o) => o.value === colliderComponent.target)
    const target = targetOption ? targetOption.value : 'Self'

    return (
      <>
        <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
          <SelectInput
            key={props.entity}
            value={colliderComponent.target ?? 'Self'}
            onChange={onChangeTarget}
            options={targets.value}
            disabled={props.multiEdit}
          />
        </InputGroup>
        <InputGroup name="On Enter" label={t('editor:properties.triggereVolume.lbl-onenter')}>
          {targetOption?.callbacks.length == 0 ? (
            <StringInput
              value={colliderComponent.onEnter!}
              onChange={updateProperty(ColliderComponent, 'onEnter')}
              disabled={props.multiEdit || !target}
            />
          ) : (
            <SelectInput
              key={props.entity}
              value={colliderComponent.onEnter!}
              onChange={updateProperty(ColliderComponent, 'onEnter') as any}
              options={targetOption?.callbacks ? targetOption.callbacks : []}
              disabled={props.multiEdit || !target}
            />
          )}
        </InputGroup>

        <InputGroup name="On Exit" label={t('editor:properties.triggereVolume.lbl-onexit')}>
          {targetOption?.callbacks.length == 0 ? (
            <StringInput
              value={colliderComponent.onExit!}
              onChange={updateProperty(ColliderComponent, 'onExit')}
              disabled={props.multiEdit || !target}
            />
          ) : (
            <SelectInput
              key={props.entity}
              value={colliderComponent.onExit!}
              onChange={updateProperty(ColliderComponent, 'onExit') as any}
              options={targetOption?.callbacks ? targetOption.callbacks : []}
              disabled={props.multiEdit || !target}
            />
          )}
        </InputGroup>
      </>
    )
  }, [props.entity])

  return (
    <NodeEditor {...props} description={t('editor:properties.collider.description')}>
      <InputGroup name="Type" label={t('editor:properties.collider.lbl-type')}>
        <SelectInput
          options={bodyTypeOptions}
          value={colliderComponent.bodyType}
          onChange={updateProperty(ColliderComponent, 'bodyType')}
        />
      </InputGroup>
      <InputGroup name="Shape" label={t('editor:properties.collider.lbl-shape')}>
        <SelectInput
          options={shapeTypeOptions}
          value={colliderComponent.shapeType}
          onChange={updateProperty(ColliderComponent, 'shapeType')}
        />
      </InputGroup>
      <InputGroup name="Trigger" label={t('editor:properties.collider.lbl-isTrigger')}>
        <BooleanInput value={colliderComponent.isTrigger} onChange={updateIsTrigger} />
      </InputGroup>
      {colliderComponent.isTrigger && triggerProps()}
    </NodeEditor>
  )
}

ColliderNodeEditor.iconComponent = PanToolIcon

export default ColliderNodeEditor
