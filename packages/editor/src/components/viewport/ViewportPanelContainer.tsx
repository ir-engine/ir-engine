import { useState as useHookstate } from '@hookstate/core'
import React, { useCallback, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'

import editorTheme from '@xrengine/client-core/src/util/theme'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import { FlyControlComponent } from '../../classes/FlyControlComponent'
import { AssetTypes, ItemTypes } from '../../constants/AssetTypes'
import EditorEvents from '../../constants/EditorEvents'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'
import { accessEditorState, useEditorState } from '../../services/EditorServices'
import AssetDropZone from '../assets/AssetDropZone'
import { addAssetAtCursorPositionOnDrop } from '../dnd'
import * as styles from './Viewport.module.scss'

/**
 * ViewportPanelContainer used to render viewport.
 *
 * @author Robert Long
 * @constructor
 */
export function ViewportPanelContainer() {
  const [flyModeEnabled, setFlyModeEnabled] = useState<boolean>(false)
  const [objectSelected, setObjectSelected] = useState(false)
  const [transformMode, setTransformMode] = useState(null)
  const sceneLoaded = useHookstate(accessEditorState().sceneName)
  // const [showStats, setShowStats] = useState(false);
  const { t } = useTranslation()

  const onSelectionChanged = useCallback(() => {
    setObjectSelected(CommandManager.instance.selected.length > 0)
  }, [])

  const onFlyModeChanged = useCallback(() => {
    const flyControlComponent = getComponent(SceneManager.instance.editorEntity, FlyControlComponent)
    setFlyModeEnabled(flyControlComponent.enable)
  }, [])

  const onTransformModeChanged = useCallback((mode) => {
    setTransformMode(mode)
  }, [])

  const onEditorInitialized = useCallback(() => {
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), onSelectionChanged)
    CommandManager.instance.addListener(EditorEvents.FLY_MODE_CHANGED.toString(), onFlyModeChanged)
    CommandManager.instance.addListener(EditorEvents.TRANSFROM_MODE_CHANGED.toString(), onTransformModeChanged)
    CommandManager.instance.removeListener(EditorEvents.RENDERER_INITIALIZED.toString(), onEditorInitialized)
  }, [])

  useEffect(() => {
    const initRenderer = () => SceneManager.instance.initializeRenderer()

    CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), onEditorInitialized)
    CommandManager.instance.addListener(EditorEvents.PROJECT_LOADED.toString(), initRenderer)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.PROJECT_LOADED.toString(), initRenderer)
      CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), onSelectionChanged)
      CommandManager.instance.removeListener(EditorEvents.FLY_MODE_CHANGED.toString(), onFlyModeChanged)
      CommandManager.instance.removeListener(EditorEvents.TRANSFROM_MODE_CHANGED.toString(), onTransformModeChanged)

      SceneManager.instance.dispose()
    }
  }, [])

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Node, ...AssetTypes],
    drop(item: any, monitor) {
      const mousePos = monitor.getClientOffset()

      if (item.type === ItemTypes.Node) {
        if (item.multiple) {
          SceneManager.instance.reparentToSceneAtCursorPosition(item.value, mousePos)
        } else {
          SceneManager.instance.reparentToSceneAtCursorPosition([item.value], mousePos)
        }

        return
      }
      addAssetAtCursorPositionOnDrop(item, mousePos)
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  const onAfterUploadAssets = useCallback((assets) => {
    Promise.all(
      assets.map((url) => {
        CommandManager.instance.addMedia(url)
      })
    ).catch((err) => {
      CommandManager.instance.emitEvent(EditorEvents.ERROR, err)
    })
  }, [])

  let controlsText

  if (flyModeEnabled) {
    controlsText =
      '[W][A][S][D] ' + t('editor:viewport.command.movecamera') + ' | [Shift] ' + t('editor:viewport.command.flyFast')
  } else {
    controlsText =
      '[LMB] ' +
      t('editor:viewport.command.orbit') +
      ' | [MMB] ' +
      t('editor:viewport.command.pan') +
      ' | [RMB] ' +
      t('editor:viewport.command.fly')
  }

  if (objectSelected) {
    controlsText +=
      ' | [F] ' +
      t('editor:viewport.command.focus') +
      ' | [Q] ' +
      t('editor:viewport.command.rotateLeft') +
      ' | [E] ' +
      t('editor:viewport.command.rotateRight')
  }

  if (transformMode === TransformMode.Placement) {
    controlsText += ' | [ESC / G] ' + t('editor:viewport.command.cancelPlacement')
  } else if (transformMode === TransformMode.Grab) {
    controlsText +=
      ' | [Shift + Click] ' +
      t('editor:viewport.command.placeDuplicate') +
      ' | [ESC / G] ' +
      t('editor:viewport.command.cancelGrab')
  } else if (objectSelected) {
    controlsText +=
      '| [G] ' + t('editor:viewport.command.grab') + ' | [ESC] ' + t('editor:viewport.command.deselectAll')
  }

  return (
    <div
      className={styles.viewportContainer}
      style={{
        borderColor: isOver ? (canDrop ? editorTheme.blue : editorTheme.red) : 'transparent',
        backgroundColor: sceneLoaded.value ? undefined! : 'grey'
      }}
      ref={dropRef}
    >
      {!sceneLoaded.value && (
        <img style={{ opacity: 0.2 }} className={styles.viewportBackgroundImage} src="/static/xrengine.png" />
      )}
      <div className={styles.controlsText}>{controlsText}</div>
      <AssetDropZone afterUpload={onAfterUploadAssets} />
    </div>
  )
}
export default ViewportPanelContainer
