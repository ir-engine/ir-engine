import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getAllComponents, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import {
  AnimationSequencerComponent,
  AnimationSequencerFunctions,
  SequencerAction
} from '@xrengine/engine/src/scene/components/AnimationSequencerComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

import ViewInArIcon from '@mui/icons-material/ViewInAr'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 *
 * Animation Sequence Node Editor is used to create and play animation sequences on a target object.
 *
 * @type {[component class]}
 */
export const AnimationSequencerNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const sequencerComponent = getComponent(props.node.entity, AnimationSequencerComponent)
  let [options, setOptions] = useState<any[]>([])

  useEffect(() => {
    const options: any[] = []

    const entityTree = Engine.instance.currentWorld.entityTree

    traverseEntityNode(entityTree.rootNode, (o) => {
      if (o === entityTree.rootNode) return
      if (hasComponent(o.entity, AnimationComponent)) {
        const obj3d = getComponent(o.entity, Object3DComponent).value as any
        const callbacks = obj3d.callbacks ? obj3d.callbacks() : []
        options.push({ label: getComponent(o.entity, NameComponent)?.name, value: o.uuid, callbacks })
      }
    })
    setOptions(options)
  }, [])

  const onChangeTarget = (target) => {
    setPropertyOnSelectionEntities({
      component: AnimationSequencerComponent,
      properties: [
        {
          targetObject: target
        }
      ]
    })
  }

  const onUpdateIndex = (index) => {
    setPropertyOnSelectionEntities({
      component: AnimationSequencerComponent,
      properties: [
        {
          animationIndex: index
        }
      ]
    })
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.animationSequencer.description')}>
      <InputGroup name="Index Sequence" label={t('editor:properties.animationSequencer.lbl-animationIndex')}>
        <StringInput value={sequencerComponent.animationIndex} onChange={onUpdateIndex} />
      </InputGroup>

      <InputGroup name="Target" label={t('editor:properties.animationSequencer.lbl-targetObject')}>
        <SelectInput
          key={props.node.entity}
          value={sequencerComponent.targetObject}
          onChange={onChangeTarget}
          options={options}
          disabled={props.multiEdit}
        />
      </InputGroup>

      <InputGroup name="Loop" label={t('editor:properties.animationSequencer.lbl-loop')}>
        <BooleanInput value={sequencerComponent.loop} onChange={updateProperty(AnimationSequencerComponent, 'loop')} />
      </InputGroup>

      <InputGroup name="Play on Start" label={t('editor:properties.animationSequencer.lbl-playOnStart')}>
        <BooleanInput
          value={sequencerComponent.playOnStart}
          onChange={updateProperty(AnimationSequencerComponent, 'playOnStart')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

AnimationSequencerNodeEditor.iconComponent = ViewInArIcon

export default AnimationSequencerNodeEditor
