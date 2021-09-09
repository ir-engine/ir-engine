import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import AssetDropZone from '../assets/AssetDropZone'
import { EditorContext } from '../contexts/EditorContext'
import { addAssetAtCursorPositionOnDrop, AssetTypes, ItemTypes } from '../dnd'
import * as styles from './Viewport.module.scss'
import editorTheme from '../theme'

/**
 * ViewportPanelContainer used to render viewport.
 *
 * @author Robert Long
 * @constructor
 */
export function ViewportPanelContainer() {
  const editor = useContext(EditorContext)
  const canvasRef = React.createRef<HTMLCanvasElement>()
  const [flyModeEnabled, setFlyModeEnabled] = useState(false)
  const [objectSelected, setObjectSelected] = useState(false)
  const [transformMode, setTransformMode] = useState(null)
  // const [showStats, setShowStats] = useState(false);
  const { t } = useTranslation()

  const onSelectionChanged = useCallback(() => {
    setObjectSelected(editor?.selected.length > 0)
  }, [])

  const onFlyModeChanged = useCallback(() => {
    setFlyModeEnabled(editor?.flyControls.enabled)
  }, [])

  const onTransformModeChanged = useCallback((mode) => {
    setTransformMode(mode)
  }, [])

  const onEditorInitialized = useCallback(() => {
    editor.addListener('selectionChanged', onSelectionChanged)
    editor.editorControls.addListener('flyModeChanged', onFlyModeChanged)
    editor.editorControls.addListener('transformModeChanged', onTransformModeChanged)
  }, [editor])

  useEffect(() => {
    if (!editor) return

    editor.addListener('initialized', onEditorInitialized)
    editor.initializeRenderer(canvasRef.current)

    return () => {
      editor.removeListener('selectionChanged', onSelectionChanged)

      if (editor.editorControls) {
        editor.editorControls.removeListener('flyModeChanged', onFlyModeChanged)
        editor.editorControls.removeListener('transformModeChanged', onTransformModeChanged)
      }

      if (editor.renderer) {
        editor.renderer.dispose()
      }
    }
  }, [editor])

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Node, ...AssetTypes],
    drop(item: any, monitor) {
      const mousePos = monitor.getClientOffset()

      if (item.type === ItemTypes.Node) {
        if (item.multiple) {
          editor.reparentToSceneAtCursorPosition(item.value, mousePos)
        } else {
          editor.reparentToSceneAtCursorPosition([item.value], mousePos)
        }

        return
      }
      addAssetAtCursorPositionOnDrop(editor, item, mousePos)
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  const onAfterUploadAssets = useCallback(
    (assets) => {
      Promise.all(
        assets.map(({ url, name, id }) => {
          editor.addMedia({ url, name, id })
        })
      ).catch((err) => {
        editor.emit('error', err)
      })
    },
    [editor]
  )

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
        borderColor: isOver ? canDrop ? editorTheme.blue : editorTheme.red : 'transparent'
      }}
      ref={dropRef}
    >
      <canvas className={styles.viewportCanvas} ref={canvasRef} tabIndex={-1} id="viewport-canvas" />
      <div className={styles.controlsText}>{controlsText}</div>
      <AssetDropZone afterUpload={onAfterUploadAssets} />
    </div>
  )
}
export default ViewportPanelContainer
