import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import { FlyControlComponent } from '../../classes/FlyControlComponent'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'
import { useEditorState } from '../../services/EditorServices'
import { useModeState } from '../../services/ModeServices'
import { useSelectionState } from '../../services/SelectionServices'
import styles from './styles.module.scss'

/**
 * ControlText used to render viewport.
 *
 * @author Robert Long
 * @constructor
 */
export function ControlText() {
  const editorState = useEditorState()
  const selectionState = useSelectionState()
  const modeState = useModeState()
  const [editorInitialized, setEditorInitialized] = useState<boolean>(false)
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

  const onEditorInitialized = () => {
    setEditorInitialized(true)
  }

  useEffect(() => {
    if (editorInitialized && editorState.rendererInitialized.value) {
      onFlyModeChanged()
    }
  }, [modeState.flyModeChanged.value])

  useEffect(() => {
    if (editorInitialized && editorState.rendererInitialized.value) {
      onTransformModeChanged(modeState.transformMode.value)
    }
  }, [modeState.transformMode.value])

  useEffect(() => {
    if (editorInitialized && editorState.rendererInitialized.value) {
      onSelectionChanged()
    }
  }, [selectionState.selectionChanged.value])

  const initRenderer = () => SceneManager.instance.initializeRenderer()

  useEffect(() => {
    if (editorState.projectLoaded.value === true) {
      initRenderer()
    }
  }, [editorState.projectLoaded.value])

  useEffect(() => {
    if (editorState.rendererInitialized.value === true) {
      onEditorInitialized()
    } else {
      setEditorInitialized(false)
    }
  }, [editorState.rendererInitialized.value])

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
