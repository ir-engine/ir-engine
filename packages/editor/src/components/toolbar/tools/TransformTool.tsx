import React, { useEffect, useState } from 'react'
import { ArrowsAlt } from '@styled-icons/fa-solid/ArrowsAlt'
import { ArrowsAltV } from '@styled-icons/fa-solid/ArrowsAltV'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import { TransformMode, TransformModeType } from '@xrengine/engine/src/scene/constants/transformConstants'

import * as styles from '../styles.module.scss'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'
import { InfoTooltip } from '../../layout/Tooltip'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SceneManager } from '../../../managers/SceneManager'
import { EditorControlComponent } from '../../../classes/EditorControlComponent'
import { setTransformMode } from '../../../systems/EditorControlSystem'

const TransformTool = () => {
  const [transformMode, changeTransformMode] = useState<TransformModeType>(TransformMode.Translate)

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.TRANSFROM_MODE_CHANGED.toString(), updateTransformMode)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.TRANSFROM_MODE_CHANGED.toString(), updateTransformMode)
    }
  }, [])

  const updateTransformMode = () => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    changeTransformMode(editorControlComponent.transformMode)
  }

  return (
    <div className={styles.toolbarInputGroup}>
      <InfoTooltip id="translate-button" info="[T] Translate" position="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Translate ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Translate)}
        >
          <ArrowsAlt size={12} />
        </button>
      </InfoTooltip>
      <InfoTooltip id="rotate-button" info="[R] Rotate" position="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Rotate ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Rotate)}
        >
          <SyncAlt size={12} />
        </button>
      </InfoTooltip>
      <InfoTooltip id="scale-button" info="[Y] Scale" position="bottom">
        <button
          className={styles.toolButton + ' ' + (transformMode === TransformMode.Scale ? styles.selected : '')}
          onClick={() => setTransformMode(TransformMode.Scale)}
        >
          <ArrowsAltV size={12} />
        </button>
      </InfoTooltip>
    </div>
  )
}

export default TransformTool
