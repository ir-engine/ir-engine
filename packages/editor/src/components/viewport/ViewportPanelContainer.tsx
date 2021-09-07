import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import AssetDropZone from '../assets/AssetDropZone'
import { EditorContext } from '../contexts/EditorContext'
import { addAssetAtCursorPositionOnDrop, AssetTypes, ItemTypes } from '../dnd'
import { InfoTooltip } from '../layout/Tooltip'

/**
 * BorderColor used to get border color.
 *
 * @author Robert Long
 * @param  {any} props
 * @param  {any} defaultColor
 * @return {any} color
 */
function borderColor(props, defaultColor) {
  if (props.canDrop) {
    return props.theme.blue
  } else if (props.error) {
    return props.theme.error
  } else {
    return defaultColor
  }
}

/**
 * styled component created using canvas to show the viewport.
 *
 * @author Robert Long
 */
export const Viewport = (styled as any).canvas`
  width: 100%;
  height: 100%;
  position: relative;
`

/**
 * ViewportContainer used as wrapper element for Viewport, ControlsText.
 *
 * @author Robert Long
 * @type {[Styled component]}
 */
export const ViewportContainer = (styled as any).div`
  display: flex;
  flex: 1;
  position: relative;

  ::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    content: "";
    pointer-events: none;
    border: 1px solid ${(props) => borderColor(props, 'transparent')};
  }
`

/**
 * ControlsText used to show the control keys.
 *
 * @author Robert Long
 * @type {[Styled component]}
 */
const ControlsText = (styled as any).div`
  position: absolute;
  bottom:0px;
  left: 0;
  pointer-events: none;
  color: white;
  padding: 8px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
`

/**
 * ViewportToolbarContainer used to show title and options for view port.
 *
 * @author Robert Long
 * @type {[styled component]}
 */
// const ViewportToolbarContainer = (styled as any).div`
//   display: flex;
//   justify-content: flex-end;
//   flex: 1;
// `;

/**
 * ToolbarIconContainer provides the styles for icon placed in toolbar.
 *
 * @author Robert Long
 * @param {any} styled
 */
const ToolbarIconContainer = (styled as any).div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  background-color: ${(props) => (props.value ? props.theme.blue : 'transparent')};
  cursor: pointer;

  :hover {
    background-color: ${(props) => (props.value ? props.theme.blueHover : props.theme.hover)};
  }

  :active {
    background-color: ${(props) => (props.value ? props.theme.bluePressed : props.theme.hover2)};
  }
`

/**
 * IconToggle used to show stats when we click on it, and shows the tooltip info if we hover over the icon.
 *
 * @author      Robert Long
 * @param       {Icon} icon
 * @param       {any} value
 * @param       {[function]} onClick
 * @param       {any} tooltip
 * @param       {any} rest
 * @constructor
 */
function IconToggle({ icon: Icon, value, onClick, tooltip, ...rest }) {
  const onToggle = useCallback(() => {
    onClick(!value)
  }, [value, onClick])

  return (
    <InfoTooltip info={tooltip}>
      <ToolbarIconContainer onClick={onToggle} value={value} {...rest}>
        <Icon size={14} />
      </ToolbarIconContainer>
    </InfoTooltip>
  )
}

/**
 * ViewportPanelContainer used to render viewport.
 *
 * @author Robert Long
 * @constructor
 */
export function ViewportPanelContainer() {
  const editor = useContext(EditorContext)
  const canvasRef = React.createRef()
  const [flyModeEnabled, setFlyModeEnabled] = useState(false)
  const [objectSelected, setObjectSelected] = useState(false)
  const [transformMode, setTransformMode] = useState(null)
  // const [showStats, setShowStats] = useState(false);
  const { t } = useTranslation()

  const onSelectionChanged = useCallback(() => {
    setObjectSelected(editor.selected.length > 0)
  }, [editor])

  const onFlyModeChanged = useCallback(() => {
    setFlyModeEnabled(editor.flyControls.enabled)
  }, [editor, setFlyModeEnabled])

  const onTransformModeChanged = useCallback((mode) => {
    setTransformMode(mode)
  }, [])

  const onEditorInitialized = useCallback(() => {
    editor.addListener('selectionChanged', onSelectionChanged)
    editor.editorControls.addListener('flyModeChanged', onFlyModeChanged)
    editor.editorControls.addListener('transformModeChanged', onTransformModeChanged)
  }, [editor, onSelectionChanged, onFlyModeChanged, onTransformModeChanged])

  const initEditor = () => {
    editor.addListener('initialized', onEditorInitialized)
    editor.initializeRenderer(canvasRef.current)

    return () => {
      editor.removeListener('selectionChanged', onSelectionChanged)

      if (editor.editorControls) {
        editor.editorControls.removeListener('flyModeChanged', onFlyModeChanged)
      }

      if (editor.renderer) {
        editor.renderer.dispose()
      }
    }
  }
  useEffect(initEditor, [])

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
    <ViewportContainer error={isOver && !canDrop} canDrop={isOver && canDrop} ref={dropRef}>
      <Viewport ref={canvasRef} tabIndex="-1" />
      <ControlsText>{controlsText}</ControlsText>
      <AssetDropZone afterUpload={onAfterUploadAssets} />
    </ViewportContainer>
  )
}
export default ViewportPanelContainer
