import React, { Component } from 'react'
import { Vector3 } from 'three'
import PropertyGroup from './PropertyGroup'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import EulerInput from '../inputs/EulerInput'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'

/**
 * TransformPropertyGroupProps declaring properties for TransformPropertyGroup.
 *
 * @author Robert Long
 * @type {Object}
 */
type TransformPropertyGroupProps = {
  editor?: object
  node?: object
  t: Function
}

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class TransformPropertyGroup extends Component<TransformPropertyGroupProps, {}> {
  //setting the properties and translation of component
  constructor(props: any) {
    super(props)
    this.translation = new Vector3()
  }

  //adding listener when component get mounted
  componentDidMount() {
    ;(this.props.editor as any).addListener('objectsChanged', this.onObjectsChanged)
  }

  //updating changes in properties
  shouldComponentUpdate(nextProps) {
    return nextProps.node !== this.props.node
  }

  //removing listener when component get unmount
  componentWillUnmount() {
    ;(this.props.editor as any).removeListener('objectsChanged', this.onObjectsChanged)
  }

  //setting translation
  translation: Vector3

  //function to handle changes in property and force update
  onObjectsChanged = (objects, property) => {
    for (let i = 0; i < objects.length; i++) {
      if (
        objects[i] === this.props.node &&
        (property === 'position' ||
          property === 'rotation' ||
          property === 'scale' ||
          property === 'matrix' ||
          property == null)
      ) {
        this.forceUpdate()
        return
      }
    }
  }

  //function to handle the position properties
  onChangePosition = (value) => {
    this.translation.subVectors(value, (this.props.node as any).position)
    ;(this.props.editor as any).translateSelected(this.translation)
  }

  //function to handle changes rotation properties
  onChangeRotation = (value) => {
    ;(this.props.editor as any).setRotationSelected(value)
  }

  //function to handle changes in scale properties
  onChangeScale = (value) => {
    ;(this.props.editor as any).setScaleSelected(value)
  }

  //rendering editor view for Transform properties
  render() {
    const { node } = this.props as any
    return (
      <PropertyGroup name={this.props.t('editor:properties.transform.title')}>
        {/* @ts-ignore */}
        <InputGroup name="Position" label={this.props.t('editor:properties.transform.lbl-postition')}>
          <Vector3Input
            value={node.position}
            /* @ts-ignore */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangePosition}
          />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Rotation" label={this.props.t('editor:properties.transform.lbl-rotation')}>
          <EulerInput
            value={node.rotation}
            onChange={this.onChangeRotation}
            /* @ts-ignore */
            unit="°"
          />
        </InputGroup>
        {/* @ts-ignore */}
        <InputGroup name="Scale" label={this.props.t('editor:properties.transform.lbl-scale')}>
          <Vector3Input
            uniformScaling
            /* @ts-ignore */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            value={node.scale}
            onChange={this.onChangeScale}
          />
        </InputGroup>
      </PropertyGroup>
    )
  }
}

export default withTranslation()(TransformPropertyGroup)
