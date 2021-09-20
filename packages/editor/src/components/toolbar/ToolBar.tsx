import { Pause } from '@styled-icons/fa-solid'
import { ArrowsAlt } from '@styled-icons/fa-solid/ArrowsAlt'
import { ArrowsAltV } from '@styled-icons/fa-solid/ArrowsAltV'
import { Bullseye } from '@styled-icons/fa-solid/Bullseye'
import { ChartArea } from '@styled-icons/fa-solid/ChartArea'
import { Globe } from '@styled-icons/fa-solid/Globe'
import { Magnet } from '@styled-icons/fa-solid/Magnet'
import { Play } from '@styled-icons/fa-solid/Play'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import { TransformSpace } from '../../constants/TransformSpace'
import { SnapMode } from '../../controls/EditorControls'
import { TransformMode, TransformPivot } from '@xrengine/engine/src/scene/constants/transformConstants'
import React, { Component, ReactNode, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import EditorEvents from '../../constants/EditorEvents'
import { ControlManager } from '../../managers/ControlManager'
import { SceneManager } from '../../managers/SceneManager'
import { Button } from '../inputs/Button'
import SelectInput from '../inputs/SelectInput'
import { InfoTooltip } from '../layout/Tooltip'
import MainMenu from '../mainMenu'
import styledTheme from '../theme'
import ToolButton from './ToolButton'
import GridTool from './tools/GridTool'
import { CommandManager } from '../../managers/CommandManager'
import Stats from './tools/Stats'
/**
 *
 * @author Robert Long
 */
const StyledToolbar = (styled as any).div`
  display: flex;
  flex-direction: row;
  height: 40px;
  width:100%;
  position: fixed;
  z-index:10000;
  user-select: none;
`

/**
 *
 * @author Robert Long
 */
const ToolButtons = (styled as any).div`
  width: auto;
  height: inherit;
  display: flex;
  flex-direction: row;
`

/**
 *
 * @author Robert Long
 */
const ToolToggles = (styled as any).div`
  width: auto;
  height: inherit;
  display: flex;
  flex-direction: row;
  background-color: ${(props) => props.theme.toolbar2};
  align-items: center;
  padding: 0 16px;
`

/**
 *
 * @author Robert Long
 */
const Spacer = (styled as any).div`
  flex: 1;
`

/**
 *
 * @author Robert Long
 */
const PublishButton = (styled as any)(Button)`
  align-self: center;
  margin: 1em;
  padding: 0 2em;
`

/**
 *
 * @author Robert Long
 */
const snapInputStyles = {
  container: (base) => ({
    ...base,
    width: '80px'
  }),
  control: (base) => ({
    ...base,
    backgroundColor: styledTheme.inputBackground,
    minHeight: '24px',
    borderRadius: '0px',
    borderWidth: '0px',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'none'
  })
}

/**
 *
 * @author Robert Long
 */
const rightSnapInputStyles = {
  container: (base) => ({
    ...base,
    width: '80px'
  }),
  control: (base) => ({
    ...base,
    backgroundColor: styledTheme.inputBackground,
    minHeight: '24px',
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
    borderWidth: '0px 0px 0px 1px',
    borderColor: styledTheme.border,
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'none',
    ':hover': {
      borderColor: styledTheme.border
    }
  })
}

/**
 *
 * @author Robert Long
 */
const selectInputStyles = {
  container: (base) => ({
    ...base,
    width: '100px'
  }),
  control: (base) => ({
    ...base,
    backgroundColor: styledTheme.inputBackground,
    minHeight: '24px',
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
    borderWidth: '0px',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'none'
  })
}

/**
 *
 * @author Robert Long
 */
const StyledToggleButton = (styled as any).div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background-color: ${(props) => (props.value ? props.theme.blue : props.theme.toolbar)};
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;

  :hover {
    background-color: ${(props) => props.theme.blueHover};
  }

  :active {
    background-color: ${(props) => props.theme.blue};
  }
`

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

const ViewportToolbarContainer = (styled as any).div`
  display: flex;
  justify-content: flex-end;
  flex: 1;
`

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
 * ViewportToolbar used as warpper for IconToggle, SelectInput.
 *
 * @author Robert Long
 * @param  {any} onToggleStats
 * @param  {any} showStats
 * @constructor
 */
function ViewportToolbar({ onToggleStats, showStats }) {
  const renderer = SceneManager.instance.renderer
  const [renderMode, setRenderMode] = useState(renderer && renderer.renderMode)

  const options = renderer
    ? renderer.renderModes.map((mode) => ({
        label: mode.name,
        value: mode
      }))
    : []

  useEffect(() => {
    const setRM = () => setRenderMode(SceneManager.instance.renderer.renderMode)
    CommandManager.instance.addListener(EditorEvents.INITIALIZED.toString(), setRM),
      () => CommandManager.instance.removeListener(EditorEvents.INITIALIZED.toString(), setRM)
  }, [])

  const onChangeRenderMode = useCallback(
    (mode) => {
      SceneManager.instance.renderer.setRenderMode(mode)
      setRenderMode(mode)
    },
    [setRenderMode]
  )

  // creating ToolBar view
  return (
    <ViewportToolbarContainer>
      <IconToggle onClick={onToggleStats} value={showStats} tooltip="Toggle Stats" icon={ChartArea} />
      <SelectInput value={renderMode} options={options} onChange={onChangeRenderMode} styles={selectInputStyles} />
    </ViewportToolbarContainer>
  )
}

type ToggleButtonProp = {
  tooltip?: ReactNode
  children?: ReactNode
  onClick?: Function
  value?: any
}

/**
 *
 * @author Robert Long
 * @param {any} tooltip
 * @param {any} children
 * @param {any} rest
 * @returns
 */
function ToggleButton({ tooltip, children, ...rest }: ToggleButtonProp) {
  return (
    <InfoTooltip info={tooltip}>
      <StyledToggleButton {...rest}>{children}</StyledToggleButton>
    </InfoTooltip>
  )
}

/**
 *
 * @author Robert Long
 */
const ToolbarInputGroup = (styled as any).div`
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 4px;
  margin: 0 4px;
`

/**
 *
 * @author Robert Long
 */
const translationSnapOptions = [
  { label: '0.1m', value: 0.1 },
  { label: '0.125m', value: 0.125 },
  { label: '0.25m', value: 0.25 },
  { label: '0.5m', value: 0.5 },
  { label: '1m', value: 1 },
  { label: '2m', value: 2 },
  { label: '4m', value: 4 }
]

/**
 *
 * @author Robert Long
 */
const rotationSnapOptions = [
  { label: '1°', value: 1 },
  { label: '5°', value: 5 },
  { label: '10°', value: 10 },
  { label: '15°', value: 15 },
  { label: '30°', value: 30 },
  { label: '45°', value: 45 },
  { label: '90°', value: 90 }
]

/**
 *
 * @author Robert Long
 */
const transformPivotOptions = [
  { label: 'Selection', value: TransformPivot.Selection },
  { label: 'Center', value: TransformPivot.Center },
  { label: 'Bottom', value: TransformPivot.Bottom }
]

/**
 *
 * @author Robert Long
 */
const transformSpaceOptions = [
  { label: 'Selection', value: TransformSpace.LocalSelection },
  { label: 'World', value: TransformSpace.World }
]

/**
 *
 * @author Robert Long
 */
const initialLocation = {
  id: null,
  name: '',
  maxUsersPerInstance: 10,
  sceneId: null,
  locationSettingsId: null,
  location_setting: {
    instanceMediaChatEnabled: false,
    videoEnabled: false,
    locationType: 'private'
  }
}
type ToolBarProps = {
  menu?: any
  onPublish?: Function
  isPublishedScene?: boolean
  onOpenScene?: Function
  queryParams?: any
}

/**
 *
 * @author Robert Long
 */
type ToolBarState = {
  locationModalOpen: any
  selectedLocation: any
  editorInitialized: boolean
  menuOpen: boolean
  locationEditing: boolean
  showStats: boolean
}

/**
 *
 * @author Robert Long
 */
export class ToolBar extends Component<ToolBarProps, ToolBarState> {
  constructor(props) {
    super(props)

    this.state = {
      editorInitialized: false,
      menuOpen: false,
      locationModalOpen: false,
      selectedLocation: initialLocation,
      locationEditing: false,
      showStats: false
    }
  }

  componentDidMount() {
    CommandManager.instance.addListener(EditorEvents.INITIALIZED.toString(), this.onEditorInitialized)
    CommandManager.instance.addListener(EditorEvents.PLAY_MODE_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.addListener(EditorEvents.SETTINGS_CHANGED.toString(), this.onForceUpdate)
  }

  componentWillUnmount() {
    CommandManager.instance.removeListener(EditorEvents.INITIALIZED.toString(), this.onEditorInitialized)
    CommandManager.instance.removeListener(EditorEvents.TRANSFROM_MODE_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.removeListener(EditorEvents.TRANSFORM_SPACE_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.removeListener(EditorEvents.TRANSFORM_PIVOT_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.removeListener(EditorEvents.SNAP_SETTINGS_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.removeListener(EditorEvents.PLAY_MODE_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.removeListener(EditorEvents.SETTINGS_CHANGED.toString(), this.onForceUpdate)
  }

  onEditorInitialized = () => {
    CommandManager.instance.addListener(EditorEvents.TRANSFROM_MODE_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.addListener(EditorEvents.TRANSFORM_SPACE_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.addListener(EditorEvents.TRANSFORM_PIVOT_CHANGED.toString(), this.onForceUpdate)
    CommandManager.instance.addListener(EditorEvents.SNAP_SETTINGS_CHANGED.toString(), this.onForceUpdate)
    this.setState({ editorInitialized: true })
  }

  onForceUpdate = () => {
    this.forceUpdate()
  }

  onSelectTranslate = () => {
    ControlManager.instance.editorControls.setTransformMode(TransformMode.Translate)
  }

  onSelectRotate = () => {
    ControlManager.instance.editorControls.setTransformMode(TransformMode.Rotate)
  }

  onSelectScale = () => {
    ControlManager.instance.editorControls.setTransformMode(TransformMode.Scale)
  }

  onToggleTransformSpace = () => {
    ControlManager.instance.editorControls.toggleTransformSpace()
  }

  onChangeTransformSpace = (value) => {
    ControlManager.instance.editorControls.setTransformSpace(value)
  }

  onChangeTransformPivot = (transformPivot) => {
    ControlManager.instance.editorControls.setTransformPivot(transformPivot)
  }

  onToggleTransformPivot = () => {
    ControlManager.instance.editorControls.changeTransformPivot()
  }

  onToggleSnapMode = () => {
    ControlManager.instance.editorControls.toggleSnapMode()
  }

  onChangeTranslationSnap = (translationSnap) => {
    ControlManager.instance.editorControls.setTranslationSnap(parseFloat(translationSnap))
    ControlManager.instance.editorControls.setSnapMode(SnapMode.Grid)
  }

  onChangeScaleSnap = (scaleSnap) => {
    ControlManager.instance.editorControls.setScaleSnap(scaleSnap)
  }

  onChangeRotationSnap = (rotationSnap) => {
    ControlManager.instance.editorControls.setRotationSnap(parseFloat(rotationSnap))
    ControlManager.instance.editorControls.setSnapMode(SnapMode.Grid)
  }

  onTogglePlayMode = () => {
    if (ControlManager.instance.isInPlayMode) {
      ControlManager.instance.leavePlayMode()
    } else {
      ControlManager.instance.enterPlayMode()
    }
  }

  render() {
    const { editorInitialized, menuOpen } = this.state as any

    if (!editorInitialized) {
      return <StyledToolbar />
    }

    const { transformMode, transformSpace, transformPivot, snapMode, translationSnap, rotationSnap } =
      ControlManager.instance.editorControls

    const queryParams = (this.props as any).queryParams

    return (
      <StyledToolbar>
        <ToolButtons>
          <MainMenu commands={this.props.menu} />
          <ToolButton
            id="translate-button"
            tooltip="[T] Translate"
            icon={ArrowsAlt}
            onClick={this.onSelectTranslate}
            isSelected={transformMode === TransformMode.Translate}
          />
          <ToolButton
            id="rotate-button"
            tooltip="[R] Rotate"
            icon={SyncAlt}
            onClick={this.onSelectRotate}
            isSelected={transformMode === TransformMode.Rotate}
          />
          <ToolButton
            id="scale-button"
            tooltip="[Y] Scale"
            icon={ArrowsAltV}
            onClick={this.onSelectScale}
            isSelected={transformMode === TransformMode.Scale}
          />
        </ToolButtons>
        <ToolToggles>
          <ToolbarInputGroup id="transform-space">
            <InfoTooltip info="[Z] Toggle Transform Space" position="bottom">
              <ToggleButton onClick={this.onToggleTransformSpace}>
                <Globe size={12} />
              </ToggleButton>
            </InfoTooltip>
            <SelectInput
              styles={selectInputStyles}
              onChange={this.onChangeTransformSpace}
              options={transformSpaceOptions}
              value={transformSpace}
            />
          </ToolbarInputGroup>
          <ToolbarInputGroup id="transform-pivot">
            <ToggleButton onClick={this.onToggleTransformPivot} tooltip="[X] Toggle Transform Pivot">
              <Bullseye size={12} />
            </ToggleButton>
            <SelectInput
              styles={selectInputStyles}
              onChange={this.onChangeTransformPivot}
              options={transformPivotOptions}
              value={transformPivot}
            />
          </ToolbarInputGroup>
          <ToolbarInputGroup id="transform-snap">
            <ToggleButton
              value={snapMode === SnapMode.Grid}
              onClick={this.onToggleSnapMode}
              tooltip={'[C] Toggle Snap Mode'}
            >
              <Magnet size={12} />
            </ToggleButton>
            <SelectInput
              styles={snapInputStyles}
              onChange={this.onChangeTranslationSnap}
              options={translationSnapOptions}
              value={translationSnap}
              placeholder={translationSnap + 'm'}
              formatCreateLabel={(value) => 'Custom: ' + value + 'm'}
              isValidNewOption={(value) => value.trim() !== '' && !isNaN(value)}
              creatable
            />
            <SelectInput
              styles={rightSnapInputStyles}
              onChange={this.onChangeRotationSnap}
              options={rotationSnapOptions}
              value={rotationSnap}
              placeholder={rotationSnap + '°'}
              formatCreateLabel={(value) => 'Custom: ' + value + '°'}
              isValidNewOption={(value) => value.trim() !== '' && !isNaN(value)}
              creatable
            />
          </ToolbarInputGroup>
          <GridTool />
          <ToolbarInputGroup id="preview">
            <ToggleButton
              onClick={this.onTogglePlayMode}
              tooltip={ControlManager.instance.isInPlayMode ? 'Stop Previewing Scene' : 'Preview Scene'}
            >
              {ControlManager.instance.isInPlayMode ? <Pause size={14} /> : <Play size={14} />}
            </ToggleButton>
          </ToolbarInputGroup>
          <ViewportToolbar
            onToggleStats={() => this.setState((prevState, pros) => ({ showStats: !prevState.showStats }))}
            showStats={this.state.showStats}
          />
        </ToolToggles>
        <Spacer />
        {this.state.showStats && <Stats />}
      </StyledToolbar>
    )
  }
}

export default ToolBar
