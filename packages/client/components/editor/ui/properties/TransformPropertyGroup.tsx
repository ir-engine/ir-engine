import React, { Component } from "react";
import { Vector3 } from "three";
import PropertyGroup from "./PropertyGroup";
import InputGroup from "../inputs/InputGroup";
import Vector3Input from "../inputs/Vector3Input";
import EulerInput from "../inputs/EulerInput";
type TransformPropertyGroupProps = {
  editor?: object;
  node?: object;
};
export default class TransformPropertyGroup extends Component<
  TransformPropertyGroupProps,
  {}
> {
  translation: Vector3;
  constructor(props: any) {
    super(props);
    this.translation = new Vector3();
  }
  shouldComponentUpdate(nextProps) {
    return nextProps.node !== this.props.node;
  }
  componentDidMount() {
    (this.props.editor as any).addListener("objectsChanged", this.onObjectsChanged);
  }
  componentWillUnmount() {
    (this.props.editor as any).removeListener("objectsChanged", this.onObjectsChanged);
  }
  onObjectsChanged = (objects, property) => {
    for (let i = 0; i < objects.length; i++) {
      if (
        objects[i] === this.props.node &&
        (property === "position" ||
          property === "rotation" ||
          property === "scale" ||
          property === "matrix" ||
          property == null)
      ) {
        this.forceUpdate();
        return;
      }
    }
  };
  onChangePosition = value => {
    this.translation.subVectors(value, (this.props.node as any).position);
    (this.props.editor as any).translateSelected(this.translation);
  };
  onChangeRotation = value => {
    (this.props.editor as any).setRotationSelected(value);
  };
  onChangeScale = value => {
    (this.props.editor as any).setScaleSelected(value);
  };
  render() {
    const { node } = this.props as any;
    return (
      <PropertyGroup name="Transform">
        { /* @ts-ignore */ }
        <InputGroup name="Position">
          <Vector3Input
            value={node.position}
            /* @ts-ignore */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangePosition}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Rotation">
          <EulerInput
            value={node.rotation}
            onChange={this.onChangeRotation}
            /* @ts-ignore */
            unit="°"
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Scale">
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
    );
  }
}
