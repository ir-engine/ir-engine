import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { camelCaseToSpacedString } from '@xrengine/common/src/utils/camelCaseToSpacedString'
import { LoopAnimationFunctions } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  defineQuery,
  getAllComponents,
  getComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { AnimationSequencerFunctions } from '@xrengine/engine/src/scene/components/AnimationSequencerComponent'
import { CallbackComponent } from '@xrengine/engine/src/scene/components/CallbackComponent'
import { ColliderComponent, ColliderComponentType } from '@xrengine/engine/src/scene/components/ColliderComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DFunctions } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { supportedColliderShapes } from '@xrengine/engine/src/scene/functions/loaders/ColliderFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import PanToolIcon from '@mui/icons-material/PanTool'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

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

  const colliderComponent = getComponent(props.node.entity, ColliderComponent)

  let [options, setOptions] = useState<any[]>([])

  useEffect(() => {
    const options: any[] = []

    const entityTree = Engine.instance.currentWorld.entityTree

    traverseEntityNode(entityTree.rootNode, (o) => {
      if (o === entityTree.rootNode) return
      if (hasComponent(o.entity, TransformComponent)) {
        //        const obj3d = getComponent(o.entity, Object3DComponent).value as any
        //        const callbacks = obj3d.callbacks ? obj3d.callbacks() : []
        options.push({ label: getComponent(o.entity, NameComponent)?.name, value: o.uuid })
      }
    })
    setOptions(options)
  }, [])

  const updateIsTrigger = (val) => {
    const props = { isTrigger: val } as Partial<ColliderComponentType>
    if (val) {
      props.target = colliderComponent.target ?? 'Self'
      props.triggerEvent = colliderComponent.triggerEvent ?? ''
    }
    setPropertyOnSelectionEntities({
      component: ColliderComponent,
      properties: [props]
    })
  }

  let comps

  const triggerProps = () => {
    function getEntityNode(entID) {
      const entityNode = Engine.instance.currentWorld.entityTree.uuidNodeMap.get(entID)
      return entityNode
    }

    function getModifiableProperties(entID) {
      let arr: { label: string; value: any }[] = []

      let entity = getEntityNode(entID)
      if (!entity) {
        return arr
      }
      comps = getAllComponents(entity.entity)

      comps.forEach(function (comp) {
        arr.push({ label: comp._name, value: comp._name })
      })
      return arr
    }

    function getValues() {
      let arr: { label: string; value: any }[] = []
      if (!comps) return arr

      let funcs: string[] = []
      switch (colliderComponent.targetComponent) {
        case 'Object3DComponent':
          funcs = Object3DFunctions
          break
        case 'LoopAnimationComponent':
          funcs = LoopAnimationFunctions
          break
        case 'AnimationSequencerComponent':
          funcs = AnimationSequencerFunctions
      }

      funcs.forEach(function (func) {
        arr.push({ label: func, value: func })
      })

      return arr
    }

    //function to handle the changes in target
    const onChangeTarget = (target) => {
      setPropertyOnSelectionEntities({
        component: ColliderComponent,
        properties: [
          {
            triggerEvent: '',
            target
          }
        ]
      })
    }

    const onChangeComponent = (targetComponent) => {
      setPropertyOnSelectionEntities({
        component: ColliderComponent,
        properties: [
          {
            targetComponent: targetComponent,
            triggerEvent: ''
          }
        ]
      })
    }

    const targetOption = options.find((o) => o.value === colliderComponent.target)
    const target = targetOption ? targetOption.value : 'Self'

    const triggerTypes: { label: string; value: any }[] = [
      { label: 'On Enter', value: 1 },
      { label: 'On Exit', value: 2 }
    ]

    return (
      <>
        <InputGroup name="Trigger Type" label={t('editor:properties.triggereVolume.lbl-triggerType')}>
          <SelectInput
            key={props.node.entity}
            value={colliderComponent.triggerType == '' ? triggerTypes[0].label : colliderComponent.triggerType}
            onChange={updateProperty(ColliderComponent, 'triggerType')}
            options={triggerTypes}
          />
        </InputGroup>

        <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
          <SelectInput
            key={props.node.entity}
            value={colliderComponent.target}
            onChange={onChangeTarget}
            options={options}
            disabled={props.multiEdit || colliderComponent.triggerType == ''}
          />
        </InputGroup>

        <InputGroup name="Component" label={t('editor:properties.triggereVolume.lbl-targetComponent')}>
          <SelectInput
            key={props.node.entity}
            value={colliderComponent.targetComponent}
            onChange={onChangeComponent}
            options={!target ? [] : getModifiableProperties(target)}
            disabled={props.multiEdit || !target}
          />
        </InputGroup>

        <InputGroup name="Trigger Event" label={t('editor:properties.triggereVolume.lbl-triggerEvent')}>
          <SelectInput
            key={props.node.entity}
            value={colliderComponent.triggerEvent}
            onChange={updateProperty(ColliderComponent, 'triggerEvent')}
            options={!target ? [] : getValues()}
            disabled={props.multiEdit || !target}
          />
        </InputGroup>
      </>
    )
  }

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
