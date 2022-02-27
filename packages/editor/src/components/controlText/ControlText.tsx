import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import styles from './styles.module.scss'
import EditorEvents from '../../constants/EditorEvents'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { FlyControlComponent } from '../../classes/FlyControlComponent'

/**
 * ControlText used to render viewport.
 *
 * @author Robert Long
 * @constructor
 */
export function ControlText() {
  const [flyModeEnabled, setFlyModeEnabled] = useState<boolean>(false)
  const [objectSelected, setObjectSelected] = useState(false)
  const [transformMode, setTransformMode] = useState(null)
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
    CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), onEditorInitialized)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), onSelectionChanged)
      CommandManager.instance.removeListener(EditorEvents.FLY_MODE_CHANGED.toString(), onFlyModeChanged)
      CommandManager.instance.removeListener(EditorEvents.TRANSFROM_MODE_CHANGED.toString(), onTransformModeChanged)
    }
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

  return <div className={styles.controlsText}>{controlsText}</div>
}
