import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import LightShadowProperties from "./LightShadowProperties";
import { Bolt } from "@styled-icons/fa-solid/Bolt";
type DirectionalLightNodeEditorProps = {
  editor?: object,
  node?: object
};
export default class DirectionalLightNodeEditor extends Component<
  DirectionalLightNodeEditorProps,
  {}
> {
  onChangeColor = color => {
    this.props.editor.setPropertySelected("color", color);
  };
  onChangeIntensity = intensity => {
    this.props.editor.setPropertySelected("intensity", intensity);
  };
  render() {
    const { node, editor } = this.props as any;
    return (
      <NodeEditor
        {...this.props}
        description={DirectionalLightNodeEditor.description}
      >
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
          unit="cd"
        />
        <LightShadowProperties node={node} editor={editor} />
      </NodeEditor>
    );
  }
}
