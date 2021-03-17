import React from "react";
import PropTypes from "prop-types";
import Slider from "./Slider";
import NumericInput from "./NumericInput";
import styled from "styled-components";

/**
 * [StyledCompoundNumericInput used to provide styles for CompoundNumericInput]
 * @type {Styled component}
 */
const StyledCompoundNumericInput = (styled as any).div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

/**
 * [CompoundNumericInput used to render the view of component]
 * @param       {number} value
 * @param       {function} onChange
 * @param       {any} extras
 * @constructor
 */
export default function CompoundNumericInput({ value, onChange, ...extras }) {
  const { min, max, step } = extras;
  return (
    <StyledCompoundNumericInput>
      <Slider min={min} max={max} value={value} step={step} onChange={onChange} />
      { /* @ts-ignore */ }
      <NumericInput {...extras} mediumStep={step} value={value} onChange={onChange} />
    </StyledCompoundNumericInput>
  );
}

/**
 * [defaultProps used to set default properties for CompoundNumericInput component]
 * @type {Object}
 */

CompoundNumericInput.defaultProps = {
  value: 0,
  onChange: () => {},
  min: 0,
  max: 1,
  step: 0.01
};

/**
 * [declaring protoTypes for CompoundNumericInput]
 * @type {Object}
 */
CompoundNumericInput.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func
};
