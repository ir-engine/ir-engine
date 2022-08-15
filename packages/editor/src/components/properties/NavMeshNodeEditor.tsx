import React from 'react'
import { useTranslation } from 'react-i18next'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { NavMeshComponent } from '@xrengine/engine/src/scene/components/NavMeshComponent'

import { Map as _Map } from '@mui/icons-material'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/** Just a placeholder for the navmesh editor, for now. */
export const NavMeshNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const entity = props.node.entity

  const navMeshComponent = getComponent(entity, NavMeshComponent)
  const hasError = engineState.errorEntities[entity].get()
  const errorComponent = getComponent(entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.navMesh.name')}
      description={t('editor:properties.navMesh.description')}
    >
      <InputGroup name="Debug Mode" label={t('editor:properties.navMesh.lbl-showDebugVisual')}>
        <BooleanInput value={navMeshComponent.debugMode} onChange={updateProperty(NavMeshComponent, 'debugMode')} />
      </InputGroup>
    </NodeEditor>
  )
}

NavMeshNodeEditor.iconComponent = _Map

export default NavMeshNodeEditor
