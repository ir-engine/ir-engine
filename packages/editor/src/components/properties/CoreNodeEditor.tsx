import node from 'postcss/lib/node'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Euler } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  ComponentMap,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { PreventBakeTagComponent } from '@xrengine/engine/src/scene/components/PreventBakeTagComponent'
import { SceneDynamicLoadTagComponent } from '@xrengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { SceneTagComponent } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import AddIcon from '@mui/icons-material/Add'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EntityNodeEditor } from '../../functions/PrefabEditors'
import { useEditorState } from '../../services/EditorServices'
import { SelectionAction } from '../../services/SelectionServices'
import MainMenu from '../dropDownMenu'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import NameInputGroup from './NameInputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * PropertiesHeader used as a wrapper for NameInputGroupContainer component.
 */
const PropertiesHeader = styled.div`
  border: none !important;
  padding-bottom: 0 !important;
`

/**
 * NameInputGroupContainer used to provides styles and contains NameInputGroup and VisibleInputGroup.
 *
 *  @type {Styled Component}
 */
const NameInputGroupContainer = styled.div``
/**
 * Styled component used to provide styles for visiblity checkbox.
 */
const VisibleInputGroup = styled(InputGroup)`
  & > label {
    width: auto !important;
  }
`

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @type {class component}
 */
export const CoreNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const editorState = useEditorState()

  useOptionalComponent(props.node.entity, VisibleComponent)
  useOptionalComponent(props.node.entity, PreventBakeTagComponent)

  const onChangeVisible = (value) => {
    EditorControlFunctions.addOrRemoveComponentToSelection(VisibleComponent, value)
  }

  const onChangeBakeStatic = (value) => {
    EditorControlFunctions.addOrRemoveComponentToSelection(PreventBakeTagComponent, value)
  }

  const registeredComponents = Array.from(Engine.instance.currentWorld.sceneComponentRegistry.entries())

  return (
    <PropertiesHeader>
      <NameInputGroupContainer>
        <NameInputGroup node={props.node} key={props.node.entity} />
        {!hasComponent(props.node.entity, SceneTagComponent) && (
          <>
            <VisibleInputGroup name="Visible" label={t('editor:properties.lbl-visible')}>
              <BooleanInput value={hasComponent(props.node.entity, VisibleComponent)} onChange={onChangeVisible} />
            </VisibleInputGroup>
            <VisibleInputGroup name="Prevent Baking" label={t('editor:properties.lbl-preventBake')}>
              <BooleanInput
                value={hasComponent(props.node.entity, PreventBakeTagComponent)}
                onChange={onChangeBakeStatic}
              />
            </VisibleInputGroup>
          </>
        )}
      </NameInputGroupContainer>

      {/** @todo this is the add component menu - still a work in progress */}
      {editorState.advancedMode.value && typeof props.node.entity === 'number' && (
        <div style={{ pointerEvents: 'auto' }}>
          <MainMenu
            icon={AddIcon}
            commands={Array.from(EntityNodeEditor).map(([component, editor]) => ({
              name: component.name,
              action: () => {
                const comp = registeredComponents.find(([comp, prefab]) => comp === component.name)!
                if (!comp) return console.warn('could not find component name', component.name)
                const [sceneComponentID] = comp
                if (!sceneComponentID) return console.warn('could not find component name', sceneComponentID)
                if (!ComponentMap.get(sceneComponentID))
                  return console.warn('could not find component', sceneComponentID)
                setComponent(props.node.entity, ComponentMap.get(sceneComponentID)!)
                dispatchAction(SelectionAction.forceUpdate({}))
              }
            }))}
          />
        </div>
      )}
    </PropertiesHeader>
  )
}
