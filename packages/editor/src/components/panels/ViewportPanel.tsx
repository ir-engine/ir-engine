import { LocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { TabData } from 'rc-dock'
import React from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { Vector2, Vector3 } from 'three'
import { ItemTypes } from '../../constants/AssetTypes'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { getCursorSpawnPosition } from '../../functions/screenSpaceFunctions'
import { EditorState } from '../../services/EditorServices'
import { SceneElementType } from '../element/ElementList'
import * as styles from '../styles.module.scss'

const ViewportDnD = () => {
  const [{ isDragging, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Component],
    collect: (monitor) => ({
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isOver: monitor.isOver()
    }),
    drop(item: SceneElementType, monitor) {
      const vec3 = new Vector3()
      getCursorSpawnPosition(monitor.getClientOffset() as Vector2, vec3)
      EditorControlFunctions.createObjectFromSceneElement([
        { name: item!.componentJsonID },
        { name: LocalTransformComponent.jsonID, props: { position: vec3 } }
      ])
    }
  })

  return (
    <div
      id="viewport-panel"
      ref={dropRef}
      style={{
        pointerEvents: isDragging ? 'all' : 'none',
        border: isDragging && isOver ? '5px solid white' : 'none',
        width: '100%',
        height: '100%'
      }}
    />
  )
}

const ViewPortPanelContent = () => {
  const { t } = useTranslation()
  const sceneName = useHookstate(getMutableState(EditorState).sceneName).value
  return sceneName ? (
    <ViewportDnD />
  ) : (
    <div className={styles.bgImageBlock}>
      <img src="/static/etherealengine.png" alt="" />
      <h2>{t('editor:selectSceneMsg')}</h2>
    </div>
  )
}

export const ViewportPanelTab: TabData = {
  id: 'viewPanel',
  closable: true,
  title: 'Viewport',
  content: <ViewPortPanelContent />
}
