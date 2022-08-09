import { Map as _Map } from '@mui/icons-material'

import { EditorComponentType } from './Util'

/** Just a placeholder for the navmesh editor, for now. */
export const NavMeshNodeEditor: EditorComponentType = (props) => {
  return null
  /*
  const { t } = useTranslation()
  const engineState = useEngineState()
  const entity = props.node.entity

  const hasError = engineState.errorEntities[entity].get()
  const errorComponent = getComponent(entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.navMesh.name')}
      description={t('editor:properties.navMesh.description')}
    >
    </NodeEditor>
  )
  */
}

NavMeshNodeEditor.iconComponent = _Map

export default NavMeshNodeEditor
