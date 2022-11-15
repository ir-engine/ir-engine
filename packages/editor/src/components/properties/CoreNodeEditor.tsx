import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  ComponentMap,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode, getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { PreventBakeTagComponent } from '@xrengine/engine/src/scene/components/PreventBakeTagComponent'
import { SceneTagComponent } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import AddIcon from '@mui/icons-material/Add'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EntityNodeEditor } from '../../functions/PrefabEditors'
import { useEditorState } from '../../services/EditorServices'
import { SelectionAction, SelectionState } from '../../services/SelectionServices'
import MainMenu from '../dropDownMenu'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NameInputGroup from './NameInputGroup'
import { EditorComponentType } from './Util'

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
 * CoreNodeEditor component is used to render editor view to customize properties.
 *
 * @type {class component}
 */
export const CoreNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const editorState = useEditorState()

  useOptionalComponent(props.node.entity, VisibleComponent)
  useOptionalComponent(props.node.entity, PreventBakeTagComponent)

  const onChangeVisible = (value) => {
    const nodes = getEntityNodeArrayFromEntities(getState(SelectionState).selectedEntities.value).filter(
      (n) => typeof n !== 'string'
    ) as EntityTreeNode[]
    EditorControlFunctions.addOrRemoveComponent(nodes, VisibleComponent, value)
  }

  const onChangeBakeStatic = (value) => {
    const nodes = getEntityNodeArrayFromEntities(getState(SelectionState).selectedEntities.value).filter(
      (n) => typeof n === 'object'
    ) as EntityTreeNode[]
    EditorControlFunctions.addOrRemoveComponent(nodes, PreventBakeTagComponent, value)
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
