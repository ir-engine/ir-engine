import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import ColorInput from "../inputs/ColorInput";
import InputGroup from "../inputs/InputGroup";
import ImageInput from "../inputs/ImageInput";
import CompoundNumericInput from "../inputs/CompoundNumericInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import Vector3Input from "../inputs/Vector3Input";
import SelectInput from "../inputs/SelectInput";
import * as EasingFunctions from "@mozillareality/easing-functions";
import { camelPad } from "../utils";
import { SprayCan } from "@styled-icons/fa-solid/SprayCan";
const CurveOptions = Object.keys(EasingFunctions).map(name => ({
  label: camelPad(name),
  value: name
}));
type ParticleEmitterNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class ParticleEmitterNodeEditor extends Component<
  ParticleEmitterNodeEditorProps,
  {}
> {
  static iconComponent = SprayCan;
  static description = "Particle emitter to create particles.";
  updateParticles() {
    for (const node of (this.props.editor as any).selected) {
      node.updateParticles();
    }
  }
  onChangeColorCurve = colorCurve => {
    (this.props.editor as any).setPropertySelected("colorCurve", colorCurve);
  };
  onChangeVelocityCurve = velocityCurve => {
    (this.props.editor as any).setPropertySelected("velocityCurve", velocityCurve);
  };
  onChangeStartColor = startColor => {
    (this.props.editor as any).setPropertySelected("startColor", startColor);
    this.updateParticles();
  };
  onChangeMiddleColor = middleColor => {
    (this.props.editor as any).setPropertySelected("middleColor", middleColor);
  };
  onChangeEndColor = endColor => {
    (this.props.editor as any).setPropertySelected("endColor", endColor);
  };
  onChangeStartOpacity = startOpacity => {
    (this.props.editor as any).setPropertySelected("startOpacity", startOpacity);
  };
  onChangeMiddleOpacity = middleOpacity => {
    (this.props.editor as any).setPropertySelected("middleOpacity", middleOpacity);
  };
  onChangeEndOpacity = endOpacity => {
    (this.props.editor as any).setPropertySelected("endOpacity", endOpacity);
  };
  onChangeSrc = src => {
    (this.props.editor as any).setPropertySelected("src", src);
  };
  onChangeSizeCurve = sizeCurve => {
    (this.props.editor as any).setPropertySelected("sizeCurve", sizeCurve);
  };
  onChangeStartSize = startSize => {
    (this.props.editor as any).setPropertySelected("startSize", startSize);
    this.updateParticles();
  };
  onChangeEndSize = endSize => {
    (this.props.editor as any).setPropertySelected("endSize", endSize);
  };
  onChangeSizeRandomness = sizeRandomness => {
    (this.props.editor as any).setPropertySelected("sizeRandomness", sizeRandomness);
    this.updateParticles();
  };
  onChangeStartVelocity = startVelocity => {
    (this.props.editor as any).setPropertySelected("startVelocity", startVelocity);
  };
  onChangeEndVelocity = endVelocity => {
    (this.props.editor as any).setPropertySelected("endVelocity", endVelocity);
  };
  onChangeAngularVelocity = angularVelocity => {
    (this.props.editor as any).setPropertySelected("angularVelocity", angularVelocity);
  };
  onChangeParticleCount = particleCount => {
    (this.props.editor as any).setPropertySelected("particleCount", particleCount);
    this.updateParticles();
  };
  onChangeLifetime = lifetime => {
    (this.props.editor as any).setPropertySelected("lifetime", lifetime);
    this.updateParticles();
  };
  onChangeAgeRandomness = ageRandomness => {
    (this.props.editor as any).setPropertySelected("ageRandomness", ageRandomness);
    this.updateParticles();
  };
  onChangeLifetimeRandomness = lifetimeRandomness => {
    (this.props.editor as any).setPropertySelected(
      "lifetimeRandomness",
      lifetimeRandomness
    );
    this.updateParticles();
  };
  render() {
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={ParticleEmitterNodeEditor.description}
      >
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Particle Count"
          min={1}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          value={(this.props.node as any).particleCount}
          onChange={this.onChangeParticleCount}
        />
{ /* @ts-ignore */ }
        <InputGroup name="Image">
          <ImageInput value={(this.props.node as any).src} onChange={this.onChangeSrc} />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Age Randomness"
          info="The amount of variation between when particles are spawned."
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={(this.props.node as any).ageRandomness}
          onChange={this.onChangeAgeRandomness}
          unit="s"
        />
{ /* @ts-ignore */ }
        <NumericInputGroup
          name="Lifetime"
          info="The maximum age of a particle before it is respawned."
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={(this.props.node as any).lifetime}
          onChange={this.onChangeLifetime}
          unit="s"
        />
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Lifetime Randomness"
          info="The amount of variation between particle lifetimes."
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={(this.props.node as any).lifetimeRandomness}
          onChange={this.onChangeLifetimeRandomness}
          unit="s"
        />
        { /* @ts-ignore */ }
        <InputGroup name="Size Curve">
        { /* @ts-ignore */ }
          <SelectInput
            options={CurveOptions}
            value={(this.props.node as any).sizeCurve}
            onChange={this.onChangeSizeCurve}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Start Particle Size"
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={(this.props.node as any).startSize}
          onChange={this.onChangeStartSize}
          unit="m"
        />
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="End Particle Size"
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={(this.props.node as any).endSize}
          onChange={this.onChangeEndSize}
          unit="m"
        />
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Size Randomness"
          info="The amount of variation between particle starting sizes."
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={(this.props.node as any).sizeRandomness}
          onChange={this.onChangeSizeRandomness}
          unit="m"
        />
        { /* @ts-ignore */ }
        <InputGroup name="Color Curve">
        { /* @ts-ignore */ }
          <SelectInput
            options={CurveOptions}
            value={(this.props.node as any).colorCurve}
            onChange={this.onChangeColorCurve}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Start Color">
        { /* @ts-ignore */ }
          <ColorInput
            value={(this.props.node as any).startColor}
            onChange={this.onChangeStartColor}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Start Opacity">
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={(this.props.node as any).startOpacity}
            onChange={this.onChangeStartOpacity}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Middle Color">
        { /* @ts-ignore */ }
          <ColorInput
            value={(this.props.node as any).middleColor}
            onChange={this.onChangeMiddleColor}
          />
        </InputGroup>

        { /* @ts-ignore */ }
        <InputGroup name="Middle Opacity">
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={(this.props.node as any).middleOpacity}
            onChange={this.onChangeMiddleOpacity}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="End Color">
        { /* @ts-ignore */ }
          <ColorInput
            value={(this.props.node as any).endColor}
            onChange={this.onChangeEndColor}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="End Opacity">
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={(this.props.node as any).endOpacity}
            onChange={this.onChangeEndOpacity}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Velocity Curve">
        { /* @ts-ignore */ }
          <SelectInput
            options={CurveOptions}
            value={(this.props.node as any).velocityCurve}
            onChange={this.onChangeVelocityCurve}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Start Velocity">
          <Vector3Input
            value={(this.props.node as any).startVelocity}
            /* @ts-ignore */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeStartVelocity}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="End Velocity">
          <Vector3Input
            value={(this.props.node as any).endVelocity}
            /* @ts-ignore */
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeEndVelocity}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Angular Velocity"
          min={-100}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          value={(this.props.node as any).angularVelocity}
          onChange={this.onChangeAngularVelocity}
          unit="°/s"
        />
      </NodeEditor>
    );
  }
}
