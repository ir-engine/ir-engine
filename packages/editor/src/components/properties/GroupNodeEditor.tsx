import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { Object3DComponent, Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { sceneToGLTF } from '@xrengine/engine/src/scene/functions/GLTFConversion'

import GridViewIcon from '@mui/icons-material/GridView'

import { uploadProjectFile } from '../../functions/assetFunctions'
import { accessEditorState } from '../../services/EditorServices'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * GroupNodeEditor used to render group of multiple objects.
 *
 * @author Robert Long
 * @type {class component}
 */
export const GroupNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const obj3d = getComponent(entity, Object3DComponent)?.value
  const world = useWorld()
  const uuid = props.node.uuid

  const projectName = accessEditorState().projectName.value!

  const onExportGroup = () => {
    const name = obj3d.name
    const exportable = sceneToGLTF(obj3d as Object3DWithEntity)
    const uploadable = new File([JSON.stringify(exportable)], `${name}.xre.gltf`)
    uploadProjectFile(projectName, [uploadable], true)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.group.name')}
      description={t('editor:properties.group.description')}
    >
      <PropertiesPanelButton onClick={onExportGroup}>{t('editor:properties.asset.lbl-export')}</PropertiesPanelButton>
    </NodeEditor>
  )
}

GroupNodeEditor.iconComponent = GridViewIcon

export default GroupNodeEditor
