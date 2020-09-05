import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import RadianNumericInputGroup from "../inputs/RadianNumericInputGroup";
import { Math as _Math } from "three";
import LightShadowProperties from "./LightShadowProperties";
import { Bullseye } from "@styled-icons/fa-solid/Bullseye";
const radToDeg = _Math.radToDeg;
type SpotLightNodeEditorProps = {
  editor?: object,
  node?: object,
  multiEdit?: boolean
};
export default class SpotLightNodeEditor extends Component<{}, {}> {
  onChangeColor = color => {
    this.props.editor.setPropertySelected("color", color);
  };
  onChangeIntensity = intensity => {
    this.props.editor.setPropertySelected("intensity", intensity);
  };
  onChangeInnerConeAngle = innerConeAngle => {
    this.props.editor.setPropertySelected("innerConeAngle", innerConeAngle);
  };
  onChangeOuterConeAngle = outerConeAngle => {
    this.props.editor.setPropertySelected("outerConeAngle", outerConeAngle);
  };
  onChangeRange = range => {
    this.props.editor.setPropertySelected("range", range);
  };
  render() {
    const { node, editor } = this.props as any;
    return (
      <NodeEditor {...this.props} description={SpotLightNodeEditor.description}>
        <InputGroup name="Color">
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        <NumericInputGroup
          name="Intensity"
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={node.intensity}
          onChange={this.onChangeIntensity}
          unit="°"
        />
        <RadianNumericInputGroup
          name="Inner Cone Angle"
          min={0}
          max={radToDeg(node.outerConeAngle)}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={node.innerConeAngle}
          onChange={this.onChangeInnerConeAngle}
          unit="°"
        />
        <RadianNumericInputGroup
          name="Outer Cone Angle"
          min={radToDeg(node.innerConeAngle + 0.00001)}
          max={radToDeg(node.maxOuterConeAngle)}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={node.outerConeAngle}
          onChange={this.onChangeOuterConeAngle}
          unit="°"
        />
        <NumericInputGroup
          name="Range"
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={node.range}
          onChange={this.onChangeRange}
          unit="m"
        />
        <LightShadowProperties node={node} editor={editor} />
      </NodeEditor>
    );
  }
}
