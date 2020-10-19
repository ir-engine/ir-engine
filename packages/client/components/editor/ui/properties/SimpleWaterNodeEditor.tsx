import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Water } from "@styled-icons/fa-solid/Water";
import NumericInputGroup from "../inputs/NumericInputGroup";
import ColorInput from "../inputs/ColorInput";
import InputGroup from "../inputs/InputGroup";
import Vector2Input from "../inputs/Vector2Input";
type SimpleWaterNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class SimpleWaterNodeEditor extends Component<
  SimpleWaterNodeEditorProps,
  {}
> {
  static iconComponent = Water;
  static description = "Renders a water plane.";
  onChangeColor = color => {
    (this.props.editor as any).setPropertySelected("color", color);
  };
  onChangeOpacity = opacity => {
    (this.props.editor as any).setPropertySelected("opacity", opacity);
  };
  onChangeTideHeight = tideHeight => {
    (this.props.editor as any).setPropertySelected("tideHeight", tideHeight);
  };
  onChangeTideScale = tideScale => {
    (this.props.editor as any).setPropertySelected("tideScale", tideScale);
  };
  onChangeTideSpeed = tideSpeed => {
    (this.props.editor as any).setPropertySelected("tideSpeed", tideSpeed);
  };
  onChangeWaveHeight = waveHeight => {
    (this.props.editor as any).setPropertySelected("waveHeight", waveHeight);
  };
  onChangeWaveScale = waveScale => {
    (this.props.editor as any).setPropertySelected("waveScale", waveScale);
  };
  onChangeWaveSpeed = waveSpeed => {
    (this.props.editor as any).setPropertySelected("waveSpeed", waveSpeed);
  };
  onChangeRipplesScale = ripplesScale => {
    (this.props.editor as any).setPropertySelected("ripplesScale", ripplesScale);
  };
  onChangeRipplesSpeed = ripplesSpeed => {
    (this.props.editor as any).setPropertySelected("ripplesSpeed", ripplesSpeed);
  };
  render() {
    const node = this.props.node as any;
    return (
      /* @ts-ignore */ 
      <NodeEditor {...this.props} description={SimpleWaterNodeEditor.description} >
        { /* @ts-ignore */ }
        <InputGroup name="Color">
        { /* @ts-ignore */ }
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Opacity"
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          min={0}
          max={1}
          value={node.opacity}
          onChange={this.onChangeOpacity}
        />
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Tide Height"
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          min={0}
          value={node.tideHeight}
          onChange={this.onChangeTideHeight}
        />
        { /* @ts-ignore */ }
        <InputGroup name="Tide Scale">
          <Vector2Input
          // @ts-ignore
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            value={node.tideScale}
            onChange={this.onChangeTideScale}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Tide Speed">
          <Vector2Input
          // @ts-ignore
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            value={node.tideSpeed}
            onChange={this.onChangeTideSpeed}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Wave Height"
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          min={0}
          value={node.waveHeight}
          onChange={this.onChangeWaveHeight}
        />
        { /* @ts-ignore */ }
        <InputGroup name="Wave Scale">
        { /* @ts-ignore */ }
          <Vector2Input
          /* @ts-ignore */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            value={node.waveScale}
            onChange={this.onChangeWaveScale}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Wave Speed">
          <Vector2Input
          /* @ts-ignore */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            value={node.waveSpeed}
            onChange={this.onChangeWaveSpeed}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Ripples Speed"
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          value={node.ripplesSpeed}
          onChange={this.onChangeRipplesSpeed}
        />
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Ripples Scale"
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          value={node.ripplesScale}
          onChange={this.onChangeRipplesScale}
        />
      </NodeEditor>
    );
  }
}
