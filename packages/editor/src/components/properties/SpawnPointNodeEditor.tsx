import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SpawnPointComponent } from '@xrengine/engine/src/scene/components/SpawnPointComponent'

import StreetviewIcon from '@mui/icons-material/Streetview'

import ArrayInputGroup from '../inputs/ArrayInputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize Spawn Point properties.
 *
 * @type {Class component}
 */
export const SpawnPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const spawnComponent = getComponent(props.node.entity, SpawnPointComponent)
  // initializing iconComponent icon name
  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.spawnPoint.name')}
      description={t('editor:properties.spawnPoint.description')}
    >
      <ArrayInputGroup
        name="Users"
        prefix="User"
        values={spawnComponent.permissionedUsers}
        onChange={updateProperty(SpawnPointComponent, 'permissionedUsers')}
        label={t('editor:properties.spawnPoint.users')}
      ></ArrayInputGroup>
    </NodeEditor>
  )
}

SpawnPointNodeEditor.iconComponent = StreetviewIcon

export default SpawnPointNodeEditor
