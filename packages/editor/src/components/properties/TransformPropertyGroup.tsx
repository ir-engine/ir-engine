import React, { Component } from 'react'
import PropertyGroup from './PropertyGroup'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import EulerInput from '../inputs/EulerInput'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorEvents from '../../constants/EditorEvents'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

/**
 * TransformPropertyGroupProps declaring properties for TransformPropertyGroup.
 *
 * @author Robert Long
 * @type {Object}
 */
type TransformPropertyGroupProps = {
  node?: any
  t: Function
}

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class TransformPropertyGroup extends Component<TransformPropertyGroupProps, {}> {
  //adding listener when component get mounted
  componentDidMount() {
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
  }

  //updating changes in properties
  shouldComponentUpdate(nextProps) {
    return nextProps.node !== this.props.node
  }

  //removing listener when component get unmount
  componentWillUnmount() {
    CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
  }

  //function to handle changes in property and force update
  onObjectsChanged = () => {
    this.forceUpdate()
  }

  //function to handle the position properties
  onChangePosition = (value) => {
    // CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.POSITION, { positions: value })
    const transformComponent = getComponent(this.props.node.eid, TransformComponent)
    transformComponent.position = value
    this.forceUpdate()
  }

  //function to handle changes rotation properties
  onChangeRotation = (value) => {
    // CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATION, { rotations: value })
    const transformComponent = getComponent(this.props.node.eid, TransformComponent)
    transformComponent.eulerRotation = value
    this.forceUpdate()
  }

  //function to handle changes in scale properties
  onChangeScale = (value) => {
    // CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.SCALE, {
    //   scales: value,
    //   overrideScale: true
    // })
    const transformComponent = getComponent(this.props.node.eid, TransformComponent)
    transformComponent.scale = value
    this.forceUpdate()
  }

  //rendering editor view for Transform properties
  render() {
    const { node } = this.props as any
    const transformComponent = getComponent(node.eid, TransformComponent)

    return (
      <PropertyGroup name={this.props.t('editor:properties.transform.title')}>
        <InputGroup name="Position" label={this.props.t('editor:properties.transform.lbl-postition')}>
          <Vector3Input
            value={transformComponent.position}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangePosition}
          />
        </InputGroup>
        <InputGroup name="Rotation" label={this.props.t('editor:properties.transform.lbl-rotation')}>
          <EulerInput value={transformComponent.eulerRotation} onChange={this.onChangeRotation} unit="°" />
        </InputGroup>
        <InputGroup name="Scale" label={this.props.t('editor:properties.transform.lbl-scale')}>
          <Vector3Input
            uniformScaling
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            value={transformComponent.scale}
            onChange={this.onChangeScale}
          />
        </InputGroup>
      </PropertyGroup>
    )
  }
}

export default withTranslation()(TransformPropertyGroup)
