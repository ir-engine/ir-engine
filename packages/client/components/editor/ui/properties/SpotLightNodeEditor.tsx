import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import RadianNumericInputGroup from "../inputs/RadianNumericInputGroup";
import { MathUtils as _Math } from "three";
import LightShadowProperties from "./LightShadowProperties";
import { Bullseye } from "@styled-icons/fa-solid/Bullseye";
const radToDeg = _Math.radToDeg;
type SpotLightNodeEditorProps = {
  editor?: object;
  node?: object;
  multiEdit?: boolean;
};
export default class SpotLightNodeEditor extends Component<{}, {}> {
  onChangeColor = color => {
    (this.props as any).editor.setPropertySelected("color", color);
  };
  onChangeIntensity = intensity => {
    (this.props as any).editor.setPropertySelected("intensity", intensity);
  };
  onChangeInnerConeAngle = innerConeAngle => {
    (this.props as any).editor.setPropertySelected("innerConeAngle", innerConeAngle);
  };
  onChangeOuterConeAngle = outerConeAngle => {
    (this.props as any).editor.setPropertySelected("outerConeAngle", outerConeAngle);
  };
  onChangeRange = range => {
    (this.props as any).editor.setPropertySelected("range", range);
  };
  render() {
    const { node, editor } = this.props as any;
    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={SpotLightNodeEditor.description}>
        { /* @ts-ignore */ }
        <InputGroup name="Color">
        { /* @ts-ignore */ }
          <ColorInput value={node.color} onChange={this.onChangeColor} />
          { /* @ts-ignore */ }
        </InputGroup>
        { /* @ts-ignore */ }
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
        { /* @ts-ignore */ }
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
        { /* @ts-ignore */ }
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
        { /* @ts-ignore */ }
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
