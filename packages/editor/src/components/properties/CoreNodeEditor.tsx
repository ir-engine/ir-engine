import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  ComponentMap,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, getEntityNodeArrayFromEntities } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { PreventBakeTagComponent } from '@etherealengine/engine/src/scene/components/PreventBakeTagComponent'
import { SceneTagComponent } from '@etherealengine/engine/src/scene/components/SceneTagComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'

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

  useOptionalComponent(props.entity, VisibleComponent)
  useOptionalComponent(props.entity, PreventBakeTagComponent)

  const onChangeVisible = (value) => {
    const nodes = getEntityNodeArrayFromEntities(getMutableState(SelectionState).selectedEntities.value).filter(
      (n) => typeof n !== 'string'
    ) as EntityOrObjectUUID[]
    EditorControlFunctions.addOrRemoveComponent(nodes, VisibleComponent, value)
  }

  const onChangeBakeStatic = (value) => {
    const nodes = getEntityNodeArrayFromEntities(getMutableState(SelectionState).selectedEntities.value).filter(
      (n) => typeof n === 'number'
    ) as EntityOrObjectUUID[]
    EditorControlFunctions.addOrRemoveComponent(nodes, PreventBakeTagComponent, value)
  }

  const registeredComponents = Array.from(Engine.instance.sceneComponentRegistry.entries())

  return (
    <PropertiesHeader>
      <NameInputGroupContainer>
        <NameInputGroup entity={props.entity} key={props.entity} />
        {!hasComponent(props.entity, SceneTagComponent) && (
          <>
            <VisibleInputGroup name="Visible" label={t('editor:properties.lbl-visible')}>
              <BooleanInput value={hasComponent(props.entity, VisibleComponent)} onChange={onChangeVisible} />
            </VisibleInputGroup>
            <VisibleInputGroup name="Prevent Baking" label={t('editor:properties.lbl-preventBake')}>
              <BooleanInput value={hasComponent(props.entity, PreventBakeTagComponent)} onChange={onChangeBakeStatic} />
            </VisibleInputGroup>
          </>
        )}
      </NameInputGroupContainer>

      {/** @todo #7258 */}
      {editorState.advancedMode.value && typeof props.entity === 'number' && (
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
                setComponent(props.entity, ComponentMap.get(sceneComponentID)!)
                dispatchAction(SelectionAction.forceUpdate({}))
              }
            }))}
          />
        </div>
      )}
    </PropertiesHeader>
  )
}
