import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import { Certificate } from "@styled-icons/fa-solid/Certificate";
type HemisphereLightNodeEditorProps = {
  editor?: object,
  node?: object
};
export default class HemisphereLightNodeEditor extends Component<
  HemisphereLightNodeEditorProps,
  {}
> {
  onChangeSkyColor = skyColor => {
    this.props.editor.setPropertySelected("skyColor", skyColor);
  };
  onChangeGroundColor = groundColor => {
    this.props.editor.setPropertySelected("groundColor", groundColor);
  };
  onChangeIntensity = intensity => {
    this.props.editor.setPropertySelected("intensity", intensity);
  };
  render() {
    const node = this.props.node;
    return (
      <NodeEditor
        {...this.props}
        description={HemisphereLightNodeEditor.description}
      >
        <InputGroup name="Sky Color">
          <ColorInput value={node.skyColor} onChange={this.onChangeSkyColor} />
        </InputGroup>
        <InputGroup name="Ground Color">
          <ColorInput
            value={node.groundColor}
            onChange={this.onChangeGroundColor}
          />
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
      </NodeEditor>
    );
  }
}
